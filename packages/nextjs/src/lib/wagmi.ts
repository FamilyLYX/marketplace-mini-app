import { createConfig, http } from "wagmi";
import { luksoTestnet, xdcTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [xdcTestnet],
  transports: {
    [xdcTestnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
