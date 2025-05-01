# Family Protocol -(Open Beta)

The 'Family Protocol' will be an open, trusted standard infrastructure for the phygital economy on LUKSO. It'll provide enterprises/corporations the ability to connect their physical products to the blockchain via Digital Product Passports (DPPs) and enable secure peer-to-peer trading of these verified assets in our RWA marketplace.

---

## Hackathon Submission: Open Beta Rationale

This submission represents the **Open Beta** launch of the core 'Family Protocol' functionalities on LUKSO

**Why Open Beta for the Hackathon?**

* **Validate Core Mechanics:** To demonstrate and gather feedback on our novel approaches:
    * The **Phygital DPP NFT Standard** (modified LSP8 with UID verification).
    * The **'Family Vault'** marketplace architecture (LSP9-based, vault-per-listing).
* **Showcase LUKSO Integration:** To highlight how we leverage LUKSO's core standards (LSP0, LSP6, LSP8, LSP9, etc.) to build identity-centric RWA solutions.
* **Community Engagement:** To allow the LUKSO community and hackathon participants to interact directly with the foundational elements of our protocol and provide valuable early feedback.
* **Iterative Development:** This beta serves as a crucial step in our roadmap towards a full V1 launch, allowing us to refine the technology based on real-world testing.

---

## Technical Overview (Open Beta)

This Open Beta focuses on the core mechanics implemented as a mini-dApp interacting with LUKSO standards

**1. Core LUKSO Standards Leveraged:**

* **LSP0 Universal Profile:** User identity for minting, owning, and trading.
* **LSP6 Key Manager / LSP20 Call Verification:** Secure, permissioned control over UP actions.
* **LSP8 Identifiable Digital Asset:** Base standard for our custom DPP NFT.
* **LSP9 Vault:** Base standard for our individual marketplace escrow contracts ("Family Vaults").
* **LSP4 Digital Asset Metadata:** Standard for linking to off-chain DPP JSON data.
* **ERC725Y/X:** Key-value storage and contract execution.
* **LSP1 Universal Receiver:** Notifications for contracts.
* **LSP14 Ownable2Step:** Access control for contracts.
* **ERC1271/LSP6:** Signature validation for UID-gated transfers.

**2. Smart Contracts (Solidity):**

* **`DPPNFT.sol` (Template):**
    * Represents a **single** physical asset per deployed contract instance in this MVP architecture.
    * Inherits LSP8/LSP14/ERC725Y.
    * Stores `keccak256` hash of the **UID URL** (`_DPP_UID_HASH_KEY`).
    * Stores **LSP4 Metadata URI** (`_LSP4_METADATA_KEY`).
    * Stores selected foundational on-chain keys (`ProductID`, `ProductCategoryID`, `IssuerAddress`, `ManufacturingDate`, `DPPGranularityLevel`, `ComplianceStatus`).
    * Implements **UID-gated ownership transfer** via `transferOwnershipWithUID` requiring a signature verified via LSP6/ERC1271.
* **`DPPNFTFactory.sol`:**
    * Deploys new instances of the `DPPNFT` contract for each tokenization request.
    * Initializes the deployed contract with owner, UID hash, metadata URI, etc.
    * Emits `DPPNFTCreated` event.
* **`FamilyVault.sol`:**
    * Based on LSP9, deployed per listing via a (separate) Vault Factory.
    * Manages P2P escrow state machine using ERC725Y.
    * Holds the `DPPNFT` contract address (as the asset) and buyer funds (LYX).
    * Includes `confirmReceipt` logic interacting with the `DPPNFT`'s UID verification mechanism (requiring signature).
    * Executes ownership transfer of the `DPPNFT` contract and fund release upon successful confirmation.
* **`FamilyVaultFactory.sol`:**
    * Deploys new instances of the `FamilyVault` contract for each marketplace listing request.
    * Emits `VaultCreated` event.

**3. Frontend Mini-dApp:**

* Simple web application (e.g., React) demonstrating core flows.
* Connects to user's Universal Profile via **UP Browser Extension**.
* Uses `ethers.js` and LUKSO libraries (`lsp-smart-contracts`) for blockchain interaction.
* Communicates with LUKSO Testnet via **The Grid RPC endpoints**.

**4. Off-Chain Components (Simplified for MVP):**

* **UID Generation:** Assumes off-chain generation of the 6-symbol code (hashed before passing to factory) or UID URL (hashed before passing to factory).
* **Metadata Storage:** Assumes LSP4 JSON data is hosted at a URI (e.g., IPFS, simple HTTPS endpoint).
* **Signature Generation Service:** A conceptual off-chain service needed to help the user generate the `verificationSignature` after interacting with the UID URL (implementation details may vary for hackathon demo).
* **NO Central Indexer:** The MVP mini-dApp focuses on user-centric views (their own assets/listings) rather than global marketplace browsing.

---

## Architectural Diagram

A simplified diagram illustrating the interaction between the Frontend Mini-dApp, UP Browser Extension, LUKSO Testnet (The Grid), Family Protocol Smart Contracts (Factory, DPPNFT instance, Vault), and conceptual Off-Chain components can be found in the repository at:

*(Insert Diagram)*

---

## Key User Flows Demonstrated (Open Beta)

The Open Beta mini-dApp allows users to experience the following core flows:

1.  **Connect Universal Profile:** Authenticate and connect using the UP-Provider.
2.  **Tokenize Item (via Factory):**
    * Input basic product details.
    * Trigger the `DPPNFTFactory` to deploy a new, unique `DPPNFT` contract instance representing the item, setting its initial data (UID hash, metadata link, etc.) and assigning ownership to the user's UP.
3.  **View Owned Assets:** See the deployed `DPPNFT` contracts owned by the connected UP.
4.  **List Asset for Sale (Vault Creation):**
    * Select an owned `DPPNFT` contract.
    * Set a price.
    * Trigger the `FamilyVaultFactory` to deploy a dedicated `FamilyVault` contract for this sale.
    * Authorize the Vault to manage the `DPPNFT` contract (e.g., transfer ownership to vault or grant operator role - specific mechanism depends on Vault implementation).
5.  **Purchase Asset (Simulated Buyer):**
    * Interact directly with a known `FamilyVault` address.
    * Send required LYX payment from a buyer UP to the Vault.
6.  **Confirm Receipt & Settle Trade (Simulated Buyer):**
    * Simulate scanning the UID URL and generating the `verificationSignature` off-chain.
    * Call `confirmReceipt(verificationSignature)` on the `FamilyVault`.
    * The Vault verifies the signature against the `DPPNFT`'s stored UID hash and the buyer's UP.
    * If valid, the Vault transfers ownership of the `DPPNFT` contract to the buyer UP and sends funds to the seller UP.

---

## Important Links

MiniApp Link: *Insert Link*
Video Walkthrough: *Insert Link*

---

## Future Work

This Open Beta is the first step. Our roadmap includes:

* Refining the Phygital Standard and Vault logic based on feedback.
* Developing the full enterprise DPP Platform.
* Implementing the decentralized Juror system ($FAM staking).
* Preparing for TGE ($FAM token launch).
* Developing and deploying an L2 solution for scalability.
* Expanding support for more RWA types and cross-industry interoperability features.

---

## Team

* James Albarracin (Co-founder/CEO)
* Bhavya Gor (Co-founder/CTO)
* Azeez Mumeen (Full Stack Developer)

---

Thank you for testing the Family Protocol Open Beta! Please provide feedback via [[Click Here](https://x.com/FamilyLYX)].
