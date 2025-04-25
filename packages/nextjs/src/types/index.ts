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

export type Vault = {
  vault_address: string;
  nft_contract: string;
  seller: string;
  price_in_lyx: string;
  title: string;
  description?: string;
  location?: string;
  images?: string[];
  category?: string;
  notes?: string;
  brand?: string;
  listing_status: "listed" | "sold" | "disputed" | "cancelled";
  buyer?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  address1?: string;
  address2?: string;
  payment_method?: string;
  order_status?: "pending" | "confirmed" | "shipped" | "cancelled";
  created_at: string;
  updated_at?: string;
};
