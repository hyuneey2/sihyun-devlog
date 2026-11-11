import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";

const articles = JSON.parse(
  await readFile(
    new URL("../docs/new-article-sources.json", import.meta.url),
    "utf8",
  ),
);
const mf = new Miniflare({
  modules: true,
  script:
    'export default { fetch() { return new Response("local D1 fixture"); } }',
  compatibilityDate: "2026-05-22",
  d1Databases: ["DB"],
  d1Persist: false,
});

try {
  const d1 = await mf.getD1Database("DB");
  // Use the repository's real migrations against an ephemeral workerd D1.
  for (const file of [
    "0000_grey_marvel_zombies.sql",
    "0001_cute_vindicator.sql",
  ]) {
    const sql = await readFile(
      new URL(`../drizzle/${file}`, import.meta.url),
      "utf8",
    );
    for (const statement of sql
      .split("--> statement-breakpoint")
      .filter((s) => s.trim())) {
      await d1.prepare(statement).run();
    }
  }
  await d1
    .prepare("INSERT INTO blog_settings VALUES (?, ?, ?)")
    .bind("initial_markdown_seed_v2", "completed", "old-marker")
    .run();
  await d1
    .prepare(
      `INSERT INTO posts (
    id, slug, title, description, content, category, tags, status,
    published_at, created_at, updated_at, author_email
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      "admin-existing",
      "repeat-schedule-group",
      "관리자 원본",
      "기존 설명",
      "관리자 수정 본문",
      "Backend",
      '["Dailog"]',
      "published",
      "2026-07-28",
      "created-original",
      "edited-original",
      "admin",
    )
    .run();
  const before = await d1
    .prepare("SELECT * FROM posts WHERE id = 'admin-existing'")
    .first();
  const env = {
    DB: d1,
    ASSETS: { fetch: async () => new Response("not found", { status: 404 }) },
  };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const builtUrl = new URL("../dist/server/index.js", import.meta.url);
  const { default: worker } = await import(builtUrl.href);
  const render = async (path) => {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, {
        headers: { accept: "text/html" },
      }),
      env,
      ctx,
    );
    assert.equal(response.status, 200, path);
    return response.text();
  };
  await render("/posts");
  const after = await d1
    .prepare("SELECT * FROM posts WHERE id = 'admin-existing'")
    .first();
  assert.deepEqual(after, before);
  assert.equal(
    (await d1.prepare("SELECT COUNT(*) AS n FROM posts").first()).n,
    26,
  );
  for (const article of articles) {
    const row = await d1
      .prepare("SELECT * FROM posts WHERE slug = ?")
      .bind(article.slug)
      .first();
    assert.ok(row, article.slug);
    assert.equal(row.title, article.title);
    const html = await render(`/posts/${article.slug}`);
    assert.ok(html.includes(article.title));
  }
  for (const project of ["unstiff", "locallens"]) {
    const html = await render(`/projects/${project}`);
    for (const article of articles.filter((p) => p.project === project)) {
      assert.ok(html.includes(`href="/posts/${article.slug}"`));
    }
  }
  assert.equal(
    (
      await d1
        .prepare(
          `SELECT COUNT(*) AS n FROM (
    SELECT slug FROM posts GROUP BY slug HAVING COUNT(*) > 1
  )`,
        )
        .first()
    ).n,
    0,
  );
  assert.equal(
    (
      await d1
        .prepare(
          `SELECT COUNT(*) AS n FROM (
    SELECT series, series_order FROM posts WHERE series IS NOT NULL
    GROUP BY series, series_order HAVING COUNT(*) > 1
  )`,
        )
        .first()
    ).n,
    0,
  );

  // A new isolate must honor the ledger, edited drafts and administrator deletion.
  const edited = articles[0].slug;
  const deleted = articles[1].slug;
  await d1
    .prepare(
      "UPDATE posts SET content = ?, status = 'draft', updated_at = 'admin-edit' WHERE slug = ?",
    )
    .bind("관리자 신규 글 수정", edited)
    .run();
  await d1.prepare("DELETE FROM posts WHERE slug = ?").bind(deleted).run();
  const nextUrl = new URL(builtUrl);
  nextUrl.searchParams.set("isolate", "second");
  const { default: second } = await import(nextUrl.href);
  await second.fetch(new Request("http://localhost/posts"), env, ctx);
  assert.equal(
    (await d1.prepare("SELECT COUNT(*) AS n FROM posts").first()).n,
    25,
  );
  assert.equal(
    (
      await d1
        .prepare("SELECT content FROM posts WHERE slug = ?")
        .bind(edited)
        .first()
    ).content,
    "관리자 신규 글 수정",
  );
  assert.equal(
    await d1
      .prepare("SELECT id FROM posts WHERE slug = ?")
      .bind(deleted)
      .first(),
    null,
  );

  await d1
    .prepare(
      "UPDATE posts SET status = 'draft' WHERE series = 'Unstiff 개발기'",
    )
    .run();
  const empty = await render("/projects/unstiff");
  assert.ok(empty.includes("태그가 달린 글이 아직 없습니다."));
  console.log(
    "PASS: local workerd D1: 25 new articles rendered; v2/admin row preserved; no duplicate slug/order; edits/deletion and empty state preserved.",
  );
} finally {
  await mf.dispose();
}
