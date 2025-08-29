import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    // [luksoTestnet.id]: http(),
    // [xdcTestnet.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [miniAppConnector()],
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
