import Link from "next/link";
import { formatSeriesOrder } from "@/lib/post-series";
import { formatPostDate, type PostSummary } from "@/lib/post-types";

type PostCardProps = {
  post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link className="post-card" href={`/posts/${post.slug}`}>
      <div className="post-meta">
        <div className="post-taxonomy">
          <span className="post-category">{post.category}</span>
          {post.series && post.seriesOrder !== undefined ? (
            <>
              <span className="post-taxonomy-separator" aria-hidden="true">
                ·
              </span>
              <span className="post-series">
                {post.series} {formatSeriesOrder(post.seriesOrder)}
              </span>
            </>
          ) : null}
        </div>
        <time className="post-date" dateTime={post.date}>
          {formatPostDate(post.date)}
        </time>
      </div>
      <div>
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.description}</p>
      </div>
      <span className="post-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
