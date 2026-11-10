import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";

const slugs = new Set();
const orders = new Set();
let added = 0;
for (const file of fs
  .readdirSync("content/posts")
  .filter((f) => f.endsWith(".md"))) {
  const source = fs.readFileSync(`content/posts/${file}`, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(match, `${file}: frontmatter`);
  const meta = parse(match[1]);
  const slug = file.slice(0, -3);
  assert.ok(!slugs.has(slug), `duplicate slug: ${slug}`);
  slugs.add(slug);
  for (const field of ["title", "description", "date", "category"])
    assert.ok(meta[field], `${file}: ${field}`);
  if (meta.series) {
    assert.ok(
      Number.isInteger(meta.seriesOrder) && meta.seriesOrder > 0,
      `${file}: order`,
    );
    const key = `${meta.series}:${meta.seriesOrder}`;
    assert.ok(!orders.has(key), `duplicate series order: ${key}`);
    orders.add(key);
  }
  if (/^(unstiff|locallens)-/.test(slug)) {
    added++;
    const tag = slug.startsWith("unstiff-") ? "Unstiff" : "LocalLens";
    assert.equal(meta.category, "Frontend");
    assert.equal(meta.date, "2026-11-10");
    assert.ok(meta.tags.includes(tag));
    assert.equal(meta.series, `${tag} 개발기`);
    assert.ok(source.includes("## 참고한 변경과 코드"), `${file}: sources`);
    assert.ok(source.includes("https://github.com/"), `${file}: code evidence`);
    assert.ok(source.split("```").length % 2 === 1, `${file}: fenced code`);
  }
}
console.log(
  `Validated ${slugs.size} posts, ${added} new project posts; no duplicate slugs or series orders.`,
);
