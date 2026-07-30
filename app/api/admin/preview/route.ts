import { requireBlogAdminApi } from "@/lib/admin-auth";
import { renderPostMarkdown } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireBlogAdminApi();
  if (auth.response) return auth.response;

  const body = (await request.json()) as { content?: unknown };
  const content = typeof body.content === "string" ? body.content : "";
  if (content.length > 150_000) {
    return Response.json(
      { error: "본문은 15만 자 이하로 입력해 주세요." },
      { status: 400 },
    );
  }

  return Response.json({ html: await renderPostMarkdown(content) });
}
