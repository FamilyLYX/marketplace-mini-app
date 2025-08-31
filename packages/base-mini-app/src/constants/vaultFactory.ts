import { Abi } from "viem";
import { base, baseSepolia, luksoTestnet, xdcTestnet } from "viem/chains";
import { useAccount } from "wagmi";

const FAMILY_VAULT_FACTORY_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_implementation", type: "address", internalType: "address" },
      { name: "_admin", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createVault",
    inputs: [
      { name: "_nftContract", type: "address", internalType: "address" },
      { name: "_tokenId", type: "bytes32", internalType: "bytes32" },
      { name: "_priceInLYX", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "clone", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getVaults",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "implementation",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaults",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "VaultCreated",
    inputs: [
      {
        name: "vaultAddress",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "admin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "seller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nftContract",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "priceInLYX",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "InvalidAdmin", inputs: [] },
  { type: "error", name: "InvalidImplementation", inputs: [] },
  { type: "error", name: "InvalidNFTContract", inputs: [] },
  { type: "error", name: "InvalidUIDHash", inputs: [] },
] as Abi;
const FAMILY_VAULT_FACTORY_ADDRESS =
  "0x03a901a563FCD2692046FFd08A510f0246253596" as `0x${string}`;

const FAMILY_VAULT_FACTORY_ADDRESSES = {
  [luksoTestnet.id]: FAMILY_VAULT_FACTORY_ADDRESS,
  [xdcTestnet.id]:
    "0x58d682dAc73551c6CD8Be22cF0dAF13466C9d621" as `0x${string}`,
  [baseSepolia.id]:
    "0x5F2171087a1ECda762afFbD26a8182656ce6623C" as `0x${string}`,

  [base.id]: "0x03a901a563FCD2692046FFd08A510f0246253596" as `0x${string}`,
};

const useVaultFactoryAddress = () => {
  const { chain } = useAccount();
  return FAMILY_VAULT_FACTORY_ADDRESSES[
    (chain?.id as keyof typeof FAMILY_VAULT_FACTORY_ADDRESSES) ?? base.id
  ];
};

export {
  FAMILY_VAULT_FACTORY_ABI,
  FAMILY_VAULT_FACTORY_ADDRESS,
  useVaultFactoryAddress,
};
