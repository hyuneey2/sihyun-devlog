import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/post-data";
import { renderPostMarkdown } from "@/lib/posts";
import { formatPostDate } from "@/lib/post-types";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const contentHtml = await renderPostMarkdown(post.content);

  return (
    <main className="article-shell">
      <article>
        <header className="article-header">
          <div className="article-kicker">
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          </div>
          <h1 className="article-title">{post.title}</h1>
          <p className="article-description">{post.description}</p>
          <div className="article-tags" aria-label="게시글 태그">
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </header>

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      <div className="article-footer">
        <Link className="text-link" href="/posts">
          ← 전체 글로 돌아가기
        </Link>
      </div>
    </main>
  );
}
