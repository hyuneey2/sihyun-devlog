"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteNavigationProps = {
  isAdmin: boolean;
};

const navigation = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About me" },
] as const;

function isCurrentPath(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavigation({ isAdmin }: SiteNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="주요 메뉴">
      {navigation.map((item) => {
        const isCurrent = isCurrentPath(pathname, item.href);

        return (
          <Link
            className="nav-link"
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
      {isAdmin ? (
        <Link
          className="nav-link admin-nav-link"
          href="/admin"
          aria-current={pathname.startsWith("/admin") ? "page" : undefined}
        >
          글 관리
        </Link>
      ) : null}
    </nav>
  );
}
