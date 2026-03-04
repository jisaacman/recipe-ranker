"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; icon: React.ReactNode };

const TABS: Tab[] = [
  {
    href: "/",
    label: "Rankings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <line x1="4" y1="6" x2="16" y2="6" />
        <line x1="4" y1="10" x2="16" y2="10" />
        <line x1="4" y1="14" x2="12" y2="14" />
      </svg>
    ),
  },
  {
    href: "/plan",
    label: "Plan",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <line x1="3" y1="8" x2="17" y2="8" />
        <line x1="7" y1="2" x2="7" y2="6" />
        <line x1="13" y1="2" x2="13" y2="6" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-100 z-40">
      <div className="flex max-w-lg mx-auto">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center gap-1 pt-2 pb-3 text-xs font-medium transition-colors relative ${
                active ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-stone-900 rounded-full" />
              )}
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
