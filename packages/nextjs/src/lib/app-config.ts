import { createPublicClient, http } from "viem";
import { lukso, luksoTestnet } from "viem/chains";

interface Config {
  salt_db: string;
  vaults_db: string;
  chain: typeof lukso | typeof luksoTestnet;
  chainUrl: ReturnType<typeof http>;
}

let appConfig: Config;

export const TESTNET_CONFIG = {
  salt_db: "dpp_salts_testnet",
  vaults_db: "vaults_testnet",
  chain: luksoTestnet,
  chainUrl: http("https://rpc.testnet.lukso.network"),
};

export const MAINNET_CONFIG = {
  salt_db: "dpp_salts",
  vaults_db: "vaults",
  chain: lukso,
  chainUrl: http("https://rpc.mainnet.lukso.network"),
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
