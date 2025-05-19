// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// OpenZeppelin upgradeable modules
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ILSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";
import {LSP9Vault} from "@lukso/lsp9-contracts/contracts/LSP9Vault.sol";

contract FamilyVault is Initializable, OwnableUpgradeable {
    using ECDSA for bytes32;

    enum VaultState {
        Initialized,
        Listed,
        FundsDeposited,
        DeliveryConfirmed,
        Completed,
        Disputed,
        Cancelled
    }

    address public admin;
    address public seller;
    address public buyer;
    address public nftContract;
    bytes32 public tokenId;
    uint256 public priceInLYX;
    bytes32 public expectedUIDHash;
    VaultState public state;

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

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Not buyer");
        _;
    }

    modifier onlyInState(VaultState _state) {
        require(state == _state, "Invalid state");
        _;
    }

    modifier onlyParticipant() {
        require(
            msg.sender == buyer || msg.sender == seller,
            "Not buyer or seller"
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function initialize(
        address _admin,
        address _seller,
        address _nftContract,
        bytes32 _tokenId,
        uint256 _priceInLYX,
        bytes32 _expectedUIDHash
    ) public initializer {
        __Ownable_init();

        require(_admin != address(0), "admin zero address");
        require(_seller != address(0), "seller zero address");
        require(_nftContract != address(0), "NFT contract zero address");

        admin = _admin;
        seller = _seller;
        nftContract = _nftContract;
        tokenId = _tokenId;
        priceInLYX = _priceInLYX;
        expectedUIDHash = _expectedUIDHash;
        state = VaultState.Initialized;

        // Transfer ownership to seller to replicate LSP9Vault owner
        transferOwnership(_seller);

        emit VaultInitialized(_seller, _nftContract, _tokenId, _priceInLYX);
    }

    receive() external payable onlyInState(VaultState.Listed) {
        require(msg.value == priceInLYX, "Incorrect payment");
        buyer = msg.sender;
        state = VaultState.FundsDeposited;
        emit FundsDeposited(buyer, msg.value);
    }

    function universalReceiver(
        bytes32 /*typeId*/,
        bytes memory /*data*/
    ) public payable returns (bytes memory) {
        if (state == VaultState.Initialized && msg.sender == nftContract) {
            address currentOwner = ILSP8IdentifiableDigitalAsset(nftContract)
                .tokenOwnerOf(tokenId);
            require(
                currentOwner == address(this),
                "Incorrect tokenId ownership"
            );
            state = VaultState.Listed;
        }

        return "";
    }

    function confirmReceipt(
        string calldata plainUidCode
    ) external onlyBuyer onlyInState(VaultState.FundsDeposited) {
        bytes32 hashed = keccak256(abi.encodePacked(plainUidCode));
        require(hashed == expectedUIDHash, "UID hash mismatch");
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
            "0x"
        );
        (bool success, ) = seller.call{value: priceInLYX}("");
        require(success, "Transfer to seller failed");

        state = VaultState.Completed;
        emit TradeCompleted();
    }

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
        require(
            nftRecipient != address(0) &&
                paymentRecipient != address(0) &&
                (nftRecipient == buyer || nftRecipient == seller) &&
                (paymentRecipient == buyer || paymentRecipient == seller),
            "Invalid recipient, must be buyer or seller"
        );

        ILSP8IdentifiableDigitalAsset(nftContract).transfer(
            address(this),
            nftRecipient,
            tokenId,
            true,
            "0x"
        );

        (bool sent, ) = paymentRecipient.call{value: priceInLYX}("");
        require(sent, "Payment transfer failed");

        state = VaultState.Completed;
        emit TradeSettledByAdmin(msg.sender);
        emit TradeCompleted();
    }
}
