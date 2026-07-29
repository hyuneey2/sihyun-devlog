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
          <Link href="/">Home</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About me</Link>
        </nav>
      </div>
    </header>
  );
}
