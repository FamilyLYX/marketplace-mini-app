// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./FamilyVault.sol"; // This must have an `initialize` function

contract FamilyVaultFactory {
    using Clones for address;

    address public immutable implementation;
    address[] public vaults;

    event VaultCreated(
        address indexed vaultAddress,
        address indexed admin,
        address indexed seller,
        address nftContract,
        bytes32 tokenId,
        uint256 priceInLYX,
        bytes32 expectedUIDHash
    );

    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation");
        implementation = _implementation;
    }

    function createVault(
        address _admin,
        address _nftContract,
        bytes32 _tokenId,
        uint256 _priceInLYX,
        bytes32 _expectedUIDHash
    ) external returns (address) {
        require(_admin != address(0), "Invalid admin");
        require(_nftContract != address(0), "Invalid NFT");
        require(_expectedUIDHash != bytes32(0), "Invalid UID");

        address clone = implementation.clone();

        FamilyVault(payable(clone)).initialize(
            _admin,
            msg.sender,
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

        return clone;
    }

    function getVaults() external view returns (address[] memory) {
        return vaults;
    }
}
