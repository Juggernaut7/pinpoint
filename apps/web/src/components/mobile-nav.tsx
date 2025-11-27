"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Trophy, Wallet } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/game", label: "Play", icon: Target },
  { href: "/leaderboard", label: "Leaders", icon: Trophy },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-md items-center justify-around px-4 py-2 sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

