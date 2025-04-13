// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "./FamilyVault.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

contract FamilyVaultTest is Test {
    FamilyVault private familyVault;
    address private seller;
    address private buyer;
    address private nftContract;
    bytes32 private tokenId;
    uint256 private priceInLYX;
    bytes32 private expectedUIDHash;

    function setUp() public {
        // Set up initial variables for the test
        seller = address(0x1);
        buyer = address(0x2);
        nftContract = address(0x3);
        tokenId = bytes32(keccak256(abi.encodePacked("Token1")));
        priceInLYX = 1000;
        expectedUIDHash = keccak256(abi.encodePacked("UID123"));

        // Deploy the FamilyVault contract
        familyVault = new FamilyVault(
            seller,
            nftContract,
            tokenId,
            priceInLYX,
            expectedUIDHash
        );
    }

    function testVaultInitialization() public {
        // Check initial values
        assertEq(familyVault.seller(), seller);
        assertEq(familyVault.nftContract(), nftContract);
        assertEq(familyVault.tokenId(), tokenId);
        assertEq(familyVault.priceInLYX(), priceInLYX);
        assertEq(familyVault.expectedUIDHash(), expectedUIDHash);
        assertEq(
            uint256(familyVault.state()),
            uint256(FamilyVault.VaultState.Initialized)
        );
    }

    function testDepositFunds() public {
        vm.startPrank(buyer); // Impersonate buyer
        vm.deal(buyer, priceInLYX); // Send LYX to buyer

        // Test deposit function
        vm.expectEmit(true, true, true, true);
        emit FamilyVault.FundsDeposited(buyer, priceInLYX);

        familyVault.receive{value: priceInLYX}();

        // Verify the state change and buyer address
        assertEq(
            uint256(familyVault.state()),
            uint256(FamilyVault.VaultState.FundsDeposited)
        );
        assertEq(familyVault.buyer(), buyer);

        vm.stopPrank();
    }

    function testConfirmReceipt() public {
        vm.startPrank(buyer);
        vm.deal(buyer, priceInLYX); // Send funds to buyer
        familyVault.receive{value: priceInLYX}();

        // Test confirmReceipt function
        string memory validUID = "UID123";
        vm.expectEmit(true, true, true, true);
        emit FamilyVault.ReceiptConfirmed(buyer);

        familyVault.confirmReceipt(validUID);

        // Verify the state change
        assertEq(
            uint256(familyVault.state()),
            uint256(FamilyVault.VaultState.DeliveryConfirmed)
        );

        vm.stopPrank();
    }

    function testSettleTrade() public {
        vm.startPrank(buyer);
        vm.deal(buyer, priceInLYX);
        familyVault.receive{value: priceInLYX}();

        // Simulate delivery confirmation
        string memory validUID = "UID123";
        familyVault.confirmReceipt(validUID);

        // Test _settleTrade function
        vm.expectEmit(true, true, true, true);
        emit FamilyVault.TradeCompleted();

        // Perform internal trade settlement
        familyVault._settleTrade();

        // Verify the final state
        assertEq(
            uint256(familyVault.state()),
            uint256(FamilyVault.VaultState.Completed)
        );
        vm.stopPrank();
    }

    function testInitiateDispute() public {
        vm.startPrank(buyer);
        vm.deal(buyer, priceInLYX);
        familyVault.receive{value: priceInLYX}();

        // Initiate dispute before delivery confirmation
        vm.expectEmit(true, true, true, true);
        emit FamilyVault.DisputeOpened(buyer);

        familyVault.initiateDispute();

        // Verify the state after dispute
        assertEq(
            uint256(familyVault.state()),
            uint256(FamilyVault.VaultState.Disputed)
        );
        vm.stopPrank();
    }

    function testCannotInitiateDisputeInInvalidState() public {
        vm.startPrank(seller);
        vm.deal(seller, priceInLYX);
        familyVault.receive{value: priceInLYX}();

        // Dispute cannot be initiated after trade completion
        familyVault.confirmReceipt("UID123");

        vm.expectRevert("Can't dispute now");

        familyVault.initiateDispute();

        vm.stopPrank();
    }

    function testUIDMismatch() public {
        vm.startPrank(buyer);
        vm.deal(buyer, priceInLYX);
        familyVault.receive{value: priceInLYX}();

        // Test UID mismatch
        string memory invalidUID = "InvalidUID";
        vm.expectRevert("UID hash mismatch");

        familyVault.confirmReceipt(invalidUID);

        vm.stopPrank();
    }
}
