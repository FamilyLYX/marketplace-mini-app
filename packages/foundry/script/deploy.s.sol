// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import {FamilyVault} from "../src/FamilyVault.sol";
import {FamilyVaultFactory} from "../src/FamilyVaultFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        FamilyVault implementation = new FamilyVault();
        console.log("FamilyVault implementation deployed at:", address(implementation));

        FamilyVaultFactory factory =
            new FamilyVaultFactory(address(implementation), 0x3c612a4031B997015F28b7Aef5342a7c9e9463ed);
        console.log("FamilyVaultFactory deployed at:", address(factory), "Admin:", factory.admin());

        vm.stopBroadcast();
    }
}
