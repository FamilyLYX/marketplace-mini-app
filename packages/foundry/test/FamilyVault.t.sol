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
    // Main contracts
    FamilyVault vault;
    MockLSP8 nftContract;

    // Actors
    address admin = vm.addr(0x99);
    address seller = vm.addr(0x1);
    address buyer = vm.addr(2);
    address thirdParty = vm.addr(0x3);

    // Test parameters
    bytes32 tokenId = bytes32(uint256(1));
    uint256 price = 1 ether;
    string plainUidCode = "SECRET1234";
    bytes32 uidHash = keccak256(abi.encodePacked(plainUidCode));

    // Events
    event VaultInitialized(
        address indexed seller,
        address nftContract,
        bytes32 tokenId,
        uint256 price
    );
    event FundsDeposited(address indexed buyer, uint256 amount);
    event ReceiptConfirmed(address indexed buyer);
    event TradeCompleted();
    event DisputeOpened(address indexed initiator);
    event TradeSettledByAdmin(address indexed admin);

    function setUp() public {
        // Setup seller with some ETH
        vm.deal(admin, 10 ether);
        vm.deal(seller, 10 ether);
        vm.deal(buyer, 10 ether);

        // Deploy NFT contract with seller as owner
        vm.prank(seller);
        nftContract = new MockLSP8("TestNFT", "TNFT", seller);

        // Deploy vault contract
        vm.prank(seller);
        vault = new FamilyVault(
            admin,
            seller,
            address(nftContract),
            tokenId,
            price,
            uidHash
        );
    }

    function test_InitialState() public {
        assertEq(address(vault.seller()), seller);
        assertEq(address(vault.nftContract()), address(nftContract));
        assertEq(vault.tokenId(), tokenId);
        assertEq(vault.priceInLYX(), price);
        assertEq(vault.expectedUIDHash(), uidHash);
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Initialized));
    }

    function test_VaultFlow_FullHappyPath() public {
        // Mint NFT to seller
        vm.prank(seller);
        nftContract.mint(seller, tokenId);

        // Transfer NFT to vault
        vm.prank(seller);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");

        console.log(
            "Vault is token owner: %s",
            nftContract.tokenOwnerOf(tokenId) == address(vault)
        );

        // Verify state changed to Listed
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Listed));

        // Buyer deposits funds
        vm.prank(buyer);
        vm.expectEmit(true, false, false, true);
        emit FundsDeposited(buyer, price); // Expect FundsDeposited event
        (bool success, ) = address(vault).call{value: price}("");
        assertTrue(success);

        // Verify state and buyer address after deposit
        assertEq(vault.buyer(), buyer);
        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.FundsDeposited)
        );

        // Confirm receipt with correct UID
        vm.prank(buyer);
        vm.expectEmit(true, false, false, false);
        console.log("Before confirmReceipt: state = %s", uint(vault.state()));
        emit ReceiptConfirmed(buyer); // Expect ReceiptConfirmed event
        vm.prank(buyer);
        vault.confirmReceipt(plainUidCode);
        console.log("After confirmReceipt: state = %s", uint(vault.state()));

        // Verify final state and balances/ownership
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Completed)); // Final state should be Completed
        assertEq(nftContract.tokenOwnerOf(tokenId), buyer); // NFT should now belong to buyer
        assertEq(address(seller).balance, 11 ether); // Seller should have received 1 ether from the sale (total balance should be 11 ether)
    }

    function test_WrongPaymentAmount() public {
        // Mint and transfer NFT to vault
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        // Try to pay wrong amount
        vm.prank(buyer);
        vm.expectRevert("Incorrect payment");
        address(vault).call{value: 0.5 ether}("");
    }

    function test_CannotBuyBeforeNFTDeposit() public {
        // Try to buy before NFT is deposited
        vm.prank(buyer);
        vm.expectRevert("Invalid state");
        address(vault).call{value: price}("");
    }

    function test_WrongUIDConfirmation() public {
        // Setup vault with NFT and buyer payment
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: price}("");
        assertTrue(success);

        // Try to confirm with wrong UID
        vm.prank(buyer);
        vm.expectRevert("UID hash mismatch");
        vault.confirmReceipt("WRONG_SECRET");
    }

    function test_OnlyBuyerCanConfirm() public {
        // Setup vault with NFT and buyer payment
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: price}("");
        assertTrue(success);

        // Try to confirm from non-buyer address
        vm.prank(thirdParty);
        vm.expectRevert("Not buyer");
        vault.confirmReceipt(plainUidCode);
    }

    function test_UniversalReceiverWithWrongParameters() public {
        // Mint NFT
        vm.prank(seller);
        nftContract.mint(seller, tokenId);

        // Call universalReceiver from wrong contract
        vm.prank(thirdParty);
        vault.universalReceiver(bytes32(0), abi.encode(tokenId));

        // State should still be Initialized
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Initialized));
    }

    function test_CannotDoubleDeposit() public {
        // Setup vault with NFT and buyer payment
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: price}("");
        assertTrue(success);

        // Try to deposit again
        vm.prank(thirdParty);
        vm.expectRevert("Invalid state");
        (success, ) = address(vault).call{value: price}("");
        assertFalse(success);
    }

    function test_RevertOnDirectTransfer() public {
        // Setup vault with NFT
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        // State should be Listed
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Listed));

        // Try to call a nonexistent function while sending ETH
        // This should actually call receive() since we have no fallback function
        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: price}("");
        assertTrue(success); // This should actually succeed because receive() is called

        // Verify that the state changed to FundsDeposited
        // since receive() was called successfully
        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.FundsDeposited)
        );
    }

    function test_CanInitiateDispute_AsBuyerOrSeller() public {
        // Setup: Mint NFT, transfer to vault, buyer deposits
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: price}("");
        assertTrue(success);

        // Buyer initiates dispute
        vm.prank(buyer);
        vault.initiateDispute();
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Disputed));

        // Reset for seller dispute
        setUp(); // resets the contract

        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.prank(buyer);
        (success, ) = address(vault).call{value: price}("");
        assertTrue(success);

        vm.prank(seller);
        vault.initiateDispute();
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Disputed));
    }

    function test_AdminCanResolveDisputeToBuyer() public {
        // Setup
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: price}("");
        assertEq(buyer.balance, 9 ether); // buyer should have 9 ether after deposit
        assertTrue(success);

        vm.prank(buyer);
        vault.initiateDispute();

        vm.deal(address(vault), price); // Simulate vault has funds

        // Admin resolves dispute in favor of buyer
        vm.prank(admin);
        vm.expectEmit(true, false, false, false);
        emit TradeSettledByAdmin(admin);
        vault.resolveDispute(buyer, buyer); // NFT + funds to buyer

        assertEq(nftContract.tokenOwnerOf(tokenId), buyer);
        assertEq(buyer.balance, 10 ether); // received refund
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Completed));
    }

    function test_AdminCanResolveDisputeToSeller() public {
        // Setup
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: price}("");
        assertTrue(success);

        vm.prank(seller);
        vault.initiateDispute();

        vm.deal(address(vault), price); // Simulate vault has funds

        // Admin resolves dispute in favor of seller
        vm.prank(admin);
        vault.resolveDispute(seller, seller); // NFT + funds to seller

        assertEq(nftContract.tokenOwnerOf(tokenId), seller);
        assertEq(seller.balance, 11 ether); // received payment
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Completed));
    }

    function test_OnlyAdminCanResolveDispute() public {
        // Setup
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: price}("");
        assertTrue(success);

        vm.prank(seller);
        vault.initiateDispute();

        vm.prank(buyer);
        vm.expectRevert("Not admin");
        vault.resolveDispute(buyer, buyer);
    }

    function test_ResolveDispute_OnlyInDisputedState() public {
        // Try resolve without dispute
        vm.startPrank(seller);
        nftContract.mint(seller, tokenId);
        nftContract.transfer(seller, address(vault), tokenId, true, "0x");
        vm.stopPrank();

        vm.deal(address(vault), price);

        vm.prank(admin);
        vm.expectRevert("Invalid state");
        vault.resolveDispute(buyer, buyer);
    }
}
