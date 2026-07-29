import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/PostEditor";
import { requireBlogAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "새 글 작성",
};

export default async function NewPostPage() {
  await requireBlogAdmin("/admin/new");
  return (
    <main className="editor-shell shell">
      <PostEditor />
    </main>
  );
}
