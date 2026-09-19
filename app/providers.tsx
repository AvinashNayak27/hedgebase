"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { base } from "viem/chains";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { PortfolioProvider } from "./components/portfolio-provider";
import { Attribution } from "ox/erc8021";

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_3bnehvik"],
});



const config = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: { [base.id]: http() },
  ssr: true,
  dataSuffix: DATA_SUFFIX,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider><PortfolioProvider>{children}</PortfolioProvider></RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
