import { Address } from "viem";
import { Abi } from "abitype";

export type InheritedFunctions = { readonly [key: string]: string };

export type GenericContract = {
  address: Address;
  abi: Abi;
  inheritedFunctions?: InheritedFunctions;
  external?: true;
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract;
  };
};

export type VaultListing = {
  vault_address: string;
  nft_contract: string;
  seller: string;
  price_in_lyx: number;
  title: string;
  description?: string;
  location?: string;
  images?: string[];
  category?: string;
  notes?: string;
  status: "listed" | "sold" | "disputed" | "cancelled";
  created_at: string;
  updated_at?: string;
};

export type VaultOrder = {
  vault_address: string;
  buyer: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  address1: string;
  address2?: string;
  payment_method?: string;
  status: "pending" | "confirmed" | "shipped" | "cancelled";
  created_at: string;
};
