import { getBundledPosts } from "./posts";
import { getBlogRuntimeEnv } from "./runtime-env";
import type {
  Post,
  PostCategory,
  PostInput,
  PostStatus,
  PostSummary,
} from "./post-types";

type D1PostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_email: string;
};

const INITIAL_SEED_KEY = "initial_markdown_seed_v1";

function getD1() {
  const binding = getBlogRuntimeEnv().DB;
  return binding;
}

function requireD1() {
  const binding = getD1();
  if (!binding) {
    throw new Error("게시글 데이터베이스 연결을 사용할 수 없습니다.");
  }
  return binding;
}

function parseTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function rowToPost(row: D1PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    category: row.category as PostCategory,
    tags: parseTags(row.tags),
    status: row.status as PostStatus,
    date: row.published_at ?? row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function postToSummary(post: Post): PostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: post.category,
    tags: post.tags,
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

async function ensureInitialPosts() {
  const d1 = requireD1();
  const marker = await d1
    .prepare("SELECT value FROM blog_settings WHERE key = ?")
    .bind(INITIAL_SEED_KEY)
    .first<{ value: string }>();

  if (marker) return;

  const now = new Date().toISOString();
  const statements = getBundledPosts().map((post) =>
    d1
      .prepare(
        `INSERT OR IGNORE INTO posts (
          id, slug, title, description, content, category, tags, status,
          published_at, created_at, updated_at, author_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        post.id,
        post.slug,
        post.title,
        post.description,
        post.content,
        post.category,
        JSON.stringify(post.tags),
        post.status,
        post.publishedAt,
        post.publishedAt,
        post.publishedAt,
        "imported",
      ),
  );

  statements.push(
    d1
      .prepare(
        "INSERT OR IGNORE INTO blog_settings (key, value, updated_at) VALUES (?, ?, ?)",
      )
      .bind(INITIAL_SEED_KEY, "completed", now),
  );

  await d1.batch(statements);
}

export async function getPublishedPosts(
  category?: PostCategory,
): Promise<PostSummary[]> {
  if (!getD1()) {
    return getBundledPosts()
      .filter((post) => !category || post.category === category)
      .map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.publishedAt,
        category: post.category,
        tags: post.tags,
        status: post.status,
        createdAt: post.publishedAt,
        updatedAt: post.publishedAt,
      }));
  }

  await ensureInitialPosts();
  const d1 = requireD1();
  const query = category
    ? d1
        .prepare(
          `SELECT * FROM posts
           WHERE status = 'published' AND category = ?
           ORDER BY published_at DESC, created_at DESC`,
        )
        .bind(category)
    : d1.prepare(
        `SELECT * FROM posts
         WHERE status = 'published'
         ORDER BY published_at DESC, created_at DESC`,
      );
  const result = await query.all<D1PostRow>();
  return result.results.map(rowToPost).map(postToSummary);
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<Post | undefined> {
  if (!getD1()) {
    const post = getBundledPosts().find((item) => item.slug === slug);
    return post
      ? {
          id: post.id,
          slug: post.slug,
          title: post.title,
          description: post.description,
          content: post.content,
          category: post.category,
          tags: post.tags,
          status: post.status,
          date: post.publishedAt,
          createdAt: post.publishedAt,
          updatedAt: post.publishedAt,
        }
      : undefined;
  }

  await ensureInitialPosts();
  const row = await requireD1()
    .prepare(
      "SELECT * FROM posts WHERE slug = ? AND status = 'published' LIMIT 1",
    )
    .bind(slug)
    .first<D1PostRow>();
  return row ? rowToPost(row) : undefined;
}

export async function getAdminPosts(): Promise<PostSummary[]> {
  await ensureInitialPosts();
  const result = await requireD1()
    .prepare(
      `SELECT * FROM posts
       ORDER BY updated_at DESC, created_at DESC`,
    )
    .all<D1PostRow>();
  return result.results.map(rowToPost).map(postToSummary);
}

export async function getAdminPostById(id: string): Promise<Post | undefined> {
  await ensureInitialPosts();
  const row = await requireD1()
    .prepare("SELECT * FROM posts WHERE id = ? LIMIT 1")
    .bind(id)
    .first<D1PostRow>();
  return row ? rowToPost(row) : undefined;
}

export async function createPost(input: PostInput, authorEmail: string) {
  await ensureInitialPosts();
  const d1 = requireD1();
  const existing = await d1
    .prepare("SELECT id FROM posts WHERE slug = ? LIMIT 1")
    .bind(input.slug)
    .first<{ id: string }>();
  if (existing) {
    throw new Error("SLUG_ALREADY_EXISTS");
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const publishedAt = input.status === "published" ? now : null;

  await d1
    .prepare(
      `INSERT INTO posts (
        id, slug, title, description, content, category, tags, status,
        published_at, created_at, updated_at, author_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.slug,
      input.title,
      input.description,
      input.content,
      input.category,
      JSON.stringify(input.tags),
      input.status,
      publishedAt,
      now,
      now,
      authorEmail,
    )
    .run();

  return getAdminPostById(id);
}

export async function updatePost(
  id: string,
  input: PostInput,
  authorEmail: string,
) {
  await ensureInitialPosts();
  const d1 = requireD1();
  const current = await d1
    .prepare("SELECT * FROM posts WHERE id = ? LIMIT 1")
    .bind(id)
    .first<D1PostRow>();
  if (!current) return undefined;

  const slugOwner = await d1
    .prepare("SELECT id FROM posts WHERE slug = ? AND id != ? LIMIT 1")
    .bind(input.slug, id)
    .first<{ id: string }>();
  if (slugOwner) {
    throw new Error("SLUG_ALREADY_EXISTS");
  }

  const now = new Date().toISOString();
  const publishedAt =
    input.status === "published"
      ? (current.published_at ?? now)
      : current.published_at;

  await d1
    .prepare(
      `UPDATE posts
       SET slug = ?, title = ?, description = ?, content = ?, category = ?,
           tags = ?, status = ?, published_at = ?, updated_at = ?,
           author_email = ?
       WHERE id = ?`,
    )
    .bind(
      input.slug,
      input.title,
      input.description,
      input.content,
      input.category,
      JSON.stringify(input.tags),
      input.status,
      publishedAt,
      now,
      authorEmail,
      id,
    )
    .run();

  return getAdminPostById(id);
}

export async function deletePost(id: string) {
  await ensureInitialPosts();
  const result = await requireD1()
    .prepare("DELETE FROM posts WHERE id = ?")
    .bind(id)
    .run();
  return (result.meta.changes ?? 0) > 0;
}
