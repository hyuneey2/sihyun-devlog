"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  formatSeriesOrder,
  type PublicPostListItem,
} from "@/lib/post-series";
import { formatPostDate } from "@/lib/post-types";

type SeriesPostListItem = Extract<
  PublicPostListItem,
  { type: "series" }
>;

type SeriesPostCardProps = {
  item: SeriesPostListItem;
};

function getDisplayOrder(order: number | undefined, fallback: number) {
  return typeof order === "number" && Number.isInteger(order) && order >= 1
    ? order
    : fallback;
}

export function SeriesPostCard({ item }: SeriesPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tocId = useId();
  const { latestDate, posts, representativePost, seriesName } = item;
  const representativeOrder = getDisplayOrder(
    representativePost.seriesOrder,
    1,
  );
  const remainingPosts = posts
    .map((post, index) => ({ post, fallbackOrder: index + 1 }))
    .filter(
      ({ post }) =>
        post.id !== representativePost.id ||
        post.slug !== representativePost.slug,
    );

  return (
    <article className="series-post-card">
      <div className="post-meta">
        <div className="post-taxonomy">
          <span className="post-category">{representativePost.category}</span>
          <span className="post-taxonomy-separator" aria-hidden="true">
            ·
          </span>
          <span className="post-series">Series</span>
        </div>
        <time className="post-date" dateTime={latestDate}>
          {formatPostDate(latestDate)}
        </time>
      </div>

      <div className="series-post-content">
        <Link
          className="series-post-title-link"
          href={`/posts/${representativePost.slug}`}
        >
          <h3 className="post-title">{seriesName}</h3>
        </Link>
        <p className="post-description">{representativePost.description}</p>

        <div className="series-post-actions">
          <p className="series-post-count">
            <span>{posts.length}개의 글</span>
            <span aria-hidden="true">·</span>
            <Link
              className="series-start-link"
              href={`/posts/${representativePost.slug}`}
            >
              {formatSeriesOrder(representativeOrder)}부터 읽기
            </Link>
          </p>
          <button
            className="series-toc-toggle"
            type="button"
            aria-expanded={isExpanded}
            aria-controls={tocId}
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            <span>{isExpanded ? "목차 접기" : "목차 펼치기"}</span>
            <span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
          </button>
        </div>

        {isExpanded ? (
          <ol className="series-post-toc" id={tocId}>
            {remainingPosts.map(({ post, fallbackOrder }) => {
              const order = getDisplayOrder(
                post.seriesOrder,
                fallbackOrder,
              );
              const orderLabel = formatSeriesOrder(order);

              return (
                <li
                  className="series-post-toc-item"
                  key={`${post.id}-${post.slug}`}
                >
                  <Link
                    className="series-post-toc-link"
                    href={`/posts/${post.slug}`}
                    aria-label={`${orderLabel}. ${post.title}`}
                  >
                    <span
                      className="series-post-toc-order"
                      aria-hidden="true"
                    >
                      {orderLabel}.
                    </span>
                    <span>{post.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    </article>
  );
}
