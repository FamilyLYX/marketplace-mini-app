import { createPublicClient, http } from "viem";
import { lukso, luksoTestnet } from "viem/chains";

interface Config {
  salt_db: string;
  vaults_db: string;
  chain: typeof lukso | typeof luksoTestnet;
  chainUrl: ReturnType<typeof http>;
  adminAddress: `0x${string}`;
}

let appConfig: Config;

export const TESTNET_CONFIG = {
  salt_db: "dpp_salts_testnet",
  vaults_db: "vaults_testnet",
  chain: luksoTestnet,
  chainUrl: http("https://rpc.testnet.lukso.network"),
  adminAddress:
    (process.env.NEXT_PUBLIC_ADMIN_TESTNET_ADDRESS as `0x${string}`) ??
    "0x9fBd3638Fc8D6c8C25f44200f5dbD1e3e9F25959",
};

export const MAINNET_CONFIG = {
  salt_db: "dpp_salts",
  vaults_db: "vaults",
  chain: lukso,
  chainUrl: http("https://rpc.mainnet.lukso.network"),
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
export { appConfig, readClient };
