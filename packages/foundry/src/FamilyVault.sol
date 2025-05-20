// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ILSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

contract FamilyVault is Initializable, OwnableUpgradeable {
    using ECDSA for bytes32;

    enum VaultState {
        Initialized,
        Listed,
        Cancelled,
        FundsDeposited,
        DeliveryConfirmed,
        Completed,
        Disputed
    }

    // ===== Custom Errors =====
    error ZeroAddress();
    error NotBuyer();
    error NotAdmin();
    error NotBuyerOrSeller();
    error InvalidState(VaultState expected, VaultState actual);
    error IncorrectPayment(uint256 expected, uint256 actual);
    error IncorrectTokenOwner(address expected, address actual);
    error UIDHashMismatch();
    error TransferFailed();
    error NotSeller();

    // ===== State variables =====
    address public admin;
    address public seller;
    address public buyer;
    address public nftContract;
    bytes32 public tokenId;
    uint256 public priceInLYX;
    bytes32 public expectedUIDHash;
    VaultState public state;

    // ===== Events =====
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
    event TradeCancelled(address indexed cancelledBy);
    event TradeRelisted(address indexed relistedBy);

    // ===== Modifiers =====
    modifier onlyBuyer() {
        if (msg.sender != buyer) revert NotBuyer();
        _;
    }

    modifier onlySeller() {
        if (msg.sender != seller) revert NotSeller();
        _;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyParticipant() {
        if (msg.sender != buyer && msg.sender != seller)
            revert NotBuyerOrSeller();
        _;
    }

    modifier onlyInState(VaultState expectedState) {
        if (state != expectedState) revert InvalidState(expectedState, state);
        _;
    }

    // ===== Initializer =====
    function initialize(
        address _admin,
        address _seller,
        address _nftContract,
        bytes32 _tokenId,
        uint256 _priceInLYX,
        bytes32 _expectedUIDHash
    ) external initializer {
        __Ownable_init();

        if (
            _admin == address(0) ||
            _seller == address(0) ||
            _nftContract == address(0)
        ) revert ZeroAddress();

        admin = _admin;
        seller = _seller;
        nftContract = _nftContract;
        tokenId = _tokenId;
        priceInLYX = _priceInLYX;
        expectedUIDHash = _expectedUIDHash;
        state = VaultState.Initialized;

        // Transfer ownership to seller to mimic LSP9Vault owner behavior
        transferOwnership(_seller);

        emit VaultInitialized(_seller, _nftContract, _tokenId, _priceInLYX);
    }

    // ===== Receive funds =====
    receive() external payable onlyInState(VaultState.Listed) {
        if (msg.value != priceInLYX)
            revert IncorrectPayment(priceInLYX, msg.value);

        buyer = msg.sender;
        state = VaultState.FundsDeposited;

        emit FundsDeposited(buyer, msg.value);
    }

    // ===== Universal Receiver hook =====
    function universalReceiver(
        bytes32 /*typeId*/,
        bytes memory /*data*/
    ) external payable returns (bytes memory) {
        if (state == VaultState.Initialized && msg.sender == nftContract) {
            address currentOwner = ILSP8IdentifiableDigitalAsset(nftContract)
                .tokenOwnerOf(tokenId);
            if (currentOwner != address(this))
                revert IncorrectTokenOwner(address(this), currentOwner);

            state = VaultState.Listed;
        }
        return "";
    }

    // ===== Confirm receipt and settle trade =====
    function confirmReceipt(
        string calldata plainUidCode
    ) external onlyBuyer onlyInState(VaultState.FundsDeposited) {
        if (keccak256(abi.encodePacked(plainUidCode)) != expectedUIDHash)
            revert UIDHashMismatch();

        state = VaultState.DeliveryConfirmed;

        emit ReceiptConfirmed(msg.sender);

        _settleTrade();
    }

    function _settleTrade() internal onlyInState(VaultState.DeliveryConfirmed) {
        ILSP8IdentifiableDigitalAsset(nftContract).transfer(
            address(this),
            buyer,
            tokenId,
            true,
            ""
        );

        (bool success, ) = seller.call{value: priceInLYX}("");
        if (!success) revert TransferFailed();

        state = VaultState.Completed;

        emit TradeCompleted();
    }

    function cancelTrade() external onlyParticipant {
        if (state != VaultState.Listed && state != VaultState.Cancelled)
            revert InvalidState(VaultState.Listed, state);

        state = VaultState.Cancelled;
        emit TradeCancelled(msg.sender);
    }

    function relist() external onlySeller {
        if (state != VaultState.Cancelled)
            revert InvalidState(VaultState.Cancelled, state);

        state = VaultState.Listed;
        emit TradeRelisted(msg.sender);
    }

    // ===== Dispute management =====
    function initiateDispute()
        external
        onlyParticipant
        onlyInState(VaultState.FundsDeposited)
    {
        state = VaultState.Disputed;
        emit DisputeOpened(msg.sender);
    }

    function resolveDispute(
        address nftRecipient,
        address paymentRecipient
    ) external onlyAdmin onlyInState(VaultState.Disputed) {
        if (
            nftRecipient == address(0) ||
            paymentRecipient == address(0) ||
            (nftRecipient != buyer && nftRecipient != seller) ||
            (paymentRecipient != buyer && paymentRecipient != seller)
        ) revert ZeroAddress();

        ILSP8IdentifiableDigitalAsset(nftContract).transfer(
            address(this),
            nftRecipient,
            tokenId,
            true,
            ""
        );

        (bool sent, ) = paymentRecipient.call{value: priceInLYX}("");
        if (!sent) revert TransferFailed();

        state = VaultState.Completed;

        emit TradeSettledByAdmin(msg.sender);
        emit TradeCompleted();
    }
}
