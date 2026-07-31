import type { PostSummary } from "./post-types";

type SeriesPost = Pick<
  PostSummary,
  "id" | "slug" | "series" | "seriesOrder"
>;

type PublicListPost = Pick<
  PostSummary,
  | "id"
  | "slug"
  | "date"
  | "createdAt"
  | "category"
  | "series"
  | "seriesOrder"
>;

export type PublicPostListItem =
  | {
      type: "post";
      post: PostSummary;
      sortDate: string;
    }
  | {
      type: "series";
      seriesName: string;
      representativePost: PostSummary;
      posts: PostSummary[];
      latestDate: string;
      sortDate: string;
    };

export function formatSeriesOrder(order: number) {
  return String(order).padStart(2, "0");
}

function isValidSeriesOrder(order: number | undefined) {
  return typeof order === "number" && Number.isInteger(order) && order >= 1;
}

function getDateTimestamp(date: string) {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function comparePostDates(a: PublicListPost, b: PublicListPost) {
  const dateDifference = getDateTimestamp(a.date) - getDateTimestamp(b.date);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  const dateTextDifference = a.date.localeCompare(b.date);
  if (dateTextDifference !== 0) {
    return dateTextDifference;
  }

  return a.createdAt.localeCompare(b.createdAt);
}

export function getSortedSeriesPosts<T extends PublicListPost>(
  posts: readonly T[],
) {
  return [...posts].sort((a, b) => {
    const aHasOrder = isValidSeriesOrder(a.seriesOrder);
    const bHasOrder = isValidSeriesOrder(b.seriesOrder);

    if (aHasOrder !== bHasOrder) {
      return aHasOrder ? -1 : 1;
    }

    if (aHasOrder && bHasOrder) {
      const orderDifference = (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0);
      if (orderDifference !== 0) {
        return orderDifference;
      }
    }

    return (
      comparePostDates(a, b) ||
      a.id.localeCompare(b.id) ||
      a.slug.localeCompare(b.slug)
    );
  });
}

export function getSeriesLatestDate<T extends PublicListPost>(
  posts: readonly T[],
) {
  return posts.reduce(
    (latestPost, post) =>
      comparePostDates(post, latestPost) > 0 ? post : latestPost,
    posts[0],
  )?.date;
}

export function groupPostsForPublicList(
  posts: readonly PostSummary[],
): PublicPostListItem[] {
  const seriesGroups = new Map<string, PostSummary[]>();

  posts.forEach((post) => {
    const seriesName = post.series?.trim();
    if (!seriesName) return;

    const key = `${post.category}\u0000${seriesName}`;
    const group = seriesGroups.get(key);

    if (group) {
      group.push(post);
    } else {
      seriesGroups.set(key, [post]);
    }
  });

  const emittedSeries = new Set<string>();
  const items = posts.flatMap<PublicPostListItem>((post) => {
    const seriesName = post.series?.trim();

    if (!seriesName) {
      return [{ type: "post", post, sortDate: post.date }];
    }

    const key = `${post.category}\u0000${seriesName}`;
    if (emittedSeries.has(key)) {
      return [];
    }

    emittedSeries.add(key);
    const seriesPosts = getSortedSeriesPosts(seriesGroups.get(key) ?? [post]);
    const representativePost = seriesPosts[0] ?? post;
    const latestDate = getSeriesLatestDate(seriesPosts) ?? representativePost.date;

    return [
      {
        type: "series",
        seriesName,
        representativePost,
        posts: seriesPosts,
        latestDate,
        sortDate: latestDate,
      },
    ];
  });

  return items.sort(
    (a, b) => getDateTimestamp(b.sortDate) - getDateTimestamp(a.sortDate),
  );
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
