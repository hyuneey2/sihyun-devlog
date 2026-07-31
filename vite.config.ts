import tailwindcss from "@tailwindcss/vite";
import vinext from "vinext";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt 환경에서는 FSEvents를 사용할 수 없어 polling으로 HMR을 처리합니다.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

// Vercel 빌드 환경에서는 VERCEL 환경변수가 자동으로 설정됩니다.
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig(async ({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), "");

  const server = {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    ...(isCodexSeatbeltSandbox
      ? {
          watch: {
            useFsEvents: false,
            usePolling: true,
          },
        }
      : {}),
  };

  /**
   * Vercel 배포 환경
   *
   * Tailwind는 Vite 플러그인으로 처리하고,
   * Nitro가 Vercel용 .output 디렉터리를 생성합니다.
   */
  if (isVercel) {
    return {
      server,
      plugins: [
        tailwindcss(),
        vinext(),
        nitro(),
      ],
    };
  }

  /**
   * 기존 Cloudflare 개발·배포 환경
   */
  const localBindingConfig = {
    main: "./worker/index.ts",
    compatibility_flags: ["nodejs_compat"],
    vars: {
      BLOG_ADMIN_EMAIL: localEnv.BLOG_ADMIN_EMAIL ?? "",
      BLOG_DEV_ADMIN_EMAIL: localEnv.BLOG_DEV_ADMIN_EMAIL ?? "",
    },
    d1_databases: d1
      ? [
          {
            binding: d1,
            database_name: "site-creator-d1",
            database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
          },
        ]
      : [],
    r2_buckets: r2
      ? [
          {
            binding: r2,
            bucket_name: "site-creator-r2",
          },
        ]
      : [],
  };

  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server,
    plugins: [
      tailwindcss(),
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: {
          name: "rsc",
          childEnvironments: ["ssr"],
        },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
