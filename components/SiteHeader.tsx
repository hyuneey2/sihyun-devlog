import Link from "next/link";
import { getBlogAdmin } from "@/lib/admin-auth";
import { SiteNavigation } from "@/components/SiteNavigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function SiteHeader() {
  const admin = await getBlogAdmin();

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="박시현 개발 기록 홈">
          <span className="brand-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sihyun-profile.png" alt="" width="36" height="36" />
          </span>
          <span className="brand-name">SIHYUN.LOG</span>
        </Link>

        <div className="header-actions">
          <SiteNavigation isAdmin={Boolean(admin)} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
