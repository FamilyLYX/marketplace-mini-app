// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {FamilyVault} from "../src/FamilyVault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Define the parameters for the FamilyVault contract
        address seller = 0x1; // Replace with actual seller address
        address nftContract = 0x3; // Replace with actual NFT contract address
        bytes32 tokenId = bytes32(keccak256(abi.encodePacked("Token1"))); // Example token ID
        uint256 priceInLYX = 1000; // Example price in LYX
        bytes32 expectedUIDHash = keccak256(abi.encodePacked("UID123")); // Example expected UID hash

        // Deploy the FamilyVault contract
        new FamilyVault(
            seller,
            nftContract,
            tokenId,
            priceInLYX,
            expectedUIDHash
        );

        vm.stopBroadcast();
    }
}
