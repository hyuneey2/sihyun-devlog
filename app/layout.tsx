import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "박시현 | 개발 기록",
    template: "%s | 박시현 개발 기록",
  },
  description:
    "React, TypeScript, NestJS와 프로젝트 경험을 기록하는 박시현의 개발 블로그",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sihyun-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})();`,
          }}
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <a
          className="floating-contact"
          href="mailto:tlgus0929@hufs.ac.kr"
          aria-label="박시현에게 메일 보내기"
          title="메일 보내기"
        >
          <span className="floating-contact-label" aria-hidden="true">
            메일 보내기
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </a>
      </body>
    </html>
  );
}
