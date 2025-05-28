// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import {FamilyVault} from "../src/FamilyVault.sol"; // Assuming FamilyVault.sol is in src/

// Updated Interface for the Mock Contract
interface IMockLSP8andDPPNFT {
    function getDataForTokenId(
        bytes32 tokenId,
        bytes32 key
    ) external view returns (bytes32);

    function transferWithUIDRotation(
        bytes32 tokenId,
        address to,
        bytes memory data,
        string calldata salt,
        string calldata plainUidCode,
        bytes32 newUidHash
    ) external;

    function tokenOwnerOf(bytes32 tokenId) external view returns (address);

    // Test setup functions
    function setHash(bytes32 hash) external;

    function setOwner(address owner) external;

    // Getter for last transfer details (optional, for more specific assertions)
    function getLastTransferTo() external view returns (address);

    function getLastNewUidHash() external view returns (bytes32);
}

/// @notice Mock contract for the DPPNFT and LSP8 interface used by FamilyVault
contract MockDPPNFT is IMockLSP8andDPPNFT {
    bytes32 private _hash;
    address private _owner;

    bool public transferWithUIDRotationCalled;
    address public _lastTransferTo;
    bytes32 public _lastNewUidHash;

    // --- Test Setup Functions ---
    function setHash(bytes32 hash) external override {
        _hash = hash;
    }

    function setOwner(address owner) external override {
        _owner = owner;
    }

    // --- Implementation of IDPPNFT methods ---
    function getDataForTokenId(
        bytes32 /*tokenId*/, // tokenId and key often ignored in simple mocks
        bytes32 /*key*/ // For FamilyVault, key would be keccak256("DPP_UID_Hash")
    ) external view override returns (bytes32) {
        return _hash;
    }

    function transferWithUIDRotation(
        bytes32 /*tokenId*/,
        address to,
        bytes memory /*data*/, // FamilyVault passes ""
        string calldata /*salt*/,
        string calldata /*plainUidCode*/,
        bytes32 newUidHash
    ) external override {
        _owner = to;
        transferWithUIDRotationCalled = true;
        _lastTransferTo = to;
        _lastNewUidHash = newUidHash;
    }

    // --- Implementation of ILSP8IdentifiableDigitalAsset methods ---
    function tokenOwnerOf(
        bytes32 /*tokenId*/
    ) external view override returns (address) {
        return _owner;
    }

    // --- Getter for last transfer details ---
    function getLastTransferTo() external view override returns (address) {
        return _lastTransferTo;
    }

    function getLastNewUidHash() external view override returns (bytes32) {
        return _lastNewUidHash;
    }
}

