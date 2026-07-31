import { requireBlogAdminApi } from "@/lib/admin-auth";
import { deletePost, updatePost } from "@/lib/post-data";
import { validatePostInput } from "@/lib/post-validation";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await requireBlogAdminApi();
  if (auth.response || !auth.user) return auth.response;

  const validation = validatePostInput(await request.json());
  if (validation.error) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const { id } = await params;
    const post = await updatePost(id, validation.data, auth.user.email);
    if (!post) {
      return Response.json(
        { error: "수정할 글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    return Response.json({ post });
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_ALREADY_EXISTS") {
      return Response.json(
        { error: "이미 사용 중인 글 주소입니다." },
        { status: 409 },
      );
    }
    if (
      error instanceof Error &&
      error.message === "SERIES_ORDER_ALREADY_EXISTS"
    ) {
      return Response.json(
        { error: "같은 시리즈에서 이미 사용 중인 순서입니다." },
        { status: 409 },
      );
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireBlogAdminApi();
  if (auth.response) return auth.response;

  const { id } = await params;
  const deleted = await deletePost(id);
  if (!deleted) {
    return Response.json(
      { error: "삭제할 글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  return Response.json({ deleted: true });
}
