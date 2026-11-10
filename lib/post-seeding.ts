import type { D1Database } from "@cloudflare/workers-types";
import type { PostInput } from "./post-types";

export const INITIAL_SEED_KEY = "initial_markdown_seed_v2";
const POST_SEED_PREFIX = "bundled_markdown_post_v1:";
const LEDGER_KEY = "incremental_markdown_ledger_v1";

type SeedPost = PostInput & { id: string; publishedAt: string };

// Freeze the v2 baseline: an administrator may have deleted one of these posts.
// A completed v2 import must never resurrect it during the ledger migration.
const LEGACY_SLUGS = new Set<string>([
  "algorithm-binary-search-tree-cutting",
  "algorithm-brute-force-seven-dwarfs",
  "algorithm-core-laboratory",
  "algorithm-dfs-bfs-backtracking",
  "algorithm-dynamic-programming-make-one",
  "algorithm-greedy-big-number",
  "algorithm-study-solving-criteria",
  "frontend-before-api-integration",
  "node-study-01-database-design",
  "node-study-02-sql-pagination",
  "node-study-03-rest-api",
  "node-study-04-node-express",
  "node-study-05-typescript-api",
  "node-study-06-orm-migration",
  "node-study-07-middleware-error",
  "node-study-08-cors-swagger",
  "node-study-09-jwt-oauth",
  "node-study-server-flow",
  "post-202607311527",
  "post-202607311538",
  "post-202607311554",
  "post-202607311619",
  "react-study-routing-and-api",
  "reading-marathon-frontend",
  "repeat-schedule-group",
  "web-foundation-before-react",
]);

// The caller creates posts/blog_settings first. Only missing posts are inserted;
// content, publication state, author and timestamps of existing rows never change.
export async function seedBundledPosts(
  d1: D1Database,
  posts: readonly SeedPost[],
) {
  await d1.prepare(`
    INSERT OR IGNORE INTO blog_settings (key, value, updated_at)
    SELECT ?, CASE WHEN EXISTS (
      SELECT 1 FROM blog_settings WHERE key = ?
    ) THEN 'legacy-v2' ELSE 'fresh' END, ?
  `).bind(LEDGER_KEY, INITIAL_SEED_KEY, new Date().toISOString()).run();
  const settings = await d1.prepare(
    "SELECT key, value FROM blog_settings WHERE key = ? OR key LIKE ?",
  ).bind(LEDGER_KEY, `${POST_SEED_PREFIX}%`).all<{ key: string; value: string }>();
  const imported = new Set(settings.results.map(({ key }) => key));
  const legacyCompleted = settings.results.some(
    ({ key, value }) => key === LEDGER_KEY && value === "legacy-v2",
  );
  const now = new Date().toISOString();
  const pending = posts.filter((post) => !imported.has(POST_SEED_PREFIX + post.slug));
  const conflicts: string[] = [];

  // D1 batches are atomic; keep batches bounded as the archive grows.
  for (let offset = 0; offset < pending.length; offset += 20) {
    const chunk = pending.slice(offset, offset + 20);
    const statements = chunk.flatMap((post) => {
      const key = POST_SEED_PREFIX + post.slug;
      if (legacyCompleted && LEGACY_SLUGS.has(post.slug)) {
        return [d1.prepare(
          "INSERT OR IGNORE INTO blog_settings (key, value, updated_at) VALUES (?, ?, ?)",
        ).bind(key, "legacy-v2", now)];
      }

      return [
        d1.prepare(`
          INSERT OR IGNORE INTO posts (
            id, slug, title, description, content, category, tags, series,
            series_order, status, published_at, created_at, updated_at, author_email
          ) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          WHERE NOT EXISTS (SELECT 1 FROM blog_settings WHERE key = ?)
          AND NOT EXISTS (
            SELECT 1 FROM posts WHERE series = ? AND series_order = ?
          )
        `).bind(
          post.id, post.slug, post.title, post.description, post.content,
          post.category, JSON.stringify(post.tags), post.series ?? null,
          post.seriesOrder ?? null, post.status, post.publishedAt,
          post.publishedAt, post.publishedAt, "imported", key,
          post.series ?? null, post.seriesOrder ?? null,
        ),
        // Record imports and slug/id collisions, including administrator drafts.
        // A series-only conflict stays pending so a later cold start can retry.
        d1.prepare(`
          INSERT OR IGNORE INTO blog_settings (key, value, updated_at)
          SELECT ?, ?, ? WHERE EXISTS (
            SELECT 1 FROM posts WHERE id = ? OR slug = ?
          )
        `).bind(key, "completed", now, post.id, post.slug),
      ];
    });
    await d1.batch(statements);
  }

  const completed = await d1.prepare(
    "SELECT key FROM blog_settings WHERE key LIKE ?",
  ).bind(`${POST_SEED_PREFIX}%`).all<{ key: string }>();
  const completedKeys = new Set(completed.results.map(({ key }) => key));
  for (const post of pending) {
    if (!completedKeys.has(POST_SEED_PREFIX + post.slug)) conflicts.push(post.slug);
  }

  // Retain compatibility with the old initializer. This marker no longer blocks
  // new slugs, and is written only after every batch has succeeded.
  await d1.prepare(
    "INSERT OR IGNORE INTO blog_settings (key, value, updated_at) VALUES (?, ?, ?)",
  ).bind(INITIAL_SEED_KEY, "completed", now).run();
  return { conflicts };
}
