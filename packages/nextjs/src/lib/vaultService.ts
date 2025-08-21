import { Vault } from "@/types";
import { adminDb } from "./firerbase";

export class VaultService {
  static async findByOrderStatus(orderStatus: string) {
    try {
      const vaults = await adminDb
        .collection("vaults")
        .where("order_status", "==", orderStatus)
        .get();
      return { success: true, data: vaults.docs.map((doc) => doc.data()) };
    } catch (error) {
      console.error("Error fetching vaults:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async createVault(vaultData: Vault) {
    try {
      const newVault = await adminDb.collection("vaults").add(vaultData);
      return { success: true, data: newVault };
    } catch (error) {
      console.error("Error creating vault:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async deleteVault(vaultAddress: string) {
    try {
      await adminDb
        .collection("vaults")
        .where("vault_address", "==", vaultAddress)
        .get()
        .then((docs) => {
          docs.forEach((doc) => doc.ref.delete());
        });
      return { success: true };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  /**
   * Create or update a vault
   */
  static async upsert(vault_address: string, vaultData: Vault) {
    try {
      console.log(vaultData, "vaultData upsert");
      const vault = await adminDb
        .collection("vaults")
        .where("vault_address", "==", vault_address)
        .get();
      if (vault.docs.length > 0) {
        await adminDb
          .collection("vaults")
          .doc(vault.docs[0].id)
          .update(vaultData);
      } else {
        await adminDb.collection("vaults").add({
          ...vaultData,
          vault_address: vault_address,
        });
      }

      return { success: true, data: vault };
    } catch (error) {
      console.error("Error upserting vault:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all vaults
   */
  static async getAllVaults() {
    try {
      const vaults = await adminDb.collection("vaults").get();
      const vaultsData = vaults.docs.map((doc) => doc.data());
      console.log("Mock vaults:", vaultsData, vaults.docs.length);

      return { success: true, data: vaultsData };
    } catch (error) {
      console.error("Error fetching vaults:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get vault by address
   */
  static async getVaultByAddress(vaultAddress: string) {
    try {
      const vault = await adminDb
        .collection("vaults")
        .where("vault_address", "==", vaultAddress)
        .get();

      return { success: true, data: vault };
    } catch (error) {
      console.error("Error fetching vault:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update vault status
   */
  static async updateVaultStatus(vaultAddress: string, orderStatus: string) {
    try {
      const vaultRef = adminDb.collection("vaults").doc(vaultAddress);
      const vault = await vaultRef.get();
      if (vault.exists) {
        await vaultRef.update({ order_status: orderStatus });
      }

      return { success: true, data: vault };
    } catch (error) {
      console.error("Error updating vault status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
