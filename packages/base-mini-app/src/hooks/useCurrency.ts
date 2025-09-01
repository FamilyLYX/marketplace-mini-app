import { useAccount } from "wagmi";
import { base, baseSepolia, luksoTestnet } from "wagmi/chains";

enum SupportedChains {
  BaseSepolia = baseSepolia.id,
  Base = base.id,
  Lyx = luksoTestnet.id as number,
  baseMainnet = base.id,
}

const currencyMap: Record<SupportedChains, string> = {
  [SupportedChains.BaseSepolia]: "ETH",
  [SupportedChains.Base]: "XDC",
  [SupportedChains.Lyx]: "LYX",
  [SupportedChains.baseMainnet]: "ETH",
};

export const useCurrency = () => {
  const { chain } = useAccount();
  return (
    chain?.nativeCurrency.symbol ??
    currencyMap[chain?.id as keyof typeof currencyMap] ??
    "ETH"
  );
};
