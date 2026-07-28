import Link from "next/link";
import type { PostSummary } from "@/lib/posts";
import { formatPostDate } from "@/lib/posts";

type PostCardProps = {
  post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link className="post-card" href={`/posts/${post.slug}`}>
      <div className="post-meta">
        <span className="post-category">{post.category}</span>
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
