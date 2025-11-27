"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STORAGE_KEY = "pinpoint_practice_best";

export default function PracticePage() {
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBestScore(Number(stored));
    }
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Practice</p>
        <h1 className="text-4xl font-semibold">Warm up with unlimited free rounds</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          No wallet needed. Practice as much as you want.
        </p>
      </header>

      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">Best reaction time</p>
          <p className="text-4xl font-semibold">
            {bestScore ? `${bestScore} ms` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Saved on your device</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Button size="lg" className="flex-1" asChild>
          <Link href="/game?mode=practice">Start Practice Run</Link>
        </Button>

        <Button variant="outline" size="lg" className="flex-1" asChild>
          <Link href="/reward" className="w-full justify-center">
            Switch to Reward Mode →
          </Link>
        </Button>
      </div>
    </div>
  );
}

