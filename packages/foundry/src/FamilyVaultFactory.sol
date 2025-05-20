// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./FamilyVault.sol";

contract FamilyVaultFactory {
    using Clones for address;

    /// @notice Address of the FamilyVault implementation contract used for cloning
    address public immutable implementation;

    /// @notice List of deployed vault clone addresses
    address[] public vaults;

    /// @dev Custom Errors
    error InvalidImplementation();
    error InvalidAdmin();
    error InvalidNFTContract();
    error InvalidUIDHash();

    event VaultCreated(
        address indexed vaultAddress,
        address indexed admin,
        address indexed seller,
        address nftContract,
        bytes32 tokenId,
        uint256 priceInLYX,
        bytes32 expectedUIDHash
    );

    /// @param _implementation Address of the FamilyVault implementation contract
    constructor(address _implementation) {
        if (_implementation == address(0)) revert InvalidImplementation();
        implementation = _implementation;
    }

    /// @notice Creates a new FamilyVault clone and initializes it
    /// @param _admin Admin address for the vault (e.g., marketplace admin)
    /// @param _nftContract NFT contract address for the vault asset
    /// @param _tokenId Token ID of the NFT (bytes32)
    /// @param _priceInLYX Price of the item in LYX
    /// @param _expectedUIDHash Hash of the expected UID code for validation
    /// @return clone Address of the newly created vault clone
    function createVault(
        address _admin,
        address _nftContract,
        bytes32 _tokenId,
        uint256 _priceInLYX,
        bytes32 _expectedUIDHash
    ) external returns (address clone) {
        if (_admin == address(0)) revert InvalidAdmin();
        if (_nftContract == address(0)) revert InvalidNFTContract();
        if (_expectedUIDHash == bytes32(0)) revert InvalidUIDHash();

        clone = implementation.clone();

        FamilyVault(payable(clone)).initialize(
            _admin,
            msg.sender, // seller is caller of factory
            _nftContract,
            _tokenId,
            _priceInLYX,
            _expectedUIDHash
        );

        vaults.push(clone);

        emit VaultCreated(
            clone,
            _admin,
            msg.sender,
            _nftContract,
            _tokenId,
            _priceInLYX,
            _expectedUIDHash
        );
    }

    /// @notice Returns all vault clone addresses created by this factory
    /// @return List of vault addresses
    function getVaults() external view returns (address[] memory) {
        return vaults;
    }
}
