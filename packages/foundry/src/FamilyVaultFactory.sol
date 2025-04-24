// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./FamilyVault.sol";

contract FamilyVaultFactory {
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
    // The tokenId is 1 since each nft contract has only one tokenId 
    bytes32 tokenId = bytes32(uint256(1));

    function createVault(
        address _admin,
        address _nftContract,
        uint256 _priceInLYX,
        bytes32 _expectedUIDHash
    ) external returns (address) {
        FamilyVault vault = new FamilyVault(
            _admin,
            msg.sender,
            _nftContract,
            tokenId,
            _priceInLYX,
            _expectedUIDHash
        );

        emit VaultCreated(
            address(vault),
            _admin,
            msg.sender,
            _nftContract,
            tokenId,
            _priceInLYX,
            _expectedUIDHash
        );
        vaults.push(address(vault));

        return address(vault);
    }

    function getVaults() external view returns (address[] memory) {
        return vaults;
    }
}
