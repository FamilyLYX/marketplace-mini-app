import { createConfig, http } from "wagmi";
import { xdc } from "wagmi/chains";

export const config = createConfig({
  chains: [xdc],
  transports: {
    // [luksoTestnet.id]: http(),
    // [xdcTestnet.id]: http(),
    [xdc.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