contract FamilyVaultTest is Test {
    FamilyVault vault;
    MockDPPNFT mockNft;

    address admin = vm.addr(0x1); // Using vm.addr for clarity
    address seller = vm.addr(0x2);
    address buyer = vm.addr(0x3);
    address randomUser = vm.addr(0x4);

    bytes32 tokenId = bytes32("token123");
    uint256 priceInLYX = 1 ether;
    string plainUidCode = "secretcode";
    string salt = "salty"; // Made distinct from "salt" in FamilyVault for clarity
    bytes32 constant NEW_UID_HASH_FOR_TESTS =
        keccak256(abi.encodePacked("newSalt", "newUidCode"));
    bytes32 private constant DPP_UID_HASH_KEY_TEST = keccak256("DPP_UID_Hash"); // For explicit use if mock checked key

    function setUp() public {
        mockNft = new MockDPPNFT();
        vault = new FamilyVault();

        // Mock NFT owner is vault initially for universalReceiver tests
        mockNft.setOwner(address(vault));

        vm.deal(admin, 10 ether);
        vm.deal(seller, 10 ether);
        vm.deal(buyer, 10 ether);
        vm.deal(randomUser, 10 ether);
        vm.deal(address(vault), 0); // Vault starts with 0 LYX
    }

    /*///////////////////////////////////////////////////////////////
                            Initialization tests
    ///////////////////////////////////////////////////////////////*/

    function test_initialize_success() public {
        // No prank needed if initializer is `external` and not `onlyOwner`
        // vm.prank(admin); // Not strictly needed for initialize itself
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);
        console.log("State after initialize:", uint(vault.state()));
        assertEq(vault.admin(), admin);
        assertEq(vault.seller(), seller);
        assertEq(vault.nftContract(), address(mockNft));
        assertEq(vault.tokenId(), tokenId);
        assertEq(vault.priceInLYX(), priceInLYX);
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Initialized));
        assertEq(vault.owner(), seller); // OwnableUpgradeable's owner
    }

    function test_initialize_revertsIfZeroAdmin() public {
        vm.expectRevert(FamilyVault.ZeroAddress.selector);
        vault.initialize(
            address(0),
            seller,
            address(mockNft),
            tokenId,
            priceInLYX
        );
    }

    function test_initialize_revertsIfZeroSeller() public {
        vm.expectRevert(FamilyVault.ZeroAddress.selector);
        vault.initialize(
            admin,
            address(0),
            address(mockNft),
            tokenId,
            priceInLYX
        );
    }

    function test_initialize_revertsIfZeroNFTContract() public {
        vm.expectRevert(FamilyVault.ZeroAddress.selector);
        vault.initialize(admin, seller, address(0), tokenId, priceInLYX);
    }

    /*///////////////////////////////////////////////////////////////
                            Receive Funds Tests
    ///////////////////////////////////////////////////////////////*/

    function _initAndList() internal {
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        // Call universalReceiver from nftContract to list the vault
        // Ensure mockNft is setup so tokenOwnerOf(tokenId) returns address(vault)
        mockNft.setOwner(address(vault)); // explicit set before universalReceiver call
        vm.prank(address(mockNft)); // msg.sender is nftContract
        vault.universalReceiver(bytes32(0), ""); // typeId and data are not used by this receiver logic
        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.Listed),
            "Vault not listed after universalReceiver"
        );
    }

    function test_receive_revertsIfNotListed() public {
        // Initialize but don't list
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);
        // Current state is Initialized

        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.Listed,
                FamilyVault.VaultState.Initialized
            )
        );
        (bool success, ) = address(vault).call{value: priceInLYX}("");
        assertFalse(
            success,
            "LYX deposit call should have reverted but succeeded"
        );
    }

    function test_receive_revertsIfIncorrectPayment() public {
        _initAndList(); // Vault state is Listed, priceInLYX is set

        vm.deal(buyer, priceInLYX - 1);
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.IncorrectPayment.selector,
                priceInLYX,
                priceInLYX - 1
            )
        );
        (bool success, ) = address(vault).call{value: priceInLYX - 1}("");
        assertFalse(
            success,
            "Incorrect LYX deposit call should have reverted but succeeded"
        );
    }

    function test_receive_acceptsCorrectPayment_andEmitsEvent() public {
        _initAndList(); // Vault state is Listed, priceInLYX is set

        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);

        vm.expectEmit(true, false, false, true);
        emit FamilyVault.FundsDeposited(buyer, priceInLYX);

        (bool success, ) = address(vault).call{value: priceInLYX}("");
        assertTrue(success, "LYX deposit call failed");

        assertEq(vault.buyer(), buyer, "Buyer address not set correctly");
        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.FundsDeposited),
            "Vault state not FundsDeposited"
        );
        assertEq(
            address(vault).balance,
            priceInLYX,
            "Vault LYX balance incorrect"
        );
    }

    /*///////////////////////////////////////////////////////////////
                        universalReceiver Tests
    ///////////////////////////////////////////////////////////////*/

    function test_universalReceiver_transitionsFromInitializedToListed()
        public
    {
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Initialized));

        // Ensure mockNft returns correct owner for the check within universalReceiver
        mockNft.setOwner(address(vault));
        vm.prank(address(mockNft)); // msg.sender is nftContract
        vault.universalReceiver(bytes32(0), "");

        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.Listed),
            "State not Listed"
        );
    }

    function test_universalReceiver_revertsIfNotOwner() public {
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        // Set mock nft owner != vault
        address notVaultOwner = vm.addr(0xDEAD);
        mockNft.setOwner(notVaultOwner);

        vm.prank(address(mockNft));
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.IncorrectTokenOwner.selector,
                address(vault),
                notVaultOwner
            )
        );
        vault.universalReceiver(bytes32(0), "");
    }

    function test_universalReceiver_returnsEmptyBytes() public {
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);
        mockNft.setOwner(address(vault)); // Ensure conditions are met for successful part of logic

        vm.prank(address(mockNft)); // Can be any sender if state != Initialized or msg.sender != nftContract
        bytes memory ret = vault.universalReceiver(bytes32(0), "");
        assertEq(ret.length, 0);
    }

    /*///////////////////////////////////////////////////////////////
                        confirmReceipt Tests
    ///////////////////////////////////////////////////////////////*/

    function _setupFundsDeposited() internal {
        _initAndList(); // Initializes, lists (sets state to Listed)

        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: priceInLYX}("");
        require(success, "Setup: LYX deposit failed"); // State -> FundsDeposited
        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.FundsDeposited)
        );

        // Set up the UID hash in the mock NFT for the `onlyCorrectUIDCode` modifier
        bytes32 expectedHash = keccak256(abi.encodePacked(salt, plainUidCode));
        mockNft.setHash(expectedHash);
        mockNft.setOwner(address(vault)); // Vault should "hold" the NFT
    }

    function test_confirmReceipt_revertsIfNotBuyer() public {
        _setupFundsDeposited();

        vm.prank(randomUser); // Not the buyer
        vm.expectRevert(FamilyVault.NotBuyer.selector);
        vault.confirmReceipt(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);
    }

    function test_confirmReceipt_revertsIfWrongState() public {
        // State is Initialized, not FundsDeposited
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);
        mockNft.setHash(keccak256(abi.encodePacked(salt, plainUidCode))); // UID check comes after state check

        vm.prank(buyer); // Assume buyer is set somehow or this check is not reached
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.FundsDeposited,
                FamilyVault.VaultState.Initialized
            )
        );
        vault.confirmReceipt(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);
    }

    function test_confirmReceipt_revertsIfUIDHashMismatch() public {
        _setupFundsDeposited();

        mockNft.setHash(bytes32(0)); // Force UID mismatch

        vm.prank(buyer);
        vm.expectRevert(FamilyVault.InvalidUIDCode.selector);
        vault.confirmReceipt(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);
    }

    function test_confirmReceipt_success_emitsEvents_andSettlesTrade() public {
        _setupFundsDeposited(); // state: FundsDeposited. UID hash set. mockNft owner is vault.

        uint256 sellerBalanceBefore = seller.balance;
        uint256 vaultBalanceBefore = address(vault).balance;
        assertTrue(
            vaultBalanceBefore == priceInLYX,
            "Vault balance incorrect before confirmReceipt"
        );

        vm.prank(buyer);

        vm.expectEmit(true, false, false, true); // ReceiptConfirmed(buyer)
        emit FamilyVault.ReceiptConfirmed(buyer);

        // _settleTrade emits TradeCompleted
        vm.expectEmit(false, false, false, true); // TradeCompleted()
        emit FamilyVault.TradeCompleted();

        vault.confirmReceipt(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);

        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.Completed),
            "State not Completed"
        );
        assertTrue(
            mockNft.transferWithUIDRotationCalled(),
            "transferWithUIDRotation was not called"
        );
        assertEq(
            mockNft.getLastTransferTo(),
            buyer,
            "NFT not transferred to buyer in mock"
        );
        assertEq(
            mockNft.tokenOwnerOf(tokenId),
            buyer,
            "NFT ownership not changed to buyer in mock"
        );
        assertEq(
            mockNft.getLastNewUidHash(),
            NEW_UID_HASH_FOR_TESTS,
            "newUidHash not passed correctly to mock"
        );
        assertEq(
            seller.balance,
            sellerBalanceBefore + priceInLYX,
            "Seller not paid correctly"
        );
        assertEq(address(vault).balance, 0, "Vault LYX not depleted");
    }

    /*///////////////////////////////////////////////////////////////
                            cancelTrade Tests
    ///////////////////////////////////////////////////////////////*/
    // cancelTrade is onlySeller, onlyInState(FundsDeposited), onlyCorrectUIDCode

    function test_cancelTrade_revertsIfNotSeller() public {
        _setupFundsDeposited(); // State: FundsDeposited. UID hash set.

        // Attempt by randomUser
        vm.prank(randomUser);
        vm.expectRevert(FamilyVault.NotSeller.selector);
        vault.cancelTrade(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);

        // Attempt by buyer
        vm.prank(buyer);
        vm.expectRevert(FamilyVault.NotSeller.selector);
        vault.cancelTrade(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);
    }

    function test_cancelTrade_revertsIfWrongState() public {
        _initAndList(); // State is Listed.
        mockNft.setHash(keccak256(abi.encodePacked(salt, plainUidCode))); // For UID check

        vm.prank(seller);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.FundsDeposited, // Expected
                FamilyVault.VaultState.Listed // Actual
            )
        );
        vault.cancelTrade(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);
    }

    function test_cancelTrade_revertsIfUIDHashMismatch() public {
        _setupFundsDeposited(); // State: FundsDeposited. UID hash set.

        mockNft.setHash(bytes32(0)); // Force UID mismatch

        vm.prank(seller);
        vm.expectRevert(FamilyVault.InvalidUIDCode.selector);
        vault.cancelTrade(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);
    }

    function test_cancelTrade_success() public {
        _setupFundsDeposited(); // state: FundsDeposited. buyer is set. NFT with vault. UID hash set.

        uint256 buyerBalanceBefore = buyer.balance;
        uint256 vaultBalanceBefore = address(vault).balance;
        assertTrue(vaultBalanceBefore == priceInLYX);

        vm.prank(seller);

        vm.expectEmit(true, false, false, true);
        emit FamilyVault.TradeCancelled(seller);

        vault.cancelTrade(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);

        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.Cancelled),
            "State not Cancelled"
        );
        assertTrue(
            mockNft.transferWithUIDRotationCalled(),
            "transferWithUIDRotation was not called"
        );
        assertEq(
            mockNft.getLastTransferTo(),
            seller,
            "NFT not transferred to seller in mock"
        );
        assertEq(
            mockNft.tokenOwnerOf(tokenId),
            seller,
            "NFT not returned to seller"
        );
        assertEq(
            buyer.balance,
            buyerBalanceBefore + priceInLYX,
            "Buyer not refunded"
        );
        assertEq(
            address(vault).balance,
            0,
            "Vault LYX not depleted after refund"
        );
        assertEq(vault.buyer(), address(0), "Buyer address not cleared");
    }

    /*///////////////////////////////////////////////////////////////
                            Unlist Tests
    ///////////////////////////////////////////////////////////////*/
    // unlist is onlySeller, onlyInState(VaultState.Listed)
    // unlist DOES NOT have onlyCorrectUIDCode modifier in the provided FamilyVault.sol
    // It calls _safeTransfer, so UID params are still needed for that internal call.

    function _setupListedState() internal {
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);
        mockNft.setOwner(address(vault));
        vm.prank(address(mockNft));
        vault.universalReceiver(bytes32(0), ""); // State -> Listed
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Listed));
    }

    function test_unlist_revertsIfNotSeller() public {
        _setupListedState();
        vm.prank(buyer); // Not seller
        vm.expectRevert(FamilyVault.NotSeller.selector);
        vault.unlist(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);
    }

    function test_unlist_revertsIfWrongState() public {
        _setupFundsDeposited(); // State is FundsDeposited, unlist needs Listed
        // UID hash is set by _setupFundsDeposited, not strictly needed for unlist's own modifiers but for _safeTransfer
        vm.prank(seller);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.Listed,
                FamilyVault.VaultState.FundsDeposited
            )
        );
        vault.unlist(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);
    }

    function test_unlist_success() public {
        _setupListedState(); // State: Listed, NFT with vault
        mockNft.setOwner(address(vault)); // Ensure vault is current owner for _safeTransfer

        vm.prank(seller);
        vm.expectEmit(true, false, false, true);
        emit FamilyVault.TradeCancelled(seller); // unlist emits TradeCancelled

        vault.unlist(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);

        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.Initialized),
            "State not Initialized after unlist"
        );
        assertTrue(
            mockNft.transferWithUIDRotationCalled(),
            "transferWithUIDRotation was not called on mock"
        );
        assertEq(
            mockNft.getLastTransferTo(),
            seller,
            "NFT not transferred to seller in mock"
        );
        assertEq(
            mockNft.tokenOwnerOf(tokenId),
            seller,
            "NFT not returned to seller after unlist"
        );
    }

    function _setupCancelledState() internal {
        _setupFundsDeposited(); // Ends in FundsDeposited, buyer set, NFT with vault, money with vault, UID hash set

        // Seller cancels the trade
        vm.prank(seller);
        vault.cancelTrade(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS); // NFT -> seller, money -> buyer
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Cancelled));
        assertEq(mockNft.tokenOwnerOf(tokenId), seller); // Seller has NFT

        // For relist's onlyCorrectUIDCode, the hash on the NFT must match keccak256(salt, plainUidCode)
        // If cancelTrade's newUidHash changed the token's effective UID, then mockNft needs to reflect that,
        // and the plainUidCode/salt for relist might need to be different or `setHash` needs to be updated.
        // Assuming for relist, the *original* plainUidCode/salt is used for verification,
        // and that transferWithUIDRotation's newUidHash in cancelTrade was for a *future* rotation,
        // not immediately making plainUidCode/salt invalid.
        // So, we re-set the hash on the mock to be what relist's plainUidCode/salt will verify against.
        mockNft.setHash(keccak256(abi.encodePacked(salt, plainUidCode)));
    }

    /*///////////////////////////////////////////////////////////////
                        Dispute management tests
    ///////////////////////////////////////////////////////////////*/
    // initiateDispute is onlyInState(FundsDeposited), onlyParticipant
    // resolveDispute is onlyInState(Disputed), onlyAdmin

    function _setupDisputedState() internal {
        _setupFundsDeposited(); // State: FundsDeposited. UID hash set. NFT with vault.
        vm.prank(buyer); // Buyer initiates dispute
        vault.initiateDispute();
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Disputed));
    }

    function test_initiateDispute_revertsIfNotParticipant() public {
        _setupFundsDeposited(); // State: FundsDeposited

        vm.prank(randomUser);
        vm.expectRevert(FamilyVault.NotBuyerOrSeller.selector);
        vault.initiateDispute();
    }

    function test_initiateDispute_revertsIfWrongState() public {
        _initAndList(); // State: Listed

        vm.prank(buyer); // Buyer is a participant
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.FundsDeposited,
                FamilyVault.VaultState.Listed
            )
        );
        vault.initiateDispute();
    }

    function test_initiateDispute_success_byBuyer() public {
        _setupFundsDeposited(); // State: FundsDeposited

        vm.prank(buyer);
        vm.expectEmit(true, false, false, true);
        emit FamilyVault.DisputeOpened(buyer);
        vault.initiateDispute();

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Disputed));
    }

    function test_initiateDispute_success_bySeller() public {
        _setupFundsDeposited(); // State: FundsDeposited

        vm.prank(seller);
        vm.expectEmit(true, false, false, true);
        emit FamilyVault.DisputeOpened(seller);
        vault.initiateDispute();

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Disputed));
    }

    function test_resolveDispute_revertsIfNotAdmin() public {
        _setupDisputedState(); // State: Disputed

        vm.prank(randomUser); // Not admin
        vm.expectRevert(FamilyVault.NotAdmin.selector);
        vault.resolveDispute(
            buyer,
            seller,
            plainUidCode,
            salt,
            NEW_UID_HASH_FOR_TESTS
        );
    }

    function test_resolveDispute_revertsIfWrongState() public {
        _setupFundsDeposited(); // State: FundsDeposited, not Disputed

        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.Disputed,
                FamilyVault.VaultState.FundsDeposited
            )
        );
        vault.resolveDispute(
            buyer,
            seller,
            plainUidCode,
            salt,
            NEW_UID_HASH_FOR_TESTS
        );
    }

    function test_resolveDispute_revertsIfZeroAddressRecipient() public {
        _setupDisputedState();
        vm.prank(admin);

        vm.expectRevert(FamilyVault.ZeroAddress.selector);
        vault.resolveDispute(
            address(0),
            seller,
            plainUidCode,
            salt,
            NEW_UID_HASH_FOR_TESTS
        );

        vm.expectRevert(FamilyVault.ZeroAddress.selector);
        vm.prank(admin);
        vault.resolveDispute(
            buyer,
            address(0),
            plainUidCode,
            salt,
            NEW_UID_HASH_FOR_TESTS
        );
    }

    function test_resolveDispute_revertsIfNotParticipantRecipient() public {
        _setupDisputedState();

        vm.expectRevert(FamilyVault.NotBuyerOrSeller.selector);
        vm.prank(admin);
        vault.resolveDispute(
            randomUser,
            seller,
            plainUidCode,
            salt,
            NEW_UID_HASH_FOR_TESTS
        );

        vm.expectRevert(FamilyVault.NotBuyerOrSeller.selector);
        vm.prank(admin);
        vault.resolveDispute(
            buyer,
            randomUser,
            plainUidCode,
            salt,
            NEW_UID_HASH_FOR_TESTS
        );
    }

    function test_resolveDispute_success_nftToBuyer_paymentToSeller() public {
        _setupDisputedState(); // State: Disputed. NFT with vault. LYX with vault.

        uint256 sellerBalanceBefore = seller.balance;
        uint256 buyerBalanceBefore = buyer.balance; // For gas check if needed
        uint256 vaultBalanceBefore = address(vault).balance;
        assertTrue(vaultBalanceBefore == priceInLYX);
        mockNft.setOwner(address(vault)); // Ensure mock reflects vault owning NFT

        vm.prank(admin);

        vm.expectEmit(true, false, false, true);
        emit FamilyVault.TradeSettledByAdmin(admin);
        vm.expectEmit(false, false, false, true); // TradeCompleted from resolveDispute
        emit FamilyVault.TradeCompleted();

        vault.resolveDispute(
            buyer,
            seller,
            plainUidCode,
            salt,
            NEW_UID_HASH_FOR_TESTS
        );

        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.Completed),
            "State not Completed"
        );
        assertTrue(
            mockNft.transferWithUIDRotationCalled(),
            "transferWithUIDRotation was not called"
        );
        assertEq(
            mockNft.getLastTransferTo(),
            buyer,
            "NFT not transferred to buyer in mock"
        );
        assertEq(
            mockNft.tokenOwnerOf(tokenId),
            buyer,
            "NFT ownership not with buyer in mock"
        );
        assertEq(
            seller.balance,
            sellerBalanceBefore + priceInLYX,
            "Seller not paid"
        );
        assertEq(address(vault).balance, 0, "Vault LYX not depleted");
    }

    function test_resolveDispute_success_nftToSeller_paymentToBuyer() public {
        _setupDisputedState();

        uint256 sellerBalanceBefore = seller.balance;
        uint256 buyerBalanceBefore = buyer.balance;
        uint256 vaultBalanceBefore = address(vault).balance;
        assertTrue(vaultBalanceBefore == priceInLYX);
        mockNft.setOwner(address(vault));

        vm.prank(admin);

        vm.expectEmit(true, false, false, true);
        emit FamilyVault.TradeSettledByAdmin(admin);
        vm.expectEmit(false, false, false, true);
        emit FamilyVault.TradeCompleted();

        vault.resolveDispute(
            seller,
            buyer,
            plainUidCode,
            salt,
            NEW_UID_HASH_FOR_TESTS
        );

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Completed));
        assertTrue(mockNft.transferWithUIDRotationCalled());
        assertEq(mockNft.getLastTransferTo(), seller); // NFT to Seller
        assertEq(mockNft.tokenOwnerOf(tokenId), seller);
        assertEq(buyer.balance, buyerBalanceBefore + priceInLYX); // Payment to Buyer
        assertEq(address(vault).balance, 0);
    }

    /*///////////////////////////////////////////////////////////////
                            Happy Path Flow Test
    ///////////////////////////////////////////////////////////////*/
    // This test was quite incomplete, fleshing it out based on confirmReceipt success.
    function test_happyPathFlow_buyerConfirms() public {
        // 1. Initialize contract
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Initialized));

        // 2. Seller ensures NFT is transferred to contract, triggering universalReceiver -> Listed
        mockNft.setOwner(address(vault)); // NFT "arrives" at vault
        vm.prank(address(mockNft)); // Call from NFT contract
        vault.universalReceiver(bytes32(0), "");
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Listed));

        // 3. Buyer deposits exact funds -> FundsDeposited
        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: priceInLYX}("");
        require(success, "Deposit failed in happy path");
        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.FundsDeposited)
        );
        assertEq(vault.buyer(), buyer);
        assertEq(address(vault).balance, priceInLYX);

        // 4. Buyer confirms receipt -> DeliveryConfirmed -> Completed
        // Setup UID hash in mock for `onlyCorrectUIDCode` modifier
        bytes32 expectedHash = keccak256(abi.encodePacked(salt, plainUidCode));
        mockNft.setHash(expectedHash);
        mockNft.setOwner(address(vault)); // Ensure vault still "owns" NFT before transfer to buyer

        uint256 sellerBalanceBefore = seller.balance;

        vm.prank(buyer);
        vm.expectEmit(true, false, false, true); // ReceiptConfirmed
        emit FamilyVault.ReceiptConfirmed(buyer);
        vm.expectEmit(false, false, false, true); // TradeCompleted
        emit FamilyVault.TradeCompleted();

        vault.confirmReceipt(plainUidCode, salt, NEW_UID_HASH_FOR_TESTS);

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Completed));

        // 5. Verify NFT and payment transferred
        assertTrue(
            mockNft.transferWithUIDRotationCalled(),
            "transferWithUIDRotation was not called in happy path"
        );
        assertEq(
            mockNft.getLastTransferTo(),
            buyer,
            "NFT not transferred to buyer in mock (happy path)"
        );
        assertEq(
            mockNft.tokenOwnerOf(tokenId),
            buyer,
            "NFT ownership not with buyer in mock (happy path)"
        );
        assertEq(
            seller.balance,
            sellerBalanceBefore + priceInLYX,
            "Seller not paid in happy path"
        );
        assertEq(
            address(vault).balance,
            0,
            "Vault LYX not depleted in happy path"
        );
    }
}
