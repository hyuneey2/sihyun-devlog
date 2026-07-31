import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const workerPromise = import(workerUrl.href).then(({ default: worker }) => worker);

async function renderPage(path) {
  const worker = await workerPromise;
  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders development preview metadata", async () => {
  const response = await renderPage("/");

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("groups a series in the public posts list", async () => {
  const response = await renderPage("/posts");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /class="series-post-card"/);
  assert.match(html, /Node\.js 스터디/);
  assert.match(html, /9(?:<!-- -->)?개의 글/);
  assert.match(html, /01(?:<!-- -->)?부터 읽기/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, />SQL 조회와 페이지네이션</);
  assert.doesNotMatch(html, />JWT 인증과 Google OAuth 로그인</);
  assert.equal(html.match(/class="pagination-link"/g)?.length, 3);
});

test("keeps grouping after the category filter and out of the home list", async () => {
  const [backendResponse, homeResponse] = await Promise.all([
    renderPage("/posts?category=Backend"),
    renderPage("/"),
  ]);
  const [backendHtml, homeHtml] = await Promise.all([
    backendResponse.text(),
    homeResponse.text(),
  ]);

  assert.equal(backendResponse.status, 200);
  assert.equal(backendHtml.match(/class="series-post-card"/g)?.length, 1);
  assert.match(backendHtml, /Node\.js 스터디/);
  assert.doesNotMatch(backendHtml, />SQL 조회와 페이지네이션</);
  assert.doesNotMatch(homeHtml, /class="series-post-card"/);
});

test("connects only the previous and next posts in the same series", async () => {
  const response = await renderPage("/posts/node-study-03-rest-api");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /class="article-series"/);
  assert.match(html, /03<!-- --> \/<!-- --> <!-- -->09/);
  assert.match(html, /href="\/posts\/node-study-02-sql-pagination"/);
  assert.match(html, /href="\/posts\/node-study-04-node-express"/);
  assert.doesNotMatch(html, /href="\/posts\/react-study-routing-and-api"/);
});

test("omits unavailable series directions and keeps regular posts unchanged", async () => {
  const [firstResponse, lastResponse, regularResponse] = await Promise.all([
    renderPage("/posts/node-study-01-database-design"),
    renderPage("/posts/node-study-09-jwt-oauth"),
    renderPage("/posts/web-foundation-before-react"),
  ]);
  const [firstHtml, lastHtml, regularHtml] = await Promise.all([
    firstResponse.text(),
    lastResponse.text(),
    regularResponse.text(),
  ]);

  assert.doesNotMatch(firstHtml, /series-navigation-previous"/);
  assert.match(firstHtml, /href="\/posts\/node-study-02-sql-pagination"/);
  assert.match(lastHtml, /href="\/posts\/node-study-08-cors-swagger"/);
  assert.doesNotMatch(lastHtml, /series-navigation-next"/);
  assert.doesNotMatch(regularHtml, /class="article-series"/);
  assert.doesNotMatch(regularHtml, /class="series-navigation"/);
});
