"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LAST_ROUND_KEY = "pinpoint_last_round";

type LastScore = {
  average: number;
  score: number;
  ts: number;
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const roundId = searchParams.get("roundId");
  const [lastScore, setLastScore] = useState<LastScore | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [roundClosed, setRoundClosed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const saved = window.localStorage.getItem(LAST_ROUND_KEY);
    if (saved) {
      setLastScore(JSON.parse(saved));
    }

    // Fetch rank if in reward mode
    if (roundId) {
      fetchRank();
      fetchRoundInfo();
    }
  }, [roundId]);

  const fetchRank = async () => {
    try {
      const response = await fetch(`/api/leaderboard?scope=round&roundId=${roundId}`);
      if (response.ok) {
        const data = await response.json();
        const userAddress = window.localStorage.getItem("lastUserAddress");
        if (userAddress && data.leaderboard) {
          const userRank = data.leaderboard.findIndex(
            (entry: any) => entry.user.includes(userAddress.slice(2, 6))
          );
          if (userRank !== -1) {
            setRank(userRank + 1);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching rank:", err);
    }
  };

  const fetchRoundInfo = async () => {
    try {
      const response = await fetch("/api/rounds");
      if (response.ok) {
        const data = await response.json();
        const round = data.rounds?.find((r: any) => r._id === roundId);
        if (round) {
          setRoundClosed(round.status !== "open");
          if (round.closeAt && round.status === "open") {
            const updateTimer = () => {
              const now = new Date();
              const closeAt = new Date(round.closeAt);
              const diff = closeAt.getTime() - now.getTime();

              if (diff <= 0) {
                setTimeRemaining("Round ended");
                setRoundClosed(true);
                return;
              }

              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);

              setTimeRemaining(
                `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
              );
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching round info:", err);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold">Your Reaction Time</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          {roundId && roundClosed && rank
            ? `You ranked #${rank} in this round!`
            : roundId && !roundClosed
            ? "Round still open. Check back after it closes to see your rank."
            : "Practice makes perfect!"}
        </p>
      </header>

      <Card>
        <CardContent className="space-y-4 py-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Your reaction time</p>
            <p className="text-4xl font-semibold">
              {lastScore?.average ? `${lastScore.average} ms` : "—"}
            </p>
          </div>
          
          {roundId && rank && roundClosed && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Your rank</p>
              <p className="text-2xl font-semibold">#{rank}</p>
            </div>
          )}

          {roundId && !roundClosed && timeRemaining && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Round ends in</p>
              <p className="text-lg font-mono font-semibold">{timeRemaining}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/game">Play Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/leaderboard">View leaderboard</Link>
        </Button>
      </div>
    </div>
  );
}

