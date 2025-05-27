// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ILSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

interface IDPPNFT {
    function getUIDSalt(bytes32 tokenId) external view returns (bytes32);

    function getUIDHash(bytes32 tokenId) external view returns (bytes32);

    function transferOwnershipWithUID(
        bytes32 tokenId,
        address to,
        string calldata plainUidCode
    ) external;
}

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
    error TransferFailed();
    error NotSeller();
    error InvalidUIDCode();

    // ===== State variables =====
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
        bool isSeller = msg.sender == seller;
        bool isBuyer = msg.sender == buyer;

        if (!(isSeller || isBuyer)) {
            revert NotBuyerOrSeller();
        }
        _;
    }

    modifier onlyCorrectUIDCode(string calldata plainUidCode) {
        bytes32 salt = IDPPNFT(nftContract).getUIDSalt(tokenId);
        bytes32 expectedHash = keccak256(abi.encodePacked(salt, plainUidCode));
        bytes32 storedHash = IDPPNFT(nftContract).getUIDHash(tokenId);
        if (expectedHash != storedHash) revert InvalidUIDCode();
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
    )
        external
        onlyInState(VaultState.FundsDeposited)
        onlyBuyer
        onlyCorrectUIDCode(plainUidCode)
    {
        state = VaultState.DeliveryConfirmed;

        emit ReceiptConfirmed(msg.sender);

        _settleTrade(plainUidCode);
    }

    function _settleTrade(
        string calldata plainUidCode
    ) internal onlyInState(VaultState.DeliveryConfirmed) {
        IDPPNFT(nftContract).transferOwnershipWithUID(
            tokenId,
            buyer,
            plainUidCode
        );

        (bool success, ) = seller.call{value: priceInLYX}("");
        if (!success) revert TransferFailed();

        state = VaultState.Completed;

        emit TradeCompleted();
    }

    function cancelTrade(
        string calldata plainUidCode
    )
        external
        onlyParticipant
        onlyInState(VaultState.FundsDeposited)
        onlyCorrectUIDCode(plainUidCode)
    {
        if (buyer == address(0) || seller == address(0)) {
            revert ZeroAddress();
        }

        // 4. Transfer NFT back to seller using UID code
        IDPPNFT(nftContract).transferOwnershipWithUID(
            tokenId,
            seller,
            plainUidCode
        );

        // 5. Refund buyer
        (bool success, ) = buyer.call{value: priceInLYX}("");
        if (!success) revert TransferFailed();

        // 6. Reset state
        buyer = address(0);
        state = VaultState.Cancelled;

        emit TradeCancelled(msg.sender);
    }

    function unlist(
        string calldata plainUidCode
    ) external onlySeller onlyInState(VaultState.Listed) {
        if (seller == address(0)) revert ZeroAddress();

        IDPPNFT(nftContract).transferOwnershipWithUID(
            tokenId,
            seller,
            plainUidCode
        );

        state = VaultState.Initialized;

        emit TradeCancelled(msg.sender);
    }

    function relist(
        string calldata plainUidCode
    )
        external
        onlySeller
        onlyInState(VaultState.Cancelled)
        onlyCorrectUIDCode(plainUidCode)
    {
        state = VaultState.Listed;
        emit TradeRelisted(msg.sender);
    }

    // ===== Dispute management =====
    function initiateDispute()
        external
        onlyInState(VaultState.FundsDeposited)
        onlyParticipant
    {
        state = VaultState.Disputed;
        emit DisputeOpened(msg.sender);
    }

    function resolveDispute(
        address nftRecipient,
        address paymentRecipient
    ) external onlyInState(VaultState.Disputed) onlyAdmin {
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
