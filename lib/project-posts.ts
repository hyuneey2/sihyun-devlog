import type { PostSummary } from "./post-types";

function normalizeTag(tag: string) {
  return tag.trim().toLocaleLowerCase();
}

export function getProjectPosts(
  posts: readonly PostSummary[],
  projectTag: string,
  limit?: number,
) {
  const normalizedProjectTag = normalizeTag(projectTag);
  const safeLimit = limit === undefined ? undefined : Math.max(0, Math.floor(limit));

  if (!normalizedProjectTag || safeLimit === 0) {
    return [];
  }

  return posts
    .filter((post) => post.status === "published" &&
      post.tags.some((tag) => normalizeTag(tag) === normalizedProjectTag),
    )
    .toSorted((a, b) =>
      b.date.localeCompare(a.date) ||
      (a.series && a.series === b.series
        ? (a.seriesOrder ?? Infinity) - (b.seriesOrder ?? Infinity)
        : 0) ||
      b.createdAt.localeCompare(a.createdAt) ||
      a.slug.localeCompare(b.slug),
    )
    .slice(0, safeLimit);
}
