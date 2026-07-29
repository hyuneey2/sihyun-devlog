import type { Metadata } from "next";
import Link from "next/link";
import { requireBlogAdmin } from "@/lib/admin-auth";
import { getAdminPosts } from "@/lib/post-data";
import { formatAdminDate } from "@/lib/post-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "글 관리",
};

export default async function AdminPage() {
  await requireBlogAdmin("/admin");
  const posts = await getAdminPosts();
  const publishedCount = posts.filter(
    (post) => post.status === "published",
  ).length;

  return (
    <main className="admin-shell shell">
      <section className="admin-heading">
        <div>
          <p className="eyebrow">Blog studio</p>
          <h1>글 관리</h1>
          <p>
            발행 글 {publishedCount}개 · 임시 저장 {posts.length - publishedCount}개
          </p>
        </div>
        <Link className="button button-primary" href="/admin/new">
          새 글 작성
        </Link>
      </section>

      <section className="admin-posts" aria-label="관리할 게시글">
        {posts.map((post) => (
          <article className="admin-post-row" key={post.id}>
            <div className="admin-post-state">
              <span className={`status-badge status-${post.status}`}>
                {post.status === "published" ? "발행됨" : "임시 저장"}
              </span>
              <span>{post.category}</span>
            </div>
            <div className="admin-post-copy">
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <time dateTime={post.updatedAt}>
                마지막 수정 {formatAdminDate(post.updatedAt)}
              </time>
            </div>
            <div className="admin-post-actions">
              {post.status === "published" ? (
                <Link href={`/posts/${post.slug}`}>보기</Link>
              ) : null}
              <Link href={`/admin/posts/${post.id}/edit`}>수정</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
