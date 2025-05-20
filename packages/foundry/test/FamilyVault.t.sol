// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../src/FamilyVault.sol";
import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";

contract MockLSP8 is LSP8IdentifiableDigitalAsset {
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) LSP8IdentifiableDigitalAsset(name, symbol, initialOwner, 0, 0) {}

    function mint(address to, bytes32 tokenId) external {
        _mint(to, tokenId, true, "0x");
    }
}

contract FamilyVaultTest is Test {
    FamilyVault public vault;
    MockLSP8 public nft;

    address public admin = address(0xA11CE);
    address public seller = address(0xB0B);
    address public buyer = address(0xC0DE);
    bytes32 public tokenId = bytes32("UNIQUE_ID_001");
    uint256 public price = 1 ether;
    string public uidPlainText = "secret-uid";
    bytes32 public uidHash;

    function setUp() public {
        // Deploy mock NFT
        nft = new MockLSP8("TestNFT", "TNFT", seller);

        // Mint NFT to seller
        vm.prank(seller);
        nft.mint(seller, tokenId);

        // Deploy and initialize vault
        vault = new FamilyVault();
        uidHash = keccak256(abi.encodePacked(uidPlainText));

        vm.prank(seller);
        vault.initialize(admin, seller, address(nft), tokenId, price, uidHash);

        // Seller sends NFT to vault
        vm.prank(seller);
        nft.transfer(seller, address(vault), tokenId, true, "0x");

        // Trigger universalReceiver
        vault.universalReceiver(0x0, "0x");
    }

    function testInitialState() public {
        assertEq(address(vault.admin()), admin);
        assertEq(address(vault.seller()), seller);
        assertEq(vault.state(), FamilyVault.VaultState.Listed);
        assertEq(nft.tokenOwnerOf(tokenId), address(vault));
    }

    function testDepositFundsAndConfirmReceipt() public {
        vm.deal(buyer, 1 ether);

        // Buyer deposits exact amount
        vm.prank(buyer);
        (bool sent, ) = address(vault).call{value: price}("");
        assertTrue(sent);
        assertEq(vault.buyer(), buyer);
        assertEq(vault.state(), FamilyVault.VaultState.FundsDeposited);

        // Buyer confirms receipt with correct UID
        vm.prank(buyer);
        vault.confirmReceipt(uidPlainText);

        // NFT transferred to buyer
        assertEq(nft.tokenOwnerOf(tokenId), buyer);
        assertEq(vault.state(), FamilyVault.VaultState.Completed);
    }

    function testCancelAndRelist() public {
        // Seller cancels the trade
        vm.prank(seller);
        vault.cancelTrade();
        assertEq(vault.state(), FamilyVault.VaultState.Cancelled);

        // Seller relists the trade
        vm.prank(seller);
        vault.relist();
        assertEq(vault.state(), FamilyVault.VaultState.Listed);
    }

    function testDisputeAndAdminResolution() public {
        vm.deal(buyer, 1 ether);

        // Buyer deposits funds
        vm.prank(buyer);
        address(vault).call{value: price}("");

        assertEq(vault.state(), FamilyVault.VaultState.FundsDeposited);

        // Seller initiates dispute
        vm.prank(seller);
        vault.initiateDispute();
        assertEq(vault.state(), FamilyVault.VaultState.Disputed);

        // Admin resolves dispute in favor of buyer
        vm.prank(admin);
        vault.resolveDispute(buyer, buyer);

        assertEq(vault.state(), FamilyVault.VaultState.Completed);
        assertEq(nft.tokenOwnerOf(tokenId), buyer);
    }

    function testFailConfirmReceiptWrongUID() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        address(vault).call{value: price}("");

        vm.prank(buyer);
        vault.confirmReceipt("wrong-uid"); // should revert with UIDHashMismatch
    }

    function testFailDepositWrongAmount() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        address(vault).call{value: price - 0.1 ether}(""); // incorrect payment
    }

    function testFailNonBuyerConfirmReceipt() public {
        vm.prank(seller);
        vault.confirmReceipt(uidPlainText); // should revert NotBuyer
    }

    function testFailNonAdminResolvesDispute() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        address(vault).call{value: price}("");

        vm.prank(buyer);
        vault.initiateDispute();

        vm.prank(seller);
        vault.resolveDispute(buyer, buyer); // should revert NotAdmin
    }
}
