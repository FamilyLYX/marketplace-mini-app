import { Abi } from "viem";

const FAMILY_VAULT_FACTORY_ABI = [
  {
    type: "function",
    name: "createVault",
    inputs: [
      {
        name: "_admin",
        type: "address",
        internalType: "address",
      },
      {
        name: "_nftContract",
        type: "address",
        internalType: "address",
      },
      {
        name: "_priceInLYX",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_expectedUIDHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getVaults",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaults",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
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
      {
        name: "expectedUIDHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
] as Abi;
const FAMILY_VAULT_FACTORY_ADDRESS =
  "0xa4A84629e9c2C6eAC239546a16da1B535EA084e0" as `0x${string}`;

export { FAMILY_VAULT_FACTORY_ABI, FAMILY_VAULT_FACTORY_ADDRESS };
