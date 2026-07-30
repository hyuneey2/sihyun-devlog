import { requireBlogAdminApi } from "@/lib/admin-auth";
import { createPost, getAdminPosts } from "@/lib/post-data";
import { validatePostInput } from "@/lib/post-validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireBlogAdminApi();
  if (auth.response) return auth.response;

  const posts = await getAdminPosts();
  return Response.json({ posts });
}

export async function POST(request: Request) {
  const auth = await requireBlogAdminApi();
  if (auth.response || !auth.user) return auth.response;

  const validation = validatePostInput(await request.json());
  if (validation.error) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const post = await createPost(validation.data, auth.user.email);
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_ALREADY_EXISTS") {
      return Response.json(
        { error: "이미 사용 중인 글 주소입니다." },
        { status: 409 },
      );
    }
    throw error;
  }
}
