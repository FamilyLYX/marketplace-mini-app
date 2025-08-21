import { createConfig, http } from "wagmi";
import { baseSepolia, luksoTestnet, xdcTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [luksoTestnet, xdcTestnet, baseSepolia],
  transports: {
    [luksoTestnet.id]: http(),
    [xdcTestnet.id]: http(),
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
