import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserBalance } from "@/components/user-balance";
import { ArrowRight, Target, Trophy, Wallet } from "lucide-react";

const actions = [
  {
    title: "Start Practice",
    subtitle: "Warm up with unlimited free rounds.",
    href: "/practice",
    icon: Target,
  },
  {
    title: "Play Reward Mode",
    subtitle: "Pay 1 cUSD to join and compete for rewards.",
    href: "/reward",
    icon: Trophy,
  },
  {
    title: "View Leaderboards",
    subtitle: "See who's fastest. Round · Daily · Weekly",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Connect Wallet",
    subtitle: "MiniPay or any Celo wallet.",
    href: "/wallet",
    icon: Wallet,
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
      <header className="mb-10 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase text-primary tracking-wider">PINPOINT</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Tap fast. Win rewards.</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Choose a mode and start playing in seconds.
        </p>
      </header>

      <div className="mb-10">
        <UserBalance />
      </div>

      <div className="grid gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.href} className="border-muted-foreground/10 shadow-none transition hover:-translate-y-0.5 hover:border-primary/40">
              <CardContent className="flex items-center justify-between gap-4 py-5">
                <div className="space-y-1 text-left">
                  <p className="text-sm text-muted-foreground">{action.subtitle}</p>
                  <h2 className="text-2xl font-semibold">{action.title}</h2>
                </div>
                <Link
                  href={action.href}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-muted-foreground/20 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <footer className="mt-12 flex flex-col items-center gap-4 text-sm text-center">
        <Link href="/how-it-works" className="inline-flex items-center gap-2 font-medium text-primary">
          How It Works <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-muted-foreground">Optimized for MiniPay mobile · Smooth on desktop</p>
      </footer>
    </div>
  );
}
