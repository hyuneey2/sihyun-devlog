import Link from "next/link";
import { getBlogAdmin } from "@/lib/admin-auth";
import { SiteNavigation } from "@/components/SiteNavigation";

export async function SiteHeader() {
  const admin = await getBlogAdmin();

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="박시현 개발 기록 홈">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>SIHYUN.LOG</span>
        </Link>

        <SiteNavigation isAdmin={Boolean(admin)} />
      </div>
    </header>
  );
}
