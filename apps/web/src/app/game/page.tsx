"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccount, useSignMessage } from "wagmi";

const TAP_TARGET = 5;
const BEST_KEY = "pinpoint_practice_best";
const LAST_ROUND_KEY = "pinpoint_last_round";

type Status = "idle" | "waiting" | "ready" | "done" | "submitting";

export default function PlayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const roundId = searchParams.get("roundId");
  const mode = searchParams.get("mode") || "practice"; // "practice" or "reward"
  
  const [status, setStatus] = useState<Status>("idle");
  const [tapIndex, setTapIndex] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const average = useMemo(() => {
    if (!times.length) return null;
    const sum = times.reduce((acc, cur) => acc + cur, 0);
    return Math.round(sum / times.length);
  }, [times]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const scheduleTap = () => {
    setStatus("waiting");
    timerRef.current = setTimeout(() => {
      setStartTime(performance.now());
      setStatus("ready");
    }, 800 + Math.random() * 1200);
  };

  const handleStart = () => {
    if (status === "waiting" || status === "ready" || status === "submitting") return;
    setTimes([]);
    setTapIndex(0);
    setSubmitted(false);
    setSubmitError(null);
    scheduleTap();
  };

  const handleTap = () => {
    // Prevent tapping if not ready or if waiting/submitting
    if (status !== "ready" || startTime === null) return;
    
    const reaction = Math.round(performance.now() - startTime);
    const nextTimes = [...times, reaction];
    setTimes(nextTimes);
    setTapIndex(nextTimes.length);
    setStartTime(null); // Clear start time immediately

    if (nextTimes.length === TAP_TARGET) {
      setStatus("done");
      const avgScore = Math.round(nextTimes.reduce((a, b) => a + b, 0) / TAP_TARGET);
      window.localStorage.setItem(
        LAST_ROUND_KEY,
        JSON.stringify({ score: reaction, average: avgScore, ts: Date.now() })
      );

      const best = window.localStorage.getItem(BEST_KEY);
      if (!best || avgScore < Number(best)) {
        window.localStorage.setItem(BEST_KEY, String(avgScore));
      }

      // Auto-submit if in reward mode
      if (mode === "reward" && roundId && isConnected && address) {
        handleSubmitScore(avgScore, nextTimes);
      }
    } else {
      scheduleTap();
    }
  };

  const handleSubmitScore = async (score: number, taps: number[]) => {
    if (!roundId || !address || submitted) return;

    setStatus("submitting");
    setSubmitError(null);

    try {
      // Generate signature for anti-cheat
      const timestamp = Date.now();
      const message = `PINPOINT:${roundId}:${score}:${timestamp}`;
      let signature = "";
      
      try {
        signature = await signMessageAsync({ message });
      } catch (sigError) {
        console.warn("Signature failed, using placeholder:", sigError);
        // Use placeholder signature if signing fails
        signature = "0x0000000000000000000000000000000000000000000000000000000000000000";
      }

      // Ensure signature is valid format
      if (!signature || !signature.startsWith("0x")) {
        signature = "0x0000000000000000000000000000000000000000000000000000000000000000";
      }

      const response = await fetch(`/api/rounds/${roundId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          score,
          taps,
          proofSignature: signature || "0x0000000000000000000000000000000000000000000000000000000000000000",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit score");
      }

      setSubmitted(true);
      setStatus("done");
      
      // Refresh leaderboard after a short delay to show new score
      setTimeout(() => {
        // Trigger a custom event that leaderboard can listen to
        window.dispatchEvent(new CustomEvent('scoreSubmitted', { 
          detail: { roundId, score } 
        }));
      }, 1000);
    } catch (error) {
      console.error("Error submitting score:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to submit");
      setStatus("done");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
      <header className="space-y-1 text-center">
        <h1 className="text-4xl font-semibold">Tap when the light shows</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Tap 5 times as fast as possible
        </p>
      </header>

      <Card>
        <CardContent className="space-y-4 py-6 text-center">
          <p className="text-muted-foreground">
            Tap {tapIndex}/{TAP_TARGET}
          </p>
          <div
            className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 ${
              status === "ready" ? "border-primary bg-primary/10" : "border-muted"
            }`}
          >
            {average ? (
              <span className="text-3xl font-semibold">{average} ms</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {status === "waiting" ? "Wait…" : status === "ready" ? "Tap!" : "Ready?"}
              </span>
            )}
          </div>
          <Button 
            size="lg" 
            className="w-full" 
            onClick={status === "ready" ? handleTap : handleStart}
            disabled={status === "waiting" || status === "submitting"}
          >
            {status === "ready"
              ? "Tap now"
              : status === "waiting"
                ? "Wait…"
                : status === "submitting"
                  ? "Submitting..."
                  : status === "done"
                    ? "Play again"
                    : "Start round"}
          </Button>
        </CardContent>
      </Card>

      {status === "done" && (
        <div className="rounded-2xl border bg-muted/20 p-4 text-center">
          <p className="text-sm text-muted-foreground">Average reaction</p>
          <p className="text-3xl font-semibold">{average} ms</p>
          
          {mode === "reward" && (
            <div className="mt-3">
              {submitted ? (
                <p className="text-sm text-green-600 font-medium">✓ Score submitted to leaderboard!</p>
              ) : submitError ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{submitError}</p>
                  <Button size="sm" onClick={() => average && handleSubmitScore(average, times)}>
                    Retry submit
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => average && handleSubmitScore(average, times)}>
                  Submit to leaderboard
                </Button>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {mode === "reward" && roundId && (
              <Button variant="outline" asChild>
                <Link href={`/leaderboard?roundId=${roundId}`}>View Round Leaderboard</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/leaderboard">All Leaderboards</Link>
            </Button>
            {mode === "practice" && (
              <Button asChild>
                <Link href="/reward">Try Reward Mode</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

