import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "Pay a small entry fee (1 cUSD)",
    detail: "Join the current round by paying 1 cUSD. The prize pool grows with each player.",
  },
  {
    title: "Join the current round",
    detail: "Each round lasts 1 hour. Join anytime before it closes.",
  },
  {
    title: "Play 5 fast taps",
    detail: "Tap when the light shows. Lower reaction time = higher rank.",
  },
  {
    title: "Top 10% win rewards",
    detail: "Top 10% of players split 95% of the pool. Rewards paid automatically via MiniPay.",
  },
  {
    title: "100% transparent & skill-based",
    detail: "All scores are public. Faster reactions win. No luck involved.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
        <h1 className="text-4xl font-semibold">Simple, fast, fair</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          MiniPay keeps payouts smooth so you only focus on tapping.
        </p>
      </header>

      <Card>
        <CardContent className="space-y-6 py-6">
          {steps.map((step) => (
            <div key={step.title}>
              <p className="text-base font-semibold">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

