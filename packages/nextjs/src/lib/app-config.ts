import { createPublicClient, http } from "viem";
import { luksoTestnet, xdc, xdcTestnet } from "viem/chains";
import { useAccount } from "wagmi";

interface Config {
  salt_db: string;
  vaults_db: string;
  chain: typeof xdc | typeof xdcTestnet;
  chainUrl: ReturnType<typeof http>;
  adminAddress: `0x${string}`;
}

let appConfig: Config;

export const TESTNET_CONFIG = {
  salt_db: "dpp_salts_testnet",
  vaults_db: "vaults_testnet",
  chain: xdcTestnet,
  chainUrl: http("https://rpc.ankr.com/xdc_testnet"),
  adminAddress:
    (process.env.NEXT_PUBLIC_ADMIN_TESTNET_ADDRESS as `0x${string}`) ??
    "0x9fBd3638Fc8D6c8C25f44200f5dbD1e3e9F25959",
};

export const MAINNET_CONFIG = {
  salt_db: "dpp_salts",
  vaults_db: "vaults",
  chain: xdc,
  chainUrl: http("https://rpc.xdcrpc.com"),
  adminAddress:
    (process.env.NEXT_PUBLIC_ADMIN_ADDRESS as `0x${string}`) ??
    "0x9fBd3638Fc8D6c8C25f44200f5dbD1e3e9F25959",
};

if (process.env.NEXT_PUBLIC_TESTNET === "true") {
  appConfig = TESTNET_CONFIG;
} else {
  appConfig = MAINNET_CONFIG;
}

const readClient = createPublicClient({
  chain: appConfig.chain,
  transport: appConfig.chainUrl,
});

const useReadClient = () => {
  const { chain: connectedChain } = useAccount();
  return createPublicClient({
    chain: connectedChain ?? luksoTestnet,
    transport: http(connectedChain?.rpcUrls.default.http[0]),
  });
};
export { appConfig, readClient, useReadClient };
