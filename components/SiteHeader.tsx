import Link from "next/link";
import { getBlogAdmin } from "@/lib/admin-auth";
import { SiteNavigation } from "@/components/SiteNavigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function SiteHeader() {
  const admin = await getBlogAdmin();

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="hyundevlog 홈">
          {/* display: flex와 중앙 정렬 속성을 추가하여 S를 한가운데로 맞춤 */}
          <span 
            className="brand-mark" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <span 
              aria-hidden="true" 
              style={{ 
                transform: "rotate(90deg)", 
                fontWeight: "900",
                fontSize: "1.2em",
                lineHeight: 1 // 기본 줄간격 때문에 미세하게 틀어지는 현상 방지
              }}
            >
              S
            </span>
          </span>
          <span className="brand-name">hyundevlog</span>
        </Link>

        <div className="header-actions">
          <SiteNavigation isAdmin={Boolean(admin)} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
