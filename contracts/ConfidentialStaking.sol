// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, ebool, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {IERC7984} from "confidential-contracts-v91/contracts/interfaces/IERC7984.sol";
import {FHESafeMath} from "confidential-contracts-v91/contracts/utils/FHESafeMath.sol";

contract ConfidentialStaking is ZamaEthereumConfig {
    mapping(address token => bool) private _supportedToken;
    address[] private _tokenList;

    mapping(address account => mapping(address token => euint64)) private _stakes;
    mapping(address token => euint64) private _totalStaked;

    event Staked(address indexed account, address indexed token, euint64 amount);
    event Withdrawn(address indexed account, address indexed token, euint64 amount);

    constructor(address[] memory tokens) {
        require(tokens.length > 0, "Token list required");

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            require(token != address(0), "Invalid token");
            require(!_supportedToken[token], "Duplicate token");

            _supportedToken[token] = true;
            _tokenList.push(token);
        }
    }

    function supportedTokens() external view returns (address[] memory) {
        return _tokenList;
    }

    function isSupportedToken(address token) external view returns (bool) {
        return _supportedToken[token];
    }

    function stakeOf(address account, address token) external view returns (euint64) {
        require(_supportedToken[token], "Unsupported token");
        return _stakes[account][token];
    }

    function totalStaked(address token) external view returns (euint64) {
        require(_supportedToken[token], "Unsupported token");
        return _totalStaked[token];
    }

    function stake(address token, externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        require(_supportedToken[token], "Unsupported token");

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

        FHE.allowTransient(amount, token);
        euint64 transferred = IERC7984(token).confidentialTransferFrom(msg.sender, address(this), amount);

        (, euint64 updatedUserStake) = FHESafeMath.tryIncrease(_stakes[msg.sender][token], transferred);
        FHE.allowThis(updatedUserStake);
        FHE.allow(updatedUserStake, msg.sender);
        _stakes[msg.sender][token] = updatedUserStake;

        (, euint64 updatedTotal) = FHESafeMath.tryIncrease(_totalStaked[token], transferred);
        FHE.allowThis(updatedTotal);
        FHE.allow(updatedTotal, msg.sender);
        _totalStaked[token] = updatedTotal;

        // Preserve access to the transferred amount regardless of success status.
        FHE.allowThis(transferred);
        FHE.allow(transferred, msg.sender);
        FHE.allow(transferred, address(this));

        emit Staked(msg.sender, token, transferred);
    }

    function withdrawAll(address token) external {
        require(_supportedToken[token], "Unsupported token");

        euint64 userStake = _stakes[msg.sender][token];
        require(FHE.isInitialized(userStake), "No active stake");

        FHE.allowTransient(userStake, token);
        FHE.allow(userStake, msg.sender);

        euint64 transferred = IERC7984(token).confidentialTransfer(msg.sender, userStake);
        FHE.allowThis(transferred);
        FHE.allow(transferred, msg.sender);

        (ebool totalSuccess, euint64 updatedTotal) = FHESafeMath.tryDecrease(_totalStaked[token], transferred);
        FHE.allowThis(updatedTotal);
        FHE.allow(updatedTotal, msg.sender);
        _totalStaked[token] = updatedTotal;

        euint64 clearedStake = FHE.select(totalSuccess, FHE.asEuint64(0), userStake);
        FHE.allowThis(clearedStake);
        FHE.allow(clearedStake, msg.sender);
        _stakes[msg.sender][token] = clearedStake;

        emit Withdrawn(msg.sender, token, transferred);
    }
}
