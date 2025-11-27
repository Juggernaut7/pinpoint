"use client";

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { WagmiProvider, useConnect, useConfig } from "wagmi";
import { celo, celoAlfajores, celoSepolia } from "wagmi/chains";

const chains = [celo, celoAlfajores, celoSepolia] as const;
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

if (!projectId) {
  console.warn("NEXT_PUBLIC_WC_PROJECT_ID is not set. WalletConnect may not work.");
}

// Create config outside component to avoid re-creation
export const wagmiConfig = getDefaultConfig({
  appName: "pinpoint",
  projectId: projectId || "placeholder",
  chains: chains as any,
  ssr: true,
});

// Create QueryClient with singleton pattern
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  // Browser: use singleton pattern to keep the same query client
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return browserQueryClient;
}

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { connect, connectors } = useConnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if the app is running inside MiniPay
    if (typeof window !== "undefined" && window.ethereum?.isMiniPay) {
      // Find the injected connector, which is what MiniPay uses
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
    }
  }, [connect, connectors, mounted]);

  return <>{children}</>;
}

// Component to ensure WagmiProvider is ready before RainbowKitProvider
function RainbowKitWrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure WagmiProvider context is fully initialized
    // This runs after the current render cycle completes
    const frame = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!ready) {
    return <>{children}</>;
  }

  return <RainbowKitProvider>{children}</RainbowKitProvider>;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const queryClient = getQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render providers immediately - they handle SSR
  // The dynamic import in layout ensures this only runs on client
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {mounted ? (
          <RainbowKitWrapper>
            <WalletProviderInner>{children}</WalletProviderInner>
          </RainbowKitWrapper>
        ) : (
          <>{children}</>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
