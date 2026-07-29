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

export function getBlogRuntimeEnv() {
  const runtimeEnv = (globalThis as RuntimeGlobal)[RUNTIME_ENV_KEY];
  if (!runtimeEnv) {
    throw new Error("블로그 실행 환경을 불러오지 못했습니다.");
  }
  return runtimeEnv;
}
