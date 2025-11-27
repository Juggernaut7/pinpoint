"use client";

import Link from "next/link";
import { WalletConnectButton } from "@/components/connect-button";
import { Button } from "@/components/ui/button";

export default function WalletPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Wallet</p>
        <h1 className="text-4xl font-semibold">Connect your MiniPay wallet</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Connect to enter paid rounds and receive rewards.
        </p>
      </div>

      <div className="rounded-2xl border bg-card/40 p-6 text-center">
        <p className="mb-4 text-sm uppercase tracking-wider text-primary">MiniPay Ready</p>
        <WalletConnectButton />
      </div>

      <Button variant="ghost" className="w-full" asChild>
        <Link href="/practice" className="justify-center md:justify-start">
          Continue without wallet (Practice only)
        </Link>
      </Button>
    </div>
  );
}

