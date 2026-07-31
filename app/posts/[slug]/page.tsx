import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedPostBySlug,
  getPublishedPosts,
} from "@/lib/post-data";
import { renderPostMarkdown } from "@/lib/posts";
import {
  formatSeriesOrder,
  getSeriesNavigation,
  getSeriesPosition,
} from "@/lib/post-series";
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
  const publishedPosts = post.series ? await getPublishedPosts() : [];
  const seriesPosition = getSeriesPosition(publishedPosts, post);
  const { previous, next } = getSeriesNavigation(publishedPosts, post);
  const hasSeriesNavigation = Boolean(previous || next);

  return (
    <main className="article-shell">
      <article>
        <header className="article-header">
          {post.series && seriesPosition ? (
            <p className="article-series">
              <span>{post.series}</span>
              <span aria-hidden="true">·</span>
              <span>
                {formatSeriesOrder(seriesPosition.current)} /{" "}
                {formatSeriesOrder(seriesPosition.total)}
              </span>
            </p>
          ) : null}
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

        {hasSeriesNavigation ? (
          <nav className="series-navigation" aria-label="시리즈 글 이동">
            {previous ? (
              <Link
                className="series-navigation-link series-navigation-previous"
                href={`/posts/${previous.slug}`}
                scroll
              >
                <span aria-hidden="true">←</span>
                <span>
                  {formatSeriesOrder(previous.seriesOrder ?? 0)}.{" "}
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span className="series-navigation-placeholder" />
            )}
            {next ? (
              <Link
                className="series-navigation-link series-navigation-next"
                href={`/posts/${next.slug}`}
                scroll
              >
                <span>
                  {formatSeriesOrder(next.seriesOrder ?? 0)}. {next.title}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span className="series-navigation-placeholder" />
            )}
          </nav>
        ) : null}
      </article>

      <div className="article-footer">
        <Link className="text-link" href="/posts">
          ← 전체 글로 돌아가기
        </Link>
      </div>
    </main>
  );
}
