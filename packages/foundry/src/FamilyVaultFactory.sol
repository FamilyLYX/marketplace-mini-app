// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title FamilyVaultFactory
/// @notice Deploys minimal proxy clones of the FamilyVault contract and tracks them

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./FamilyVault.sol";

contract FamilyVaultFactory {
    using Clones for address;

    /* -------------------------------------------------------------------------- */
    /*                             Immutables & Storage                           */
    /* -------------------------------------------------------------------------- */

    /// @notice Address of the FamilyVault implementation contract used for cloning
    address public immutable implementation;
    address public immutable admin;
    /// @notice List of deployed vault clone addresses
    address[] public vaults;

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    /// @dev Revert when the FamilyVault implementation address is invalid
    error InvalidImplementation();

    /// @dev Revert when the admin address is zero
    error InvalidAdmin();

    /// @dev Revert when the NFT contract address is zero
    error InvalidNFTContract();

    /// @dev Revert when UID hash input is invalid (unused here, placeholder for future)
    error InvalidUIDHash();

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    /// @notice Emitted when a new FamilyVault clone is created
    /// @param vaultAddress The deployed clone address
    /// @param admin The vault admin (e.g., marketplace moderator)
    /// @param seller The user who listed the NFT
    /// @param nftContract The NFT contract address
    /// @param tokenId The ID of the NFT being escrowed
    /// @param priceInLYX The sale price set in LYX
    event VaultCreated(
        address indexed vaultAddress,
        address indexed admin,
        address indexed seller,
        address nftContract,
        bytes32 tokenId,
        uint256 priceInLYX
    );

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    /// @notice Sets the address of the FamilyVault implementation contract
    /// @param _implementation The FamilyVault logic contract used for cloning
    constructor(address _implementation, address _admin) {
        if (_implementation == address(0)) revert InvalidImplementation();
        implementation = _implementation;
        if (_admin == address(0)) revert InvalidAdmin();
        admin = _admin;
    }

    /* -------------------------------------------------------------------------- */
    /*                            External Functions                              */
    /* -------------------------------------------------------------------------- */

    /// @notice Creates a new FamilyVault clone and initializes it
    /// @param _nftContract NFT contract address for the vault asset
    /// @param _tokenId Token ID of the NFT (bytes32)
    /// @param _priceInLYX Price of the item in LYX
    /// @return clone The address of the deployed FamilyVault clone
    function createVault(
        address _nftContract,
        bytes32 _tokenId,
        uint256 _priceInLYX
    ) external returns (address clone) {
        if (_nftContract == address(0)) revert InvalidNFTContract();

        // Deploy a minimal proxy clone of the FamilyVault implementation
        clone = implementation.clone();

        // Initialize the clone with the provided parameters
        FamilyVault(payable(clone)).initialize(
            admin,
            msg.sender,
            _nftContract,
            _tokenId,
            _priceInLYX
        );

        // Track the created clone
        vaults.push(clone);

        // Emit creation event
        emit VaultCreated(
            clone,
            admin,
            msg.sender,
            _nftContract,
            _tokenId,
            _priceInLYX
        );
    }

    /// @notice Returns all FamilyVault clones created by this factory
    /// @return An array of all deployed vault addresses
    function getVaults() external view returns (address[] memory) {
        return vaults;
    }
}
