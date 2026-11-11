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
const output = "outputs/project-preview-qa";
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
  const policyErrors = [];
  function send(method, params = {}, sessionId) {
    const callId = ++id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(callId);
        reject(new Error(`CDP timeout: ${method}`));
      }, 15000);
      pending.set(callId, { resolve, reject, timer });
      ws.send(JSON.stringify({ id: callId, method, params, sessionId }));
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
    if (
      message.method === "Log.entryAdded" &&
      /frame-ancestors|X-Frame-Options|Refused to (display|frame)/i.test(
        message.params.entry.text,
      )
    )
      policyErrors.push(message.params.entry.text);
    if (message.method === "Runtime.exceptionThrown")
      errors.push(message.params.exceptionDetails.text);
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  const evaluate = async (expression, sessionId) => {
    const r = await send(
      "Runtime.evaluate",
      {
        expression,
        returnByValue: true,
        awaitPromise: true,
      },
      sessionId,
    );
    assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const layouts = [];
  const embeds = [];
  const paths = [
    "/projects",
    ...["locallens", "reading-marathon", "unstiff", "dailog", "withchurch"].map(
      (s) => `/projects/${s}`,
    ),
  ];
  async function waitFor(check, message, attempts = 100) {
    for (let i = 0; i < attempts; i++) {
      if (await check()) return;
      await delay(100);
    }
    assert.fail(message);
  }
  async function navigate(path, width) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: width < 500,
    });
    await send("Page.navigate", { url: `${base}${path}` });
    await waitFor(
      () =>
        evaluate(
          `location.pathname === ${JSON.stringify(path)} && !!document.querySelector('h1') && document.readyState !== 'loading'`,
        ),
      path,
    );
    await delay(450);
  }
  for (const width of [1440, 820, 390]) {
    for (const path of paths) {
      assert.equal((await fetch(`${base}${path}`)).status, 200, path);
      await navigate(path, width);
      await waitFor(
        () =>
          evaluate(
            "[...document.querySelectorAll('main img')].every(i => i.complete && i.naturalWidth > 0)",
          ),
        `${path} image load`,
      );
      for (const theme of ["light", "dark"]) {
        await evaluate(
          `document.documentElement.dataset.theme = ${JSON.stringify(theme)}; localStorage.setItem('sihyun-theme', ${JSON.stringify(theme)});`,
        );
        await delay(100);
        const layout = await evaluate(
          `({width:innerWidth, scroll:document.documentElement.scrollWidth, cards:document.querySelectorAll('.project-row').length, related:document.querySelectorAll('.project-related-post').length, summary:document.querySelector('.project-detail-summary')?.textContent, status:document.querySelector('.projects-kicker')?.textContent, image:(()=>{const i=document.querySelector('.project-preview-wide');return i && {width:i.clientWidth,height:i.clientHeight,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,fit:getComputedStyle(i).objectFit,frameWidth:i.parentElement.clientWidth}})(), primary:(()=>{const a=document.querySelector('.project-action-primary');return a && {text:a.textContent.trim(),href:a.href,target:a.target,rel:a.rel}})(), github:[...document.querySelectorAll('.project-detail-actions a')].some(a=>a.textContent.includes('GitHub'))})`,
        );
        assert.ok(
          layout.scroll <= layout.width + 1,
          `${path} ${width}: horizontal overflow`,
        );
        if (path === "/projects") assert.equal(layout.cards, 5);
        else assert.ok(layout.github, `${path} GitHub link`);
        if (path === "/projects/unstiff") {
          assert.equal(layout.related, 15);
          assert.equal(layout.image.fit, "contain");
          assert.equal(layout.image.naturalWidth, 1920);
          assert.equal(layout.image.naturalHeight, 1080);
          assert.ok(
            Math.abs(layout.image.width / layout.image.height - 16 / 9) < 0.02,
          );
          assert.equal(layout.image.width, layout.image.frameWidth);
          assert.match(layout.primary.text, /App Store에서 다운로드/);
          assert.ok(layout.primary.href.endsWith("id6805492123"));
          assert.equal(layout.primary.target, "_blank");
          assert.match(layout.primary.rel, /noreferrer/);
        }
        if (path === "/projects/locallens") {
          assert.equal(layout.related, 10);
          assert.match(layout.summary, /72개 지역/);
          assert.doesNotMatch(layout.summary, /59개/);
        }
        if (path === "/projects/dailog")
          assert.equal(layout.status, "UMC 10기 팀 프로젝트");
        if (
          ["/projects/locallens", "/projects/reading-marathon"].includes(path)
        )
          assert.match(layout.primary.text, /사이트 방문/);
        const shot = await send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: false,
        });
        await writeFile(
          `${output}/${path.split("/").filter(Boolean).join("-")}-${width}-${theme}.png`,
          Buffer.from(shot.data, "base64"),
        );
        layouts.push({ path, width, theme, ...layout });
      }
    }
    console.log(`Layouts passed: ${width}px, both themes, all six routes`);
  }
  for (const width of [1440, 390]) {
    for (const [slug, host, text] of [
      ["locallens", "villagecoverage-ai.pages.dev", "우리 군에 한 해 6억"],
      ["reading-marathon", "readmarathon.hufs.ac.kr", "제5회 독서마라톤"],
    ]) {
      const path = `/projects/${slug}`;
      await navigate(path, width);
      await evaluate(
        "document.querySelector('.project-live-preview iframe').scrollIntoView({block:'center'})",
      );
      assert.ok(
        await evaluate(
          "(()=>{const f=document.querySelector('.project-live-preview iframe');return f.title && f.loading==='lazy' && f.clientWidth===f.parentElement.clientWidth})()",
        ),
      );
      let frame;
      await waitFor(
        async () => {
          frame = (await send("Target.getTargets")).targetInfos.find(
            (t) => t.type === "iframe" && t.url.startsWith(`https://${host}/`),
          );
          return !!frame;
        },
        `${slug} live iframe target`,
        150,
      );
      const { sessionId } = await send("Target.attachToTarget", {
        targetId: frame.targetId,
        flatten: true,
      });
      await send("Log.enable", {}, sessionId);
      await waitFor(
        () =>
          evaluate(
            `document.body.innerText.includes(${JSON.stringify(text)})`,
            sessionId,
          ),
        `${slug} live main content`,
        200,
      );
      await delay(800);
      const desktopOnlyNotice = await evaluate(
        "[...document.querySelectorAll('h1,h2,h3,p')].some(e => e.innerText.includes('PC 화면으로 확인') && e.getBoundingClientRect().height > 0)",
        sessionId,
      );
      const parentScroll = await evaluate("scrollY");
      let scroll = null;
      if (desktopOnlyNotice) {
        assert.equal(slug, "locallens");
        assert.equal(width, 390);
      } else {
        const scrollPosition =
          "[...document.querySelectorAll('*')].reduce((sum,e)=>sum+e.scrollTop,0)";
        const before = await evaluate(scrollPosition, sessionId);
        const point = await evaluate(
          "(()=>{const r=document.querySelector('.project-live-preview iframe').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+200}})()",
        );
        await send("Input.dispatchMouseEvent", {
          type: "mouseWheel",
          ...point,
          deltaX: 0,
          deltaY: 250,
        });
        await waitFor(
          async () => (await evaluate(scrollPosition, sessionId)) > before,
          `${slug} independent wheel scroll at ${width}`,
        );
        scroll = { before, after: await evaluate(scrollPosition, sessionId) };
      }
      assert.equal(
        await evaluate("scrollY"),
        parentScroll,
        `${slug} parent did not scroll`,
      );
      await evaluate(
        "for(const e of document.querySelectorAll('*'))if(e.scrollTop)e.scrollTo({top:0,behavior:'instant'})",
        sessionId,
      );
      await delay(200);
      const live = await evaluate(
        "({title:document.title,url:location.href,text:document.body.innerText.slice(0,150),width:innerWidth,scrollWidth:document.documentElement.scrollWidth})",
        sessionId,
      );
      await send("Target.detachFromTarget", { sessionId });
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      await writeFile(
        `${output}/${slug}-live-${width}.png`,
        Buffer.from(shot.data, "base64"),
      );
      const before = await evaluate(
        "document.querySelector('.project-live-preview-viewport').clientHeight",
      );
      await evaluate(
        "document.querySelector('.project-preview-controls button').click()",
      );
      await waitFor(
        () =>
          evaluate(
            "!!document.querySelector('.project-live-preview-viewport img')?.complete && document.querySelector('.project-live-preview-viewport img').naturalWidth > 0",
          ),
        `${slug} fallback image`,
      );
      assert.equal(
        await evaluate(
          "document.querySelector('.project-live-preview iframe')",
        ),
        null,
      );
      assert.equal(
        await evaluate(
          "document.querySelector('.project-preview-controls button').getAttribute('aria-pressed')",
        ),
        "true",
      );
      assert.equal(
        await evaluate(
          "document.querySelector('.project-live-preview-viewport').clientHeight",
        ),
        before,
      );
      assert.ok(
        await evaluate(
          `(()=>{const a=document.querySelector('.project-preview-controls a');return a.href.startsWith('https://${host}/') && a.target==='_blank'})()`,
        ),
      );
      await evaluate(
        "document.querySelector('.project-preview-controls button').click()",
      );
      await waitFor(
        () =>
          evaluate("!!document.querySelector('.project-live-preview iframe')"),
        `${slug} return to live preview`,
      );
      embeds.push({
        slug,
        width,
        live,
        scroll,
        desktopOnlyNotice,
        fallback: true,
        stableHeight: before,
      });
      console.log(
        `Live iframe and fallback passed: ${slug} ${width}px (${desktopOnlyNotice ? "upstream PC-only notice" : "independent wheel scroll"})`,
      );
    }
  }
  assert.deepEqual(
    policyErrors,
    [],
    "No X-Frame-Options/frame-ancestors errors",
  );
  assert.deepEqual(errors, [], "No parent page JavaScript exceptions");
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ layouts, embeds, policyErrors, errors }, null, 2),
  );
  console.log(
    `Passed ${layouts.length} layout cases and ${embeds.length} live iframe cases. Evidence: ${output}`,
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
