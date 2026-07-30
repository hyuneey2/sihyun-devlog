import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { requireBlogAdmin } from "@/lib/admin-auth";
import { getAdminPostById } from "@/lib/post-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "글 수정",
};

type EditPostPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
};

export default async function EditPostPage({
  params,
  searchParams,
}: EditPostPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const saved = Array.isArray(query.saved) ? query.saved[0] : query.saved;
  const notice =
    saved === "published" || saved === "draft" ? saved : undefined;
  await requireBlogAdmin(`/admin/posts/${id}/edit`);
  const post = await getAdminPostById(id);
  if (!post) notFound();

  return (
    <main className="editor-shell shell">
      <PostEditor notice={notice} post={post} />
    </main>
  );
}
