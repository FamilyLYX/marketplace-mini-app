import { Vault } from "@/types/index";
import { VaultService } from "./vaultService";

export async function createVault(vault: Vault) {
  try {
    const newVault = await VaultService.createVault({
      ...vault,
      created_at: Date.now().toString(),
    });
    return newVault;
  } catch (error) {
    console.error("Error creating vault:", error);
    throw error;
  }
}

export async function getAllVaults(chainId: number) {
  try {
    if (!chainId) {
      const vaults = await VaultService.getAllVaults();
      return vaults;
    } else {
      const vaults = await VaultService.getAllVaultsByChainId(chainId);
      return vaults;
    }
  } catch (error) {
    console.error("Error fetching vaults:", error);
    throw error;
  }
}

export async function upsertVault(vault_address: string, vault: Vault) {
  try {
    const updatedVault = await VaultService.upsert(vault_address, vault);
    return updatedVault;
  } catch (error) {
    console.error("Error upserting vault:", error);
    throw error;
  }
}

export async function getAllVaultsInOrderStatusPending() {
  try {
    const vaults = await VaultService.findByOrderStatus("pending");
    return vaults;
  } catch (error) {
    console.error("Error fetching vaults:", error);
    throw error;
  }
}

export async function getVaultByAddress(vault_address: string) {
  try {
    const vault = await VaultService.getVaultByAddress(vault_address);
    return vault;
  } catch (error) {
    console.error("Error fetching vault:", error);
    throw error;
  }
}

export async function updateVault(
  vault_address: string,
  updates: Partial<Vault>
) {
  try {
    // Return mock updated vault
    const mockVault = {
      id: "mock_vault_id",
      vault_address: vault_address,
      first_name: "Mock",
      last_name: "User",
      email: "mock@example.com",
      phone: "+1234567890",
      order_status: "pending",
      created_at: new Date().toISOString(),
      ...updates,
      updated_at: new Date().toISOString(),
    };
    console.log("Mock vault updated:", mockVault);
    return mockVault;
  } catch (error) {
    console.error("Error updating vault:", error);
    throw error;
  }
}

export async function deleteVault(vault_address: string) {
  try {
    await VaultService.deleteVault(vault_address);
    return { success: true };
  } catch (error) {
    console.error("Error deleting vault:", error);
    throw error;
  }
}
