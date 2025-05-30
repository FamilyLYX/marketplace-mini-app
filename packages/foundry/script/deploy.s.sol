// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import {FamilyVault} from "../src/FamilyVault.sol";
import {FamilyVaultFactory} from "../src/FamilyVaultFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy the FamilyVault implementation
        FamilyVault implementation = new FamilyVault();
        console.log(
            "FamilyVault implementation deployed at:",
            address(implementation)
        );

        // Step 2: Deploy the factory with implementation address
        FamilyVaultFactory factory = new FamilyVaultFactory(
            address(implementation),
            0x9fBd3638Fc8D6c8C25f44200f5dbD1e3e9F25959 // TODO:CHANGE THIS TO THE ADMIN ADDRESS FROM JAMES AND PUT IN ENV
        );
        console.log(
            "FamilyVaultFactory deployed at:",
            address(factory),
            "Admin:",
            factory.admin()
        );

        vm.stopBroadcast();
    }
}
