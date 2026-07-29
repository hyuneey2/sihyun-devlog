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

type PostsPageProps = {
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const requestedCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const activeCategory = categoryFilters.some(
    ({ value }) => value === requestedCategory,
  )
    ? requestedCategory
    : "all";
  const filteredPosts = await getPublishedPosts(
    activeCategory === "all" ? undefined : (activeCategory as PostCategory),
  );

  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">All posts</p>
        <h1 className="page-title">개발 기록</h1>
        <p className="page-description">
          프로젝트를 진행하며 마주친 문제, 선택한 구조, 해결 과정과 배운
          점을 정리합니다.
        </p>
      </section>

      <section className="page-content shell">
        <nav className="category-filter" aria-label="게시글 카테고리">
          {categoryFilters.map(({ value, label }) => {
            const isActive = activeCategory === value;
            const href =
              value === "all"
                ? "/posts"
                : `/posts?category=${encodeURIComponent(value)}`;

            return (
              <Link
                key={value}
                className="category-filter-link"
                href={href}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="post-list">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
