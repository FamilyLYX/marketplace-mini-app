// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import {FamilyVault} from "../src/FamilyVault.sol";

interface IMockDPPNFT {
    function getUIDSalt(bytes32 tokenId) external view returns (bytes32);

    function getUIDHash(bytes32 tokenId) external view returns (bytes32);

    function transferOwnershipWithUID(
        bytes32 tokenId,
        address to,
        string calldata plainUidCode
    ) external;

    function tokenOwnerOf(bytes32 tokenId) external view returns (address);

    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool,
        bytes calldata
    ) external;
}

/// @notice Mock contract for the DPPNFT and LSP8 interface used by FamilyVault
contract MockDPPNFT is IMockDPPNFT {
    bytes32 private _salt;
    bytes32 private _hash;
    address private _owner;
    address private _transferTo;
    bool public transferOwnershipWithUIDCalled;
    bool public transferCalled;

    function setSalt(bytes32 salt) external {
        _salt = salt;
    }

    function setHash(bytes32 hash) external {
        _hash = hash;
    }

    function setOwner(address owner) external {
        _owner = owner;
    }

    function getUIDSalt(
        bytes32 /*tokenId*/
    ) external view override returns (bytes32) {
        return _salt;
    }

    function getUIDHash(
        bytes32 /*tokenId*/
    ) external view override returns (bytes32) {
        return _hash;
    }

    function transferOwnershipWithUID(
        bytes32 /*tokenId*/,
        address to,
        string calldata /*plainUidCode*/
    ) external override {
        _owner = to;
        transferOwnershipWithUIDCalled = true;
    }

    function tokenOwnerOf(
        bytes32 /*tokenId*/
    ) external view override returns (address) {
        return _owner;
    }

    function transfer(
        address /*from*/,
        address /*to*/,
        bytes32 /*tokenId*/,
        bool /*boolParam*/,
        bytes calldata /*data*/
    ) external override {
        transferCalled = true;
    }
}

