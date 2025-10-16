import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiConfig, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

const { connectors } = getDefaultWallets({
  appName: "First Mover Leap",
  projectId,
});

const config = createConfig({
  connectors,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <WagmiConfig config={config}>
      <RainbowKitProvider>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </QueryClientProvider>
);
