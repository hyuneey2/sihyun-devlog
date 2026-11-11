import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../lib/projects.ts";
import { readFile } from "node:fs/promises";

const newArticles = JSON.parse(
  await readFile(
    new URL("../docs/new-article-sources.json", import.meta.url),
    "utf8",
  ),
);

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const workerPromise = import(workerUrl.href).then(
  ({ default: worker }) => worker,
);

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
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(await response.text(), developmentPreviewMeta);
});

test("new project pages expose all series posts, preview alt and metadata", async () => {
  for (const slug of ["unstiff", "locallens"]) {
    const response = await renderPage(`/projects/${slug}`);
    const html = await response.text();
    const articles = newArticles.filter((p) => p.project === slug);
    assert.equal(response.status, 200);
    assert.equal(
      html.match(/class="project-related-post"/g)?.length,
      articles.length,
    );
    assert.match(html, /<meta name="description" content="/);
    if (slug === "locallens") {
      assert.match(
        html,
        /<iframe[^>]+title="LocalLens 실제 웹사이트 미리보기"/,
      );
      assert.match(html, /이미지로 보기/);
    } else {
      assert.match(html, /<img[^>]+alt="[^"]+"/);
      assert.match(html, /src="\/projects\/unstiff-project-preview.webp"/);
      assert.match(html, /width="1920" height="1080"/);
    }
    for (const article of articles)
      assert.ok(html.includes(`href="/posts/${article.slug}"`));
  }
});

test("all new articles render content, sources, tags, metadata and series neighbors", async () => {
  for (const article of newArticles) {
    const response = await renderPage(`/posts/${article.slug}`);
    const html = await response.text();
    const series = newArticles
      .filter((p) => p.project === article.project)
      .sort((a, b) => a.order - b.order);
    const previous = series[article.order - 2];
    const next = series[article.order];
    assert.equal(response.status, 200, article.slug);
    assert.ok(html.includes(article.title), article.slug);
    assert.ok(html.includes(article.description), article.slug);
    assert.match(html, /class="article-series"/);
    assert.match(html, /참고한 변경과 코드/);
    assert.match(html, /<meta name="description"/);
    for (const neighbor of [previous, next].filter(Boolean)) {
      assert.ok(html.includes(`href="/posts/${neighbor.slug}"`), article.slug);
    }
    if (!previous) assert.doesNotMatch(html, /series-navigation-previous"/);
    if (!next) assert.doesNotMatch(html, /series-navigation-next"/);
    for (const [, url] of article.refs)
      assert.ok(
        html.includes(url.replaceAll("&", "&amp;")),
        `${article.slug}: ${url}`,
      );
  }
});

test("unknown project and post return 404", async () => {
  assert.equal((await renderPage("/projects/not-a-real-project")).status, 404);
  assert.equal((await renderPage("/posts/not-a-real-post")).status, 404);
});

test("renders the breathing hero aurora without the home avatar", async () => {
  const response = await renderPage("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /class="hero-aurora-layer/);
  assert.match(html, /from-green-200\/80/);
  assert.doesNotMatch(html, /class="home-avatar"/);
});

test("renders accessible glowing cards for every registered project", async () => {
  const response = await renderPage("/projects");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.equal(
    html.match(/class="project-row glowing-card/g)?.length,
    projects.length,
  );
  assert.equal(html.match(/from-emerald-200/g)?.length, projects.length);
  assert.match(html, /aria-label="HUFS 독서마라톤 프로젝트 보기"/);
  assert.match(html, /aria-label="Dailog 프로젝트 보기"/);
  assert.match(html, /aria-label="withChurch 프로젝트 보기"/);
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
  assert.equal(html.match(/class="pagination-link"/g)?.length, 4);
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

test("shows every project-tagged post and preserves existing project metadata", async () => {
  const [withchurchResponse, readingResponse, dailogResponse] =
    await Promise.all([
      renderPage("/projects/withchurch"),
      renderPage("/projects/reading-marathon"),
      renderPage("/projects/dailog"),
    ]);
  const [withchurchHtml, readingHtml, dailogHtml] = await Promise.all([
    withchurchResponse.text(),
    readingResponse.text(),
    dailogResponse.text(),
  ]);

  assert.equal(withchurchResponse.status, 200);
  assert.equal(readingResponse.status, 200);
  assert.equal(dailogResponse.status, 200);
  assert.match(withchurchHtml, /href="\/posts\/post-202607311527"/);
  assert.match(withchurchHtml, /href="\/posts\/post-202607311538"/);
  assert.match(withchurchHtml, /href="\/posts\/post-202607311554"/);
  assert.match(withchurchHtml, /href="\/posts\/post-202607311619"/);
  assert.match(readingHtml, /href="\/posts\/reading-marathon-frontend"/);
  assert.match(dailogHtml, /href="\/posts\/repeat-schedule-group"/);
  assert.match(withchurchHtml, /Frontend 3명/);
  assert.match(withchurchHtml, /Frontend(?:<!-- -->)? ·(?:<!-- -->)? 90%/);
  assert.match(readingHtml, /Frontend 1명/);
  assert.match(readingHtml, /Frontend(?:<!-- -->)? ·(?:<!-- -->)? 100%/);
  assert.match(dailogHtml, /Frontend 4명/);
  assert.match(dailogHtml, /Backend(?:<!-- -->)? ·(?:<!-- -->)? 60%/);
  assert.match(withchurchHtml, /#(?:<!-- -->)?withchurch/);
  assert.doesNotMatch(
    withchurchHtml,
    /운영 중인 화면을 안정적으로 개선하는 방법/,
  );
  assert.ok(
    (withchurchHtml.match(/class="project-related-post"/g)?.length ?? 0) === 4,
  );
});
