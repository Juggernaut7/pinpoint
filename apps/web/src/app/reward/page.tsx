"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { celo, celoAlfajores, celoSepolia } from "wagmi/chains";

const entryFee = 1; // 1 cUSD entry fee

// cUSD token addresses on Celo networks
// Can be overridden with NEXT_PUBLIC_CUSD_ADDRESS env var
const getCusdAddress = (chainId: number): `0x${string}` => {
  // Check for custom cUSD address from env (for testing with mock tokens)
  const customAddr = process.env.NEXT_PUBLIC_CUSD_ADDRESS;
  if (customAddr && customAddr.startsWith("0x")) {
    return customAddr as `0x${string}`;
  }

  // Default cUSD addresses
  const defaultAddresses: Record<number, string> = {
    [celo.id]: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Mainnet
    [celoAlfajores.id]: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // Alfajores
    [celoSepolia.id]: "0x6c23508A9b310C5f2eb2e2eFeBeB748067478667", // Sepolia - Your mock cUSD
  };

  return (defaultAddresses[chainId] || defaultAddresses[celoSepolia.id]) as `0x${string}`;
};

// MiniPay issuer address (from env - for demo, use a test address if not set)
// In production, this should be your MiniPay issuer wallet that receives entry fees
// For hackathon demo, you can use any address - backend will verify the transaction
const getIssuerAddress = (): `0x${string}` => {
  // Try to get from env (needs NEXT_PUBLIC_ prefix for client-side)
  const envAddr = process.env.NEXT_PUBLIC_MINIPAY_ISSUER_ADDRESS;
  if (envAddr && envAddr.startsWith("0x")) {
    return envAddr as `0x${string}`;
  }
  // Default: use a demo address (replace with your actual issuer address)
  // For testing, you can use your own wallet address
  return "0x1234567890123456789012345678901234567890" as `0x${string}`;
};

export default function RewardPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [poolSize, setPoolSize] = useState(0);
  const [players, setPlayers] = useState(0);
  const [closeAt, setCloseAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"idle" | "requesting" | "confirming" | "joining">("idle");

  // Get cUSD address for current chain
  const cusdAddress = getCusdAddress(chainId);

  // ERC20 transfer function signature: transfer(address,uint256)
  const transferData = (to: string, amount: bigint) => {
    const functionSignature = "0xa9059cbb"; // transfer(address,uint256)
    const toAddress = to.slice(2).padStart(64, "0");
    const amountHex = amount.toString(16).padStart(64, "0");
    return `${functionSignature}${toAddress}${amountHex}` as `0x${string}`;
  };

  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    timeout: 60000, // 60 second timeout instead of default
    retryCount: 3,
  });

  // Countdown timer
  useEffect(() => {
    if (!closeAt) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = closeAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Round closed");
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
  }, [closeAt]);

  // Fetch active round and pool info
  useEffect(() => {
    async function fetchRound() {
      try {
        const response = await fetch("/api/rounds");
        if (response.ok) {
          const data = await response.json();
          if (data.rounds && data.rounds.length > 0) {
            const latestRound = data.rounds[0];
            setRoundId(latestRound._id);
            setPoolSize(latestRound.pool || 0);
            setPlayers(latestRound.players?.length || 0);
            if (latestRound.closeAt) {
              setCloseAt(new Date(latestRound.closeAt));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching round:", err);
      }
    }
    fetchRound();
    const interval = setInterval(fetchRound, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Handle payment confirmation and join round
  useEffect(() => {
    if (isConfirmed && txHash && roundId && paymentStep === "confirming") {
      // Small delay to ensure transaction is fully processed
      setTimeout(() => {
        handleJoinRoundWithTx(txHash, roundId);
      }, 1000);
    }
  }, [isConfirmed, txHash, roundId, paymentStep]);

  const handleJoinRoundWithTx = async (txHash: string, activeRoundId: string) => {
    setPaymentStep("joining");
    setError(null);

    try {
      const joinResponse = await fetch(`/api/rounds/${activeRoundId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          txHash,
        }),
      });

      if (!joinResponse.ok) {
        const data = await joinResponse.json();
        if (data.error?.includes("Already joined") || data.error?.includes("already")) {
          // Already joined, just navigate to play
          setError(null);
          router.push(`/game?mode=reward&roundId=${activeRoundId}`);
          return;
        }
        throw new Error(data.error || "Failed to join round");
      }

      // Navigate to game page with round context
      router.push(`/game?mode=reward&roundId=${activeRoundId}`);
    } catch (err) {
      console.error("Error joining round:", err);
      setError(err instanceof Error ? err.message : "Failed to join round");
      setPaymentStep("idle");
      setLoading(false);
    }
  };

  const handleJoinRound = async () => {
    if (!isConnected || !address) {
      router.push("/wallet");
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStep("requesting");

    try {
      // Get or create active round
      let activeRoundId = roundId;
      
      if (!activeRoundId) {
        // Create new round
        const createResponse = await fetch("/api/rounds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryFee, duration: 3600000 }), // 1 hour
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create round");
        }

        const createData = await createResponse.json();
        activeRoundId = createData.roundId;
        setRoundId(activeRoundId);
        if (createData.closeAt) {
          setCloseAt(new Date(createData.closeAt));
        }
      }

      // Request cUSD payment
      const amount = parseUnits(entryFee.toString(), 18); // cUSD has 18 decimals
      const issuerAddr = getIssuerAddress();
      const data = transferData(issuerAddr, amount);

      sendTransaction({
        to: cusdAddress as `0x${string}`,
        data,
        value: 0n,
      });

      setPaymentStep("confirming");
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
      setPaymentStep("idle");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-semibold">Reward Mode</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Pay 1 cUSD to join. Top 10% of players win rewards automatically.
        </p>
      </header>

      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Entry fee</p>
              <p className="text-2xl font-semibold">{entryFee} cUSD</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Live prize pool</p>
              <p className="text-2xl font-semibold">{poolSize.toFixed(2)} cUSD</p>
            </div>
          </div>
          
          {closeAt && timeRemaining && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Round closes in</p>
                <p className="text-lg font-mono font-semibold">{timeRemaining}</p>
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Players in round</p>
            <p className="text-xl font-semibold">{players}</p>
          </div>
        </CardContent>
      </Card>


      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button 
          size="lg" 
          className="flex-1" 
          onClick={handleJoinRound}
          disabled={!isConnected || loading || isSending || isConfirming || paymentStep !== "idle"}
        >
          {paymentStep === "requesting" || isSending
            ? "Requesting payment..."
            : paymentStep === "confirming" || isConfirming
            ? "Confirming payment..."
            : paymentStep === "joining"
            ? "Joining round..."
            : isConnected
            ? "Enter & play"
            : "Connect wallet to enter"}
        </Button>

        {!isConnected && (
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => router.push("/wallet")}
          >
            Connect MiniPay
          </Button>
        )}
      </div>
    </div>
  );
}

