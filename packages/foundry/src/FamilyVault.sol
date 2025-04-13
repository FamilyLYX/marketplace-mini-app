// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// Modules
import {LSP9Vault} from "@lukso/lsp9-contracts/contracts/LSP9Vault.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ILSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

contract FamilyVault is LSP9Vault {
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

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Not buyer");
        _;
    }

    modifier onlyInState(VaultState _state) {
        require(state == _state, "Invalid state");
        _;
    }

    constructor(
        address _seller,
        address _nftContract,
        bytes32 _tokenId,
        uint256 _priceInLYX,
        bytes32 _expectedUIDHash
    ) LSP9Vault(_seller) {
        seller = _seller;
        nftContract = _nftContract;
        tokenId = _tokenId;
        priceInLYX = _priceInLYX;
        expectedUIDHash = _expectedUIDHash;
        state = VaultState.Initialized;

        emit VaultInitialized(seller, nftContract, tokenId, priceInLYX);
    }

    receive() external payable override onlyInState(VaultState.Listed) {
        require(msg.value == priceInLYX, "Incorrect payment");
        buyer = msg.sender;
        state = VaultState.FundsDeposited;
        emit FundsDeposited(buyer, msg.value);
    }

    function universalReceiver(
        bytes32 typeId,
        bytes memory data
    ) public payable virtual override returns (bytes memory) {
        if (
            state == VaultState.Initialized &&
            msg.sender == nftContract &&
            abi.decode(data, (bytes32)) == tokenId
        ) {
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
        state = VaultState.Completed;
        ILSP8IdentifiableDigitalAsset(nftContract).transfer(
            address(this),
            buyer,
            tokenId,
            true,
            "0x"
        );
        payable(seller).transfer(priceInLYX);
        emit TradeCompleted();
    }

    function initiateDispute() external {
        require(msg.sender == seller || msg.sender == buyer, "Not participant");
        require(
            state == VaultState.FundsDeposited ||
                state == VaultState.DeliveryConfirmed,
            "Can't dispute now"
        );
        state = VaultState.Disputed;
        emit DisputeOpened(msg.sender);
    }
}
