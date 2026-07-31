import type { PostSummary } from "./post-types";

type SeriesPost = Pick<
  PostSummary,
  "id" | "slug" | "series" | "seriesOrder"
>;

export function formatSeriesOrder(order: number) {
  return String(order).padStart(2, "0");
}

export function getSeriesPosts<T extends SeriesPost>(
  posts: T[],
  series: string,
) {
  return posts
    .filter(
      (post) =>
        post.series === series &&
        typeof post.seriesOrder === "number" &&
        post.seriesOrder >= 1,
    )
    .sort(
      (a, b) =>
        (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0) ||
        a.slug.localeCompare(b.slug),
    );
}

export function getSeriesNavigation<T extends SeriesPost>(
  posts: T[],
  currentPost: T,
) {
  if (!currentPost.series || currentPost.seriesOrder === undefined) {
    return { previous: undefined, next: undefined };
  }

  const seriesPosts = getSeriesPosts(posts, currentPost.series);
  const currentIndex = seriesPosts.findIndex(
    (post) => post.id === currentPost.id || post.slug === currentPost.slug,
  );

  if (currentIndex < 0) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: seriesPosts[currentIndex - 1],
    next: seriesPosts[currentIndex + 1],
  };
}

export function getSeriesPosition<T extends SeriesPost>(
  posts: T[],
  currentPost: T,
) {
  if (!currentPost.series || currentPost.seriesOrder === undefined) {
    return undefined;
  }

  const seriesPosts = getSeriesPosts(posts, currentPost.series);
  const isIncluded = seriesPosts.some(
    (post) => post.id === currentPost.id || post.slug === currentPost.slug,
  );

  return isIncluded
    ? {
        current: currentPost.seriesOrder,
        total: seriesPosts.length,
      }
    : undefined;
}