contract FamilyVaultTest is Test {
    FamilyVault vault;
    MockDPPNFT mockNft;

    address admin = address(0x1);
    address seller = address(0x2);
    address buyer = address(0x3);
    address randomUser = address(0x4);

    bytes32 tokenId = bytes32("token123");
    uint256 priceInLYX = 1 ether;
    string plainUidCode = "secretcode";

    function setUp() public {
        mockNft = new MockDPPNFT();

        vault = new FamilyVault();

        // mock nft owner is vault initially
        mockNft.setOwner(address(vault));
        vm.deal(admin, 10 ether);
        vm.deal(seller, 10 ether);
        vm.deal(buyer, 10 ether);
        vm.deal(randomUser, 10 ether);
    }

    /*///////////////////////////////////////////////////////////////
                          Initialization tests
    //////////////////////////////////////////////////////////////*/

    function test_initialize_success() public {
        vm.prank(admin);
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        assertEq(vault.admin(), admin);
        assertEq(vault.seller(), seller);
        assertEq(vault.nftContract(), address(mockNft));
        assertEq(vault.tokenId(), tokenId);
        assertEq(vault.priceInLYX(), priceInLYX);
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Initialized));
        assertEq(vault.owner(), seller);
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
    //////////////////////////////////////////////////////////////*/

    function _initAndList() internal {
        vm.prank(admin);
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        // Call universalReceiver from nftContract to list the vault
        vm.prank(address(mockNft));
        vault.universalReceiver(bytes32(0), "");
    }

    function test_receive_revertsIfNotListed() public {
        vm.deal(buyer, priceInLYX);

        // vault state is Initialized, not Listed
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.Listed,
                FamilyVault.VaultState.Initialized
            )
        );
        address(vault).call{value: priceInLYX}("");
    }

    function test_receive_revertsIfIncorrectPayment() public {
        _initAndList();
        vm.deal(buyer, priceInLYX);

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.IncorrectPayment.selector,
                priceInLYX,
                priceInLYX - 1
            )
        );
        address(vault).call{value: priceInLYX - 1}("");
    }

    function test_receive_acceptsCorrectPayment_andEmitsEvent() public {
        _initAndList(); // Vault state is Listed, priceInLYX is set

        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);

        vm.expectEmit(true, false, false, true); // Expects FundsDeposited(address indexed buyer, uint256 amount)
        emit FamilyVault.FundsDeposited(buyer, priceInLYX); // Specify the event being expected

        (bool success, ) = address(vault).call{value: priceInLYX}("");
        assertTrue(success, "LYX deposit call failed"); // Add a message for clarity if it fails

        assertEq(vault.buyer(), buyer, "Buyer address not set correctly");
        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.FundsDeposited),
            "Vault state not FundsDeposited"
        );
    }

    /*///////////////////////////////////////////////////////////////
                          universalReceiver Tests
    //////////////////////////////////////////////////////////////*/

    function test_universalReceiver_transitionsFromInitializedToListed()
        public
    {
        vm.prank(admin);
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        // Confirm state is Initialized
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Initialized));

        vm.prank(address(mockNft));
        vault.universalReceiver(bytes32(0), "");

        // State changes to Listed
        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Listed));
    }

    function test_universalReceiver_revertsIfNotOwner() public {
        vm.prank(admin);
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        // Set mock nft owner != vault
        mockNft.setOwner(address(0xdead));

        vm.prank(address(mockNft));
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.IncorrectTokenOwner.selector,
                address(vault),
                address(0xdead)
            )
        );
        vault.universalReceiver(bytes32(0), "");
    }

    function test_universalReceiver_returnsEmptyBytes() public {
        vm.prank(admin);
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        bytes memory ret = vault.universalReceiver(bytes32(0), "");
        assertEq(ret.length, 0);
    }

    /*///////////////////////////////////////////////////////////////
                          confirmReceipt Tests
    //////////////////////////////////////////////////////////////*/

    function _setupFundsDeposited() internal {
        vm.prank(admin);
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        vm.prank(address(mockNft));
        vault.universalReceiver(bytes32(0), "");

        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: priceInLYX}("");
        require(success);

        // Set salt and hash on mockNft
        bytes32 salt = keccak256("salt");
        mockNft.setSalt(salt);
        mockNft.setHash(keccak256(abi.encodePacked(salt, plainUidCode)));
    }

    function test_confirmReceipt_revertsIfNotBuyer() public {
        _setupFundsDeposited();

        vm.prank(randomUser);
        vm.expectRevert(FamilyVault.NotBuyer.selector);
        vault.confirmReceipt(plainUidCode);
    }

    function test_confirmReceipt_revertsIfWrongState() public {
        vm.prank(admin);
        vault.initialize(admin, seller, address(mockNft), tokenId, priceInLYX);

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.FundsDeposited,
                FamilyVault.VaultState.Initialized
            )
        );
        vault.confirmReceipt(plainUidCode);
    }

    function test_confirmReceipt_revertsIfUIDHashMismatch() public {
        _setupFundsDeposited();

        // Set different hash to force mismatch
        mockNft.setHash(bytes32(0));

        vm.prank(buyer);
        vm.expectRevert(FamilyVault.InvalidUIDCode.selector);
        vault.confirmReceipt(plainUidCode);
    }

    function test_confirmReceipt_success_emitsEvents_andSettlesTrade() public {
        _setupFundsDeposited(); // state: FundsDeposited. UID salt/hash set. mockNft.owner is vault.

        uint256 sellerBalanceBefore = seller.balance;
        uint256 buyerBalanceBefore = buyer.balance; // For checking gas costs if needed, not strictly required by logic

        vm.prank(buyer); // This prank is for the vault.confirmReceipt call

        vm.expectEmit(true, false, false, true); // For ReceiptConfirmed(buyer)
        emit FamilyVault.ReceiptConfirmed(buyer);

        vm.expectEmit(false, false, false, true); // For TradeCompleted()
        emit FamilyVault.TradeCompleted();

        // vm.deal(seller, 0); // Not strictly needed if seller already has funds from setUp for gas.
        // The important check is that seller's balance increases by priceInLYX.

        vault.confirmReceipt(plainUidCode); // This call uses the vm.prank(buyer)

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Completed));
        assertTrue(mockNft.transferOwnershipWithUIDCalled()); // Check mock was called for NFT transfer
        assertEq(mockNft.tokenOwnerOf(tokenId), buyer); // Check NFT ownership changed in mock
        assertEq(seller.balance, sellerBalanceBefore + priceInLYX); // Check seller received payment
    }

    /*///////////////////////////////////////////////////////////////
                          cancelTrade Tests
    //////////////////////////////////////////////////////////////*/

    function test_cancelTrade_revertsIfNotParticipant() public {
        _initAndList();

        vm.prank(randomUser);
        vm.expectRevert(FamilyVault.NotBuyerOrSeller.selector);
        vault.cancelTrade(plainUidCode);
    }

    function test_cancelTrade_revertsIfWrongState() public {
        _initAndList();

        // Current state is Listed, cancel allowed
        vm.prank(buyer);
        vm.expectRevert();
        // Actually cancel is allowed in Listed state, so let's check Cancelled is allowed, others revert

        // Force state to FundsDeposited to test revert
        vm.prank(address(mockNft));
        vault.universalReceiver(bytes32(0), ""); // ensure state Listed
        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: priceInLYX}("");
        require(success);
        // Now state FundsDeposited

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.Listed,
                FamilyVault.VaultState.FundsDeposited
            )
        );
        vault.cancelTrade(plainUidCode);
    }

    function test_cancelTrade_success() public {
        _initAndList(); // state: Listed. mockNft owner is vault.
        // console.log("Vault state after listing:", uint(vault.state()));
        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);
        (bool sent, ) = address(vault).call{value: priceInLYX}("");
        require(sent, "payment failed"); // state: FundsDeposited

        // Set salt and hash on mockNft for cancelTrade
        bytes32 salt = keccak256("salt-for-cancel"); // Use a descriptive salt
        mockNft.setSalt(salt);
        mockNft.setHash(keccak256(abi.encodePacked(salt, plainUidCode)));
        // mockNft.setOwner(address(vault)); // Vault should already be owner from _initAndList's universalReceiver

        vm.prank(buyer);
        vault.cancelTrade(plainUidCode);

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Cancelled));
        assertTrue(mockNft.transferOwnershipWithUIDCalled()); // Verify mock was called
        assertEq(mockNft.tokenOwnerOf(tokenId), seller); // NFT should be back with seller
    }

    /*///////////////////////////////////////////////////////////////
                          relist Tests
    //////////////////////////////////////////////////////////////*/

    function test_relist_revertsIfNotSeller() public {
        _initAndList();

        vm.prank(buyer);
        vm.expectRevert(FamilyVault.NotSeller.selector);
        vault.relist(plainUidCode);
    }

    function test_relist_revertsIfWrongState() public {
        _initAndList(); // State is Listed. Seller is vault.seller.

        // Seller attempts to relist when state is Listed (which is not Cancelled)
        // Setup UID for the relist attempt, as it will be checked by the modifier
        bytes32 salt = keccak256("salt-for-relist-wrong-state");
        mockNft.setSalt(salt);
        mockNft.setHash(keccak256(abi.encodePacked(salt, plainUidCode)));
        // mockNft.setOwner(address(vault)); // Vault is current owner of NFT

        vm.prank(seller);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.Cancelled, // Expected state for relist
                FamilyVault.VaultState.Listed // Actual current state
            )
        );
        vault.relist(plainUidCode);
    }

    function test_relist_success() public {
        _initAndList(); // state: Listed. Vault owns NFT.

        // Buyer deposits funds
        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);
        (bool sent, ) = address(vault).call{value: priceInLYX}("");
        require(sent, "payment failed"); // state: FundsDeposited. vault.buyer is set.

        // Setup UID for cancelTrade
        bytes32 cancelSalt = keccak256("salt-for-cancel-in-relist-test");
        mockNft.setSalt(cancelSalt);
        mockNft.setHash(keccak256(abi.encodePacked(cancelSalt, plainUidCode)));
        // mockNft.setOwner(address(vault)); // Vault is current owner

        vm.prank(buyer); // Buyer initiates cancel
        vault.cancelTrade(plainUidCode); // state: Cancelled. NFT is now with seller. Funds with buyer.
        // Mock owner should be seller now due to transferOwnershipWithUID
        // mockNft.setOwner(seller) would have been called by the mock.

        // Setup UID for relist by seller
        // Assume plainUidCode is the same, ensure salt/hash are correctly set on mockNft FOR SELLER'S ACTION
        bytes32 relistSalt = keccak256("salt-for-relist-success"); // Can be same or different based on logic
        // but needs to be on mockNft
        mockNft.setSalt(relistSalt); // This salt must be what getUIDSalt returns for the relist call
        mockNft.setHash(keccak256(abi.encodePacked(relistSalt, plainUidCode)));
        // mockNft.setOwner(seller); // Seller is current owner

        vm.prank(seller);
        vault.relist(plainUidCode);

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Listed));
        // Add emit check for TradeRelisted if desired
    }

    /*///////////////////////////////////////////////////////////////
                          Dispute management tests
    //////////////////////////////////////////////////////////////*/

    function test_initiateDispute_revertsIfNotParticipant() public {
        _setupFundsDeposited();

        vm.prank(randomUser);
        vm.expectRevert(FamilyVault.NotBuyerOrSeller.selector);
        vault.initiateDispute();
    }

    function test_initiateDispute_revertsIfWrongState() public {
        _initAndList();

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.FundsDeposited,
                FamilyVault.VaultState.Listed
            )
        );
        vault.initiateDispute();
    }

    function test_initiateDispute_success() public {
        _setupFundsDeposited();

        vm.prank(buyer);
        vm.expectEmit(true, false, false, true);
        emit FamilyVault.DisputeOpened(buyer);
        vault.initiateDispute();

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Disputed));
    }

    function test_resolveDispute_revertsIfNotAdmin() public {
        _setupFundsDeposited();

        vm.prank(buyer);
        vault.initiateDispute();

        vm.prank(randomUser);
        vm.expectRevert(FamilyVault.NotAdmin.selector);
        vault.resolveDispute(buyer, seller);
    }

    function test_resolveDispute_revertsIfWrongState() public {
        _initAndList();

        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                FamilyVault.InvalidState.selector,
                FamilyVault.VaultState.Disputed, // expected state: 6
                vault.state() // actual state: e.g. 1 or 5
            )
        );
        vault.resolveDispute(buyer, seller);
    }

    function test_happyPathFlow() public {
        // 1. Initialize contract (done in setUp or here)
        address _admin = admin;
        address _seller = seller;

        vm.prank(_admin);
        vault.initialize(
            _admin,
            _seller,
            address(mockNft),
            tokenId,
            priceInLYX
        );

        // 2. Simulate NFT transfer to contract and listing via universalReceiver
        vm.prank(address(mockNft));
        vault.universalReceiver(bytes32(0), "");

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Listed));

        // 3. Buyer deposits exact funds
        vm.deal(buyer, priceInLYX);
        vm.prank(buyer);
        (bool success, ) = address(vault).call{value: priceInLYX}("");
        require(success, "Deposit failed");

        assertEq(
            uint(vault.state()),
            uint(FamilyVault.VaultState.FundsDeposited)
        );
        assertEq(vault.buyer(), buyer);

        // Mock the UID salt and hash (assuming you can mock in your test)
        bytes32 salt = IMockDPPNFT(address(mockNft)).getUIDSalt(tokenId);
        bytes32 expectedHash = keccak256(abi.encodePacked(salt, plainUidCode));

        // Setup the mock to return the expected hash
        vm.mockCall(
            address(mockNft),
            abi.encodeWithSelector(IMockDPPNFT.getUIDHash.selector, tokenId),
            abi.encode(expectedHash)
        );

        vm.prank(buyer);
        vault.confirmReceipt(plainUidCode);

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Completed));

        // 5. Verify that ownership has been transferred and payment sent
        // You can add events checks or mock the transferOwnershipWithUID & payment calls if possible

        // Bonus: Check the final event emitted or internal state if you want
    }

    function test_resolveDispute_success() public {
        _setupFundsDeposited(); // state: FundsDeposited. Buyer is set. Vault owns NFT.

        vm.prank(buyer); // Buyer or seller can initiate
        vault.initiateDispute(); // state: Disputed

        vm.prank(admin);

        vm.expectEmit(true, false, false, true); // For TradeSettledByAdmin(admin)
        emit FamilyVault.TradeSettledByAdmin(admin);

        vm.expectEmit(false, false, false, true); // For TradeCompleted()
        emit FamilyVault.TradeCompleted();

        vault.resolveDispute(buyer, seller); // Example: NFT to buyer, payment to seller

        assertEq(uint(vault.state()), uint(FamilyVault.VaultState.Completed));
        assertTrue(mockNft.transferCalled()); // Verify NFT transfer was attempted (standard transfer in resolveDispute)
        // Add checks for recipient balances if necessary
    }
}
