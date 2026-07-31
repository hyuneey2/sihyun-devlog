"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="navigation-wrap">
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        Menu
        <svg aria-hidden="true" viewBox="0 0 12 8" fill="none">
          <path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <nav
        className={`site-nav${isOpen ? " is-open" : ""}`}
        id="site-navigation"
        aria-label="주요 메뉴"
      >
        {navigation.map((item) => {
          const isCurrent = isCurrentPath(pathname, item.href);

          return (
            <Link
              className="nav-link"
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => setIsOpen(false)}
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
            onClick={() => setIsOpen(false)}
          >
            글 관리
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
