import type { D1Database } from "@cloudflare/workers-types";

export type BlogRuntimeEnv = {
  DB?: D1Database;
  BLOG_ADMIN_EMAIL?: string;
  BLOG_DEV_ADMIN_EMAIL?: string;
};

const RUNTIME_ENV_KEY = Symbol.for("sihyun-devlog.runtime-env");

type RuntimeGlobal = typeof globalThis & {
  [RUNTIME_ENV_KEY]?: BlogRuntimeEnv;
};

export function setBlogRuntimeEnv(env: BlogRuntimeEnv) {
  (globalThis as RuntimeGlobal)[RUNTIME_ENV_KEY] = env;
}

export function getBlogRuntimeEnv(): BlogRuntimeEnv {
  const runtimeEnv = (globalThis as RuntimeGlobal)[RUNTIME_ENV_KEY];

  // Cloudflare에서는 Worker가 등록한 D1 및 환경변수를 사용합니다.
  if (runtimeEnv) {
    return runtimeEnv;
  }

  // Vercel에서는 D1 없이 번들 게시글을 사용하고,
  // 필요한 환경변수만 process.env에서 읽습니다.
  const nodeEnv = typeof process !== "undefined" ? process.env : undefined;

  return {
    BLOG_ADMIN_EMAIL: nodeEnv?.BLOG_ADMIN_EMAIL,
    BLOG_DEV_ADMIN_EMAIL: nodeEnv?.BLOG_DEV_ADMIN_EMAIL,
  };
}