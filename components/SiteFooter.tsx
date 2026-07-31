import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner shell">
        <div>
          <p className="footer-name">박시현의 개발 기록</p>
          <p className="footer-note">경험을 구조화하고, 과정을 기록합니다.</p>
        </div>
        <div className="footer-links">
          <Link href="/posts">기록</Link>
          <Link href="/projects">프로젝트</Link>
          <Link href="/about">소개</Link>
        </div>
      </div>
    </footer>
  );
}
