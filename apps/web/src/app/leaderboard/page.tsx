"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const tabs = [
  { key: "round", label: "Round" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
] as const;

type LeaderboardEntry = {
  rank: number;
  user: string;
  score: number;
  time?: string;
  timestamp: string;
};

export default function LeaderboardPage() {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("round");
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        const scope = active;
        // Get roundId from URL if available (for round-specific leaderboard)
        const urlParams = new URLSearchParams(window.location.search);
        const roundId = urlParams.get("roundId");
        
        let url = `/api/leaderboard?scope=${scope}`;
        if (scope === "round" && roundId) {
          url += `&roundId=${roundId}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        
        const data = await response.json();
        
        // Format timestamp for display
        const formatted = data.leaderboard.map((entry: LeaderboardEntry) => ({
          ...entry,
          time: new Date(entry.timestamp).toLocaleDateString(),
        }));
        
        setRows(formatted);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Make sure MongoDB is connected.");
        // Fallback to empty array
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
    
    // Refresh every 5 seconds to show new scores
    const interval = setInterval(fetchLeaderboard, 5000);
    
    // Listen for score submission events to refresh immediately
    const handleScoreSubmitted = () => {
      fetchLeaderboard();
    };
    window.addEventListener('scoreSubmitted', handleScoreSubmitted);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scoreSubmitted', handleScoreSubmitted);
    };
  }, [active]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Leaderboards</p>
        <h1 className="text-4xl font-semibold">See who’s fastest</h1>
        <p className="text-muted-foreground text-base md:text-lg">Round updates happen as soon as each session ends.</p>
      </header>

      <div className="flex rounded-full border bg-card/40 p-1 text-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              active === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="divide-y px-0">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading leaderboard...
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <p className="text-xs text-muted-foreground">
                Check SETUP.md for MongoDB connection instructions
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No scores yet. Be the first to play!
            </div>
          ) : (
            rows.map((row) => (
              <div key={`${row.user}-${row.rank}`} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {row.rank}
                  </span>
                  <div>
                    <p className="font-medium">{row.user}</p>
                    <p className="text-xs text-muted-foreground">{row.time}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{row.score} ms</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

