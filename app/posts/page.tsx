import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "기록",
  description: "프로젝트에서 고민하고 해결한 과정을 정리한 개발 기록",
};

export default function PostsPage() {
  const posts = getAllPosts();

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
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
