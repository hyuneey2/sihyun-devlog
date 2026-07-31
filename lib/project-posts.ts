import type { PostSummary } from "./post-types";

const DEFAULT_PROJECT_POST_LIMIT = 3;

function normalizeTag(tag: string) {
  return tag.trim().toLocaleLowerCase();
}

export function getProjectPosts(
  posts: readonly PostSummary[],
  projectTag: string,
  limit = DEFAULT_PROJECT_POST_LIMIT,
) {
  const normalizedProjectTag = normalizeTag(projectTag);
  const safeLimit = Math.max(0, Math.floor(limit));

  if (!normalizedProjectTag || safeLimit === 0) {
    return [];
  }

  return posts
    .filter((post) =>
      post.tags.some((tag) => normalizeTag(tag) === normalizedProjectTag),
    )
    .toSorted((a, b) =>
      b.date.localeCompare(a.date) ||
      b.createdAt.localeCompare(a.createdAt) ||
      a.slug.localeCompare(b.slug),
    )
    .slice(0, safeLimit);
}
