import { useAccount } from "wagmi";

const currencyMap = {
  84532: "ETH",
  51: "XDC",
  4201: "LYX",
};

export const useCurrency = () => {
  const { chainId } = useAccount();
  return currencyMap[(chainId as keyof typeof currencyMap) ?? 4201];
};
