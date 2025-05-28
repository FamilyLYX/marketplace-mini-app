// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ILSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

interface IDPPNFT {
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
}

contract FamilyVault is Initializable, OwnableUpgradeable {
    using ECDSA for bytes32;

    // ===== Constants =====
    bytes32 private constant DPP_UID_HASH_KEY = keccak256("DPP_UID_Hash");

    // ===== Enums =====
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
    error TransferFailed();
    error NotSeller();
    error InvalidUIDCode();

    // ===== State Variables =====
    address public admin;
    address public seller;
    address public buyer;
    address public nftContract;
    bytes32 public tokenId;
    uint256 public priceInLYX;
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
        if (msg.sender != seller && msg.sender != buyer)
            revert NotBuyerOrSeller();
        _;
    }

    modifier onlyCorrectUIDCode(
        string calldata plainUidCode,
        string calldata salt
    ) {
        bytes32 expectedHash = keccak256(abi.encodePacked(salt, plainUidCode));
        bytes32 storedHash = IDPPNFT(nftContract).getDataForTokenId(
            tokenId,
            DPP_UID_HASH_KEY
        );
        if (expectedHash != storedHash) revert InvalidUIDCode();
        _;
    }

    modifier onlyInState(VaultState expectedState) {
        if (state != expectedState) revert InvalidState(expectedState, state);
        _;
    }

    // ===== Initialization =====

    /**
     * @notice Initializes the vault for escrow between seller and buyer
     * @param _admin The dispute resolver/admin
     * @param _seller The seller who owns the token
     * @param _nftContract The address of the NFT contract
     * @param _tokenId The token ID for the asset in escrow
     * @param _priceInLYX The price agreed for the asset
     */
    function initialize(
        address _admin,
        address _seller,
        address _nftContract,
        bytes32 _tokenId,
        uint256 _priceInLYX
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
        state = VaultState.Initialized;

        transferOwnership(_seller);
        emit VaultInitialized(_seller, _nftContract, _tokenId, _priceInLYX);
    }

    // ===== Buyer Deposits Funds =====

    /**
     * @notice Accept payment from buyer to begin escrow
     * @dev Automatically updates state to FundsDeposited
     */
    receive() external payable onlyInState(VaultState.Listed) {
        if (msg.value != priceInLYX)
            revert IncorrectPayment(priceInLYX, msg.value);

        buyer = msg.sender;
        state = VaultState.FundsDeposited;

        emit FundsDeposited(buyer, msg.value);
    }

    // ===== NFT Deposit Hook =====

    /**
     * @notice Verifies NFT deposit into vault and moves to listed state
     */
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

    // ===== Confirm Receipt =====

    /**
     * @notice Called by buyer to confirm delivery using UID code
     * @param plainUidCode The unencrypted UID string
     * @param salt The UID hash salt
     * @param newUidHash New UID hash to rotate to
     */
    function confirmReceipt(
        string calldata plainUidCode,
        string calldata salt,
        bytes32 newUidHash
    )
        external
        onlyInState(VaultState.FundsDeposited)
        onlyBuyer
        onlyCorrectUIDCode(plainUidCode, salt)
    {
        state = VaultState.DeliveryConfirmed;
        emit ReceiptConfirmed(msg.sender);
        _settleTrade(plainUidCode, salt, newUidHash);
    }

    // ===== Internal Trade Settlement =====
    function _settleTrade(
        string calldata plainUidCode,
        string calldata salt,
        bytes32 newUidHash
    ) internal onlyInState(VaultState.DeliveryConfirmed) {
        _safeTransfer(buyer, plainUidCode, salt, newUidHash);

        (bool success, ) = seller.call{value: priceInLYX}("");
        if (!success) revert TransferFailed();

        state = VaultState.Completed;
        emit TradeCompleted();
    }

    // ===== Cancel Trade =====

    /**
     * @notice Allows seller to cancel the trade and refund buyer
     */
    function cancelTrade(
        string calldata plainUidCode,
        string calldata salt,
        bytes32 newUidHash
    )
        external
        onlySeller
        onlyInState(VaultState.FundsDeposited)
        onlyCorrectUIDCode(plainUidCode, salt)
    {
        _safeTransfer(seller, plainUidCode, salt, newUidHash);

        (bool success, ) = buyer.call{value: priceInLYX}("");
        if (!success) revert TransferFailed();

        buyer = address(0);
        state = VaultState.Cancelled;
        emit TradeCancelled(msg.sender);
    }

    /**
     * @notice Allows seller to unlist the item
     */
    function unlist(
        string calldata plainUidCode,
        string calldata salt,
        bytes32 newUidHash
    ) external onlySeller onlyInState(VaultState.Listed) {
        if (seller == address(0)) revert ZeroAddress();

        _safeTransfer(seller, plainUidCode, salt, newUidHash);
        state = VaultState.Initialized;

        emit TradeCancelled(msg.sender);
    }

    // ===== Dispute Functions =====

    /**
     * @notice Called by either buyer or seller to initiate a dispute
     */
    function initiateDispute()
        external
        onlyInState(VaultState.FundsDeposited)
        onlyParticipant
    {
        state = VaultState.Disputed;
        emit DisputeOpened(msg.sender);
    }

    /**
     * @notice Admin resolves dispute by choosing NFT and payment recipients
     */
    function resolveDispute(
        address nftRecipient,
        address paymentRecipient,
        string calldata plainUidCode,
        string calldata salt,
        bytes32 newUidHash
    ) external onlyInState(VaultState.Disputed) onlyAdmin {
        if (nftRecipient == address(0) || paymentRecipient == address(0))
            revert ZeroAddress();
        if (
            (nftRecipient != buyer && nftRecipient != seller) ||
            (paymentRecipient != buyer && paymentRecipient != seller)
        ) revert NotBuyerOrSeller();

        // Transfer NFT to the recipient
        _safeTransfer(nftRecipient, plainUidCode, salt, newUidHash);

        (bool sent, ) = paymentRecipient.call{value: priceInLYX}("");
        if (!sent) revert TransferFailed();

        state = VaultState.Completed;

        emit TradeSettledByAdmin(msg.sender);
        emit TradeCompleted();
    }

    /**
     * @notice Internal function to safely transfer NFT with UID rotation
     * @dev This is used internally to ensure the NFT is transferred correctly
     */
    function _safeTransfer(
        address recipient,
        string calldata plainUidCode,
        string calldata salt,
        bytes32 newUidHash
    ) internal {
        IDPPNFT(nftContract).transferWithUIDRotation(
            tokenId,
            recipient,
            "",
            salt,
            plainUidCode,
            newUidHash
        );
    }
}
