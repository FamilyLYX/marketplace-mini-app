import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

export const config = createConfig({
  chains: [base],
  transports: {
    // [luksoTestnet.id]: http(),
    // [xdcTestnet.id]: http(),
    [base.id]: http(),
  },
  connectors: [miniAppConnector()],
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
