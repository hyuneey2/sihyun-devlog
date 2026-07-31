import Link from "next/link";
import { formatPostDate, type PostSummary } from "@/lib/post-types";

type ProjectPostListProps = {
  posts: readonly PostSummary[];
  projectTag: string;
};

export function ProjectPostList({
  posts,
  projectTag,
}: ProjectPostListProps) {
  if (!posts.length) {
    return (
      <p className="project-related-empty">
        #{projectTag} 태그가 달린 글이 아직 없습니다.
      </p>
    );
  }

  return (
    <div className="project-related-posts">
      {posts.map((post) => (
        <article className="project-related-post" key={post.slug}>
          <Link href={`/posts/${post.slug}`}>
            <div className="project-related-post-meta">
              <span>#{projectTag}</span>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </div>

            <div className="project-related-post-content">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </div>

            <span className="project-related-post-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </article>
      ))}
    </div>
  );
}
