// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ConfidentialFungibleToken} from "new-confidential-contracts/token/ConfidentialFungibleToken.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";

contract ConfidentialZama is ConfidentialFungibleToken, SepoliaConfig {
    constructor() ConfidentialFungibleToken("cZAMA", "cZAMA", "") {}

    function faucet(address to) public {
        euint64 encryptedAmount = FHE.asEuint64(1000*1000000);
        _mint(to, encryptedAmount);
    }
}
