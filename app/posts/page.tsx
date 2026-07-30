import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { getPublishedPosts } from "@/lib/post-data";
import { POST_CATEGORIES, type PostCategory } from "@/lib/post-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "기록",
  description: "프로젝트에서 고민하고 해결한 과정을 정리한 개발 기록",
};

const categoryFilters = [
  { value: "all", label: "전체" },
  ...POST_CATEGORIES,
] as const;

const POSTS_PER_PAGE = 6;

type PostsPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
};

function getPostsHref(category: string, page: number) {
  const params = new URLSearchParams();

  if (category !== "all") {
    params.set("category", category);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/posts?${query}` : "/posts";
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const requestedCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const requestedPage = Array.isArray(params.page)
    ? params.page[0]
    : params.page;
  const activeCategory = categoryFilters.some(
    ({ value }) => value === requestedCategory,
  )
    ? requestedCategory
    : "all";
  const filteredPosts = await getPublishedPosts(
    activeCategory === "all" ? undefined : (activeCategory as PostCategory),
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / POSTS_PER_PAGE),
  );
  const parsedPage = Number.parseInt(requestedPage ?? "", 10);
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, totalPages)
      : 1;
  const pageStart = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = filteredPosts.slice(
    pageStart,
    pageStart + POSTS_PER_PAGE,
  );

  return (
    <main className="posts-page">
      <section className="posts-hero shell">
        <p className="eyebrow">All posts</p>
        <h1 className="page-title">개발 기록</h1>
        <p className="page-description">
          프로젝트를 진행하며 마주친 문제, 선택한 구조, 해결 과정과 배운
          점을 정리합니다.
        </p>
      </section>

      <section className="posts-content shell">
        <nav className="category-filter" aria-label="게시글 카테고리">
          {categoryFilters.map(({ value, label }) => {
            const isActive = activeCategory === value;

            return (
              <Link
                key={value}
                className="category-filter-link"
                href={getPostsHref(value, 1)}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="post-list">
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        <nav className="pagination" aria-label="게시글 페이지">
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            const isCurrent = page === currentPage;

            return (
              <Link
                key={page}
                className="pagination-link"
                href={getPostsHref(activeCategory, page)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`${page}페이지`}
              >
                {page}
              </Link>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
