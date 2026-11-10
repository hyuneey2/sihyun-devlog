import assert from "node:assert/strict";
import test from "node:test";
import { seedBundledPosts, INITIAL_SEED_KEY } from "../lib/post-seeding.ts";
import { createLocalD1 } from "./helpers/sqlite-d1.mjs";

function post(slug, order = 1, series = "Unstiff 개발기") {
  return {
    id: `seed-${slug}`, slug, title: slug, description: "설명", content: "본문",
    category: "Frontend", tags: ["Unstiff"], series, seriesOrder: order,
    status: "published", publishedAt: "2026-11-10T00:00:00.000Z",
  };
}

test("빈 DB와 기존 v2 DB 모두 신규 글을 증분 등록한다", async () => {
  for (const legacy of [false, true]) {
    const { db, d1 } = createLocalD1();
    if (legacy) db.prepare("INSERT INTO blog_settings VALUES (?, 'completed', 'old')").run(INITIAL_SEED_KEY);
    await seedBundledPosts(d1, [post("unstiff-health", 1)]);
    await seedBundledPosts(d1, [post("unstiff-health", 1), post("unstiff-kakao", 2)]);
    await seedBundledPosts(d1, [post("unstiff-health", 1), post("unstiff-kakao", 2)]);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM posts").get().n, 2);
    db.close();
  }
});

test("관리자 수정·초안·날짜·작성자·별도 작성 글을 바꾸지 않는다", async () => {
  const { db, d1 } = createLocalD1();
  await seedBundledPosts(d1, [post("existing")]);
  db.exec("UPDATE posts SET content = '관리자 수정', title = '수정 제목', status = 'draft', updated_at = 'edited', author_email = 'admin'");
  const before = db.prepare("SELECT * FROM posts").all();
  await seedBundledPosts(d1, [{ ...post("existing"), content: "새 Markdown" }, post("new", 2)]);
  assert.deepEqual(db.prepare("SELECT * FROM posts WHERE slug = 'existing'").all(), before);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM posts").get().n, 2);
  db.close();
});

test("v2에서 삭제된 기존 글과 증분 등록 후 삭제한 신규 글을 되살리지 않는다", async () => {
  const { db, d1 } = createLocalD1();
  db.prepare("INSERT INTO blog_settings VALUES (?, 'completed', 'old')").run(INITIAL_SEED_KEY);
  const posts = [post("repeat-schedule-group"), post("new", 2)];
  await seedBundledPosts(d1, posts);
  assert.deepEqual(db.prepare("SELECT slug FROM posts").all().map(p => p.slug), ["new"]);
  db.exec("DELETE FROM posts WHERE slug = 'new'");
  await seedBundledPosts(d1, posts);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM posts").get().n, 0);
  db.close();
});

test("slug 및 id 소유자를 보존하고 충돌 글을 덮어쓰지 않는다", async () => {
  const { db, d1 } = createLocalD1();
  await seedBundledPosts(d1, [post("occupied")]);
  db.exec("UPDATE posts SET id = 'admin-id', content = 'admin'");
  const before = db.prepare("SELECT * FROM posts").all();
  db.exec("DELETE FROM blog_settings WHERE key LIKE 'bundled_markdown_post_v1:%'");
  await seedBundledPosts(d1, [post("occupied", 2)]);
  assert.deepEqual(db.prepare("SELECT * FROM posts").all(), before);
  db.close();
});

test("시리즈 순서 충돌은 건너뛰고 해결 후 재실행하면 등록한다", async () => {
  const { db, d1 } = createLocalD1();
  await seedBundledPosts(d1, [post("admin")]);
  const result = await seedBundledPosts(d1, [post("new")]);
  assert.deepEqual(result.conflicts, ["new"]);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM posts").get().n, 1);
  db.exec("UPDATE posts SET series_order = 3");
  assert.deepEqual(await seedBundledPosts(d1, [post("new")]), { conflicts: [] });
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM posts").get().n, 2);
  db.close();
});

test("batch 실패 시 글과 이력을 함께 롤백하며 재시도할 수 있다", async () => {
  const { db, d1, failBatch } = createLocalD1();
  failBatch();
  await assert.rejects(seedBundledPosts(d1, [post("new")]), /injected D1 failure/);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM posts").get().n, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM blog_settings WHERE key LIKE 'bundled_markdown_post_v1:%'").get().n, 0);
  await seedBundledPosts(d1, [post("new")]);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM posts").get().n, 1);
  db.close();
});

test("동시 초기화와 여러 batch에서도 slug와 순서가 중복되지 않는다", async () => {
  const { db, d1 } = createLocalD1();
  const posts = Array.from({ length: 45 }, (_, i) => post(`post-${i}`, i + 1));
  await Promise.all([seedBundledPosts(d1, posts), seedBundledPosts(d1, posts)]);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM posts").get().n, 45);
  assert.equal(db.prepare("SELECT COUNT(DISTINCT slug) AS n FROM posts").get().n, 45);
  db.close();
});
