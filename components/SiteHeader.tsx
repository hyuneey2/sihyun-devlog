import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="박시현 개발 기록 홈">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>SIHYUN.LOG</span>
        </Link>

        <nav className="site-nav" aria-label="주요 메뉴">
          <Link href="/">홈</Link>
          <Link href="/posts">기록</Link>
          <Link href="/about">소개</Link>
        </nav>
      </div>
    </header>
  );
}
