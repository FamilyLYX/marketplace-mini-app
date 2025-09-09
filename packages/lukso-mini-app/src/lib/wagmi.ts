import { createConfig, http } from "wagmi";
import { base, lukso, luksoTestnet } from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { isTestnet } from "./app-config";

export const config = createConfig({
  chains: [isTestnet ? luksoTestnet : lukso],
  transports: {
    [luksoTestnet.id]: http(),
    // [xdcTestnet.id]: http(),
    [lukso.id]: http(),
  },
  connectors: [miniAppConnector()],
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
