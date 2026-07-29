import { notFound } from "next/navigation";
import {
  getChatGPTUser,
  requireChatGPTUser,
  type ChatGPTUser,
} from "@/app/chatgpt-auth";
import { getBlogRuntimeEnv } from "./runtime-env";

function getAdminEmail() {
  return (getBlogRuntimeEnv().BLOG_ADMIN_EMAIL ?? "")
    .trim()
    .toLowerCase();
}

function matchesAdmin(user: ChatGPTUser | null) {
  const adminEmail = getAdminEmail();
  return Boolean(
    user && adminEmail && user.email.trim().toLowerCase() === adminEmail,
  );
}

export async function getBlogAdmin() {
  const user = await getChatGPTUser();
  return matchesAdmin(user) ? user : null;
}

export async function requireBlogAdmin(returnTo: string) {
  const user = await requireChatGPTUser(returnTo);
  if (!matchesAdmin(user)) {
    notFound();
  }
  return user;
}

export async function requireBlogAdminApi() {
  const user = await getChatGPTUser();
  if (!user) {
    return {
      user: null,
      response: Response.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      ),
    };
  }
  if (!matchesAdmin(user)) {
    return {
      user: null,
      response: Response.json(
        { error: "글을 관리할 권한이 없습니다." },
        { status: 403 },
      ),
    };
  }
  return { user, response: null };
}
