// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import {FamilyVaultFactory} from "../src/FamilyVaultFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Broadcast all transactions under the deployer key
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the factory contract
        FamilyVaultFactory factory = new FamilyVaultFactory();

        console.log("FamilyVaultFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
