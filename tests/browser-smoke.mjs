import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const bin = process.env.CHROMIUM_BIN;
assert.ok(bin, "Set CHROMIUM_BIN to a local Chromium executable.");
const base = process.env.BLOG_TEST_URL ?? "http://127.0.0.1:4173";
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Browser QA must use a local server.",
);
const output = "outputs/browser-qa";
await mkdir(output, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), "devlog-browser-"));
const chrome = spawn(
  bin,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let ws;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try {
      port = (
        await readFile(join(profile, "DevToolsActivePort"), "utf8")
      ).split("\n")[0];
      break;
    } catch {
      await delay(100);
    }
  }
  assert.ok(port, "Chromium did not start");
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
      method: "PUT",
    })
  ).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  const errors = [];
  function send(method, params = {}) {
    const callId = ++id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(callId);
        reject(new Error(`CDP timeout: ${method}`));
      }, 15000);
      pending.set(callId, { resolve, reject, timer });
      ws.send(JSON.stringify({ id: callId, method, params }));
    });
  }
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    const call = pending.get(message.id);
    if (call) {
      pending.delete(message.id);
      clearTimeout(call.timer);
      if (message.error) call.reject(new Error(JSON.stringify(message.error)));
      else call.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown")
      errors.push(message.params.exceptionDetails.text);
    if (message.method === "Fetch.requestPaused") {
      const { request, requestId } = message.params;
      const local =
        request.url.startsWith(base) || request.url.startsWith("data:");
      send(
        local ? "Fetch.continueRequest" : "Fetch.failRequest",
        local ? { requestId } : { requestId, errorReason: "BlockedByClient" },
      ).catch((e) => errors.push(e.message));
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const cases = [];
  const paths = [
    "/projects",
    "/projects/unstiff",
    "/projects/locallens",
    "/posts",
    "/posts/unstiff-submit-lock-after-navigation",
    "/posts/locallens-snapshot-fallback-and-recovery",
  ];
  for (const width of [1440, 390]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 500,
    });
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    for (const theme of ["light", "dark"]) {
      for (const path of paths) {
        const response = await fetch(`${base}${path}`);
        assert.equal(response.status, 200, path);
        await send("Page.navigate", { url: `${base}${path}` });
        let ready = false;
        for (let i = 0; i < 100; i++) {
          ready = await evaluate(
            `location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete' && !!document.querySelector('h1')`,
          );
          if (ready) break;
          await delay(100);
        }
        assert.ok(ready, path);
        await evaluate(
          `document.documentElement.dataset.theme = ${JSON.stringify(theme)}; localStorage.setItem('sihyun-theme', ${JSON.stringify(theme)});`,
        );
        await delay(350);
        const layout = await evaluate(
          `({ width: innerWidth, scroll: document.documentElement.scrollWidth, images: [...document.querySelectorAll('main img')].every(i => i.complete && i.naturalWidth > 0), title: document.title, related: document.querySelectorAll('.project-related-post').length, cards: document.querySelectorAll('.project-row').length })`,
        );
        assert.ok(
          layout.scroll <= layout.width + 1,
          `${path} ${width}: horizontal overflow ${layout.scroll}/${layout.width}`,
        );
        assert.ok(layout.images, `${path}: image load`);
        if (path === "/projects") assert.equal(layout.cards, 5);
        if (path === "/projects/unstiff") assert.equal(layout.related, 15);
        if (path === "/projects/locallens") assert.equal(layout.related, 10);
        if (path === "/posts") {
          await evaluate(
            "document.querySelector('.series-toc-toggle').click()",
          );
          await delay(100);
          assert.equal(
            await evaluate(
              "document.querySelector('.series-toc-toggle').getAttribute('aria-expanded')",
            ),
            "true",
          );
          assert.ok(
            await evaluate(
              "document.querySelectorAll('.series-post-toc-link').length > 0",
            ),
          );
        }
        const name = `${path.split("/").filter(Boolean).join("-")}-${width}-${theme}`;
        const shot = await send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: false,
        });
        await writeFile(
          `${output}/${name}.png`,
          Buffer.from(shot.data, "base64"),
        );
        cases.push({ path, width, theme, ...layout });
      }
    }
  }
  assert.deepEqual(errors, [], "Browser runtime exceptions");
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ cases, runtimeExceptions: errors }, null, 2),
  );
  console.log(
    `PASS: ${cases.length} Chromium scenarios; 1440/390px, light/dark, no horizontal overflow or runtime exceptions; series expands.`,
  );
} finally {
  ws?.close();
  chrome.kill("SIGTERM");
  await new Promise((resolve) => {
    if (chrome.exitCode !== null) resolve();
    else {
      chrome.once("exit", resolve);
      setTimeout(() => {
        chrome.kill("SIGKILL");
        resolve();
      }, 2000).unref();
    }
  });
  await rm(profile, { recursive: true, force: true });
}
