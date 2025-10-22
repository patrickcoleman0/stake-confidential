# Confidential Token Staking Platform

A privacy-preserving decentralized staking platform built with Fully Homomorphic Encryption (FHE) technology, enabling users to stake tokens while keeping their balances and transaction amounts completely confidential on-chain.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Advantages](#advantages)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Frontend Application](#frontend-application)
- [Problems Solved](#problems-solved)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Deployment](#deployment)
- [Usage](#usage)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

The Confidential Token Staking Platform is a pioneering DeFi application that combines the benefits of token staking with cutting-edge privacy technology. Built on Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine), this platform allows users to stake multiple types of confidential tokens while maintaining complete privacy of their balances and transaction amounts.

Unlike traditional staking platforms where all balances and transactions are publicly visible on the blockchain, this platform ensures that:
- User staking balances remain encrypted on-chain
- Staking and withdrawal amounts are never revealed publicly
- Only authorized parties can decrypt and view their own balance information
- All mathematical operations are performed on encrypted data

## Key Features

### 🔐 Complete Privacy
- **Encrypted Balances**: All token balances are stored as encrypted values on-chain using FHE
- **Confidential Transactions**: Stake and withdrawal amounts remain private throughout the entire process
- **Zero-Knowledge Proofs**: Cryptographic proofs ensure transaction validity without revealing amounts
- **Client-Side Encryption**: User inputs are encrypted in the browser before being sent to the blockchain

### 💰 Multi-Token Support
- Support for multiple confidential tokens:
  - **cETH** (Confidential ETH)
  - **cUSDT** (Confidential USDT)
  - **cZAMA** (Confidential Zama)
- Extensible architecture for adding new tokens
- Unified staking interface across all supported tokens

### ⚡ User-Friendly Interface
- Modern React-based web application
- RainbowKit wallet integration for seamless Web3 connectivity
- Real-time balance updates with encrypted data handling
- Intuitive token card interface for staking operations
- Built-in faucet functionality for testing tokens

### 🛡️ Security First
- Secure operator authorization mechanism for token transfers
- FHE-based safe math operations preventing overflow/underflow
- Comprehensive access control for encrypted data
- Auditable smart contract code following best practices

### 🔄 Flexible Staking Operations
- **Stake**: Deposit confidential tokens with encrypted amounts
- **Withdraw All**: Retrieve entire staked balance while maintaining privacy
- **Balance Queries**: View encrypted balances (decryptable only by authorized parties)
- **Total Staked Tracking**: Monitor aggregated staking pools per token

## Advantages

### Privacy Preservation
Traditional DeFi platforms expose all user financial activities on-chain, creating significant privacy concerns:
- **Problem**: Public transaction histories reveal user wealth and trading patterns
- **Our Solution**: FHE ensures all amounts remain encrypted, visible only to authorized parties

### Regulatory Compliance
Privacy features enable compliance with data protection regulations while maintaining blockchain transparency:
- Balances remain confidential but auditable by authorized parties
- Transaction validity can be verified without revealing amounts
- Suitable for institutional and enterprise use cases requiring privacy

### Competitive Edge
- **First-Mover Advantage**: Among the first production-ready confidential staking platforms
- **Technical Innovation**: Leverages cutting-edge FHE technology from Zama
- **User Protection**: Shields users from MEV (Miner Extractable Value) attacks based on balance visibility

### Scalability & Extensibility
- Modular smart contract architecture
- Easy integration of new confidential tokens
- Upgradeable frontend components
- RESTful approach to blockchain interactions

## Technology Stack

### Blockchain & Smart Contracts
- **Solidity 0.8.27**: Smart contract programming language
- **Hardhat**: Ethereum development environment
  - Compilation, testing, and deployment framework
  - TypeScript support for scripts and tests
  - Gas reporting and coverage analysis
- **FHEVM by Zama**: Fully Homomorphic Encryption for EVM
  - `@fhevm/solidity`: Core FHE library for Solidity
  - `@fhevm/hardhat-plugin`: Development tools and deployment helpers
  - `@zama-fhe/oracle-solidity`: Decryption oracle integration
- **OpenZeppelin Contracts**: Secure, audited smart contract libraries
- **Ethers.js v6**: Ethereum library for blockchain interactions

### Frontend
- **React 19.1.1**: Modern UI framework with latest features
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and development server
- **Wagmi 2.17.0**: React Hooks for Ethereum
  - Account management
  - Contract interactions
  - Transaction handling
- **RainbowKit 2.2.8**: Beautiful, customizable wallet connection UI
- **TanStack Query 5.89.0**: Powerful data synchronization and caching
- **Viem 2.37.6**: TypeScript interface to Ethereum
- **Zama Relayer SDK**: Client-side encryption and decryption helpers

### Development & DevOps
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Solhint**: Solidity linting
- **TypeChain**: TypeScript bindings for smart contracts
- **Hardhat Deploy**: Declarative deployment system
- **Netlify**: Frontend hosting and continuous deployment

### Testing & Quality Assurance
- **Mocha & Chai**: Test framework and assertion library
- **Hardhat Network**: Local blockchain for testing
- **Solidity Coverage**: Code coverage analysis
- **Gas Reporter**: Gas consumption tracking

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (React)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Token Card  │  │  Token Card  │  │  Token Card  │     │
│  │    (cETH)    │  │   (cUSDT)    │  │   (cZAMA)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Web3 Integration Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Wagmi      │  │  RainbowKit  │  │ Zama Relayer │     │
│  │   Hooks      │  │   Wallet     │  │     SDK      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Blockchain Layer (Sepolia)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         ConfidentialStaking Contract                  │  │
│  │  • stake(token, encryptedAmount, proof)              │  │
│  │  • withdrawAll(token)                                 │  │
│  │  • stakeOf(account, token) → euint64                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │Confidential│  │Confidential│  │Confidential│          │
│  │    ETH     │  │   USDT     │  │   ZAMA     │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FHEVM Protocol Layer                      │
│  • Homomorphic Encryption Operations                        │
│  • Encrypted State Management                               │
│  • Access Control & Permissions                             │
│  • Decryption Oracle                                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Staking Flow
1. User enters amount in the UI
2. Amount is encrypted client-side using Zama Relayer SDK
3. User authorizes staking contract as operator on the token contract
4. Encrypted amount and proof are submitted to staking contract
5. Smart contract performs encrypted transfer from user to staking pool
6. User's encrypted stake balance is updated using FHE operations
7. Total pool balance is updated (all operations on encrypted values)

#### Withdrawal Flow
1. User initiates withdrawal
2. Contract retrieves encrypted stake balance
3. Encrypted transfer is executed back to user
4. Balances are updated using FHE safe math
5. User receives tokens in their wallet

## Smart Contracts

### ConfidentialStaking.sol
The main staking contract managing deposits, withdrawals, and balance tracking.

**Key Functions:**
- `stake(address token, externalEuint64 encryptedAmount, bytes inputProof)`: Stake encrypted token amounts
- `withdrawAll(address token)`: Withdraw entire staked balance
- `stakeOf(address account, address token)`: Query encrypted stake balance
- `totalStaked(address token)`: Get total encrypted pool balance
- `supportedTokens()`: List all supported tokens
- `isSupportedToken(address token)`: Check token support

**Security Features:**
- Token whitelist validation
- FHE safe math for preventing overflow/underflow
- Comprehensive access control for encrypted values
- Event emission for transparency

### ConfidentialETH.sol / ConfidentialUSDT.sol / ConfidentialZama.sol
ERC20-compatible confidential token contracts with FHE capabilities.

**Key Functions:**
- `confidentialTransfer(address to, euint64 amount)`: Transfer encrypted amounts
- `confidentialTransferFrom(address from, address to, euint64 amount)`: Delegated encrypted transfers
- `confidentialBalanceOf(address account)`: Query encrypted balance
- `setOperator(address operator, uint48 until)`: Authorize operators for transfers
- `faucet(address to)`: Mint test tokens (development only)

**FHE Features:**
- Encrypted balance storage
- Homomorphic addition/subtraction
- Access control for encrypted data
- Zero-knowledge proof validation

## Frontend Application

### Component Structure

```
home/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Navigation and wallet connection
│   │   ├── StakingApp.tsx          # Main application container
│   │   └── TokenStakeCard.tsx      # Individual token staking interface
│   ├── config/
│   │   ├── contracts.ts            # Contract addresses and ABIs
│   │   └── wagmi.ts                # Web3 configuration
│   ├── hooks/
│   │   ├── useEthersSigner.ts      # Ethers.js signer hook
│   │   └── useZamaInstance.ts      # FHE instance initialization
│   ├── styles/                      # CSS styling
│   ├── App.tsx                      # Application root
│   └── main.tsx                     # Entry point
```

### State Management
- React Query for server state and caching
- Wagmi for wallet and blockchain state
- Local component state for UI interactions

### Key Features
- Automatic wallet connection with RainbowKit
- Real-time balance updates
- Transaction status tracking
- Error handling and user feedback
- Responsive design for mobile and desktop

## Problems Solved

### 1. **Privacy in DeFi**
**Problem**: Traditional DeFi exposes all financial activities publicly, creating privacy risks for users.
**Solution**: FHE-based encryption ensures balances and transaction amounts remain confidential while maintaining blockchain transparency and verifiability.

### 2. **Front-Running & MEV Attacks**
**Problem**: Visible transaction amounts enable MEV bots to front-run and extract value from users.
**Solution**: Encrypted amounts prevent MEV actors from analyzing and exploiting transactions, protecting user value.

### 3. **Competitive Disadvantage**
**Problem**: Large holders are disadvantaged when their positions are publicly visible, affecting market dynamics.
**Solution**: Confidential balances level the playing field, preventing position-based market manipulation.

### 4. **Regulatory Compliance**
**Problem**: Public blockchain data may conflict with privacy regulations (GDPR, financial privacy laws).
**Solution**: Confidential computing enables compliance while maintaining blockchain benefits, suitable for institutional adoption.

### 5. **User Tracking & Profiling**
**Problem**: Blockchain analytics can profile users based on transaction patterns and balances.
**Solution**: Encrypted data prevents unauthorized profiling while allowing users to selectively disclose information.

### 6. **Cross-Chain Privacy**
**Problem**: Most privacy solutions are chain-specific and don't interoperate well.
**Solution**: FHEVM-based approach can be deployed across EVM-compatible chains, enabling privacy across ecosystems.

## Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Wallet**: MetaMask or other Web3 wallet
- **Test ETH**: Sepolia testnet ETH for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stake-confidential.git
   cd stake-confidential
   ```

2. **Install smart contract dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd home
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   # Set up deployment private key
   cp .env.example .env
   # Edit .env and add your private key and API keys

   # For Hardhat variables (alternative to .env)
   npx hardhat vars set DEPLOYER_PRIVATE_KEY
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

### Development

#### Smart Contracts

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Run coverage**
   ```bash
   npm run coverage
   ```

4. **Start local blockchain**
   ```bash
   npx hardhat node
   ```

5. **Deploy to local network**
   ```bash
   npm run deploy:localhost
   ```

#### Frontend

1. **Start development server**
   ```bash
   cd home
   npm run dev
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Preview production build**
   ```bash
   npm run preview
   ```

### Deployment

#### Deploy to Sepolia Testnet

1. **Ensure you have Sepolia ETH**
   - Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

2. **Deploy contracts**
   ```bash
   npm run deploy:sepolia
   ```

3. **Verify contracts on Etherscan**
   ```bash
   npm run verify:sepolia
   ```

4. **Update frontend configuration**
   - Copy deployed contract addresses from deployment logs
   - Update `home/src/config/contracts.ts` with new addresses

#### Deploy Frontend to Netlify

1. **Build the frontend**
   ```bash
   cd home
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy automatically triggers on git push

## Usage

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select your wallet provider (MetaMask, WalletConnect, etc.)
   - Approve the connection request

2. **Get Test Tokens**
   - Click "Get Test Tokens" on any token card
   - Confirm the faucet transaction
   - Wait for confirmation (tokens are minted to your address)

3. **Authorize Staking Contract**
   - Click "Authorize Staking" button
   - Confirm the transaction to set operator permissions
   - This allows the staking contract to transfer tokens on your behalf

4. **Stake Tokens**
   - Enter the amount to stake
   - Click "Stake" button
   - Confirm the transaction
   - Amount is encrypted client-side and sent to blockchain

5. **View Balance**
   - Encrypted stake balance is displayed (visible only to you)
   - Total pool statistics are shown

6. **Withdraw Tokens**
   - Click "Withdraw All" to retrieve your stake
   - Confirm the transaction
   - Tokens are returned to your wallet

### For Developers

#### Adding a New Confidential Token

1. **Create the token contract**
   ```solidity
   // contracts/ConfidentialNewToken.sol
   pragma solidity ^0.8.27;

   import {ConfidentialFungibleToken} from "new-confidential-contracts/token/ConfidentialFungibleToken.sol";
   import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

   contract ConfidentialNewToken is ConfidentialFungibleToken, SepoliaConfig {
       constructor() ConfidentialFungibleToken("cNEW", "cNEW", "") {}
   }
   ```

2. **Update deployment script**
   ```typescript
   // deploy/deploy.ts
   const confidentialNew = await deploy("ConfidentialNewToken", {
     from: deployer,
     log: true,
   });

   // Add to staking contract token list
   const staking = await deploy("ConfidentialStaking", {
     from: deployer,
     args: [[..., confidentialNew.address]],
     log: true,
   });
   ```

3. **Update frontend configuration**
   ```typescript
   // home/src/config/contracts.ts
   export const TOKEN_CONTRACTS = [
     // ...existing tokens,
     {
       key: 'cnew',
       name: 'Confidential NEW',
       symbol: 'cNEW',
       decimals: 6,
       address: '0x...',
       abi: [...],
     }
   ];
   ```

## Testing

### Smart Contract Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/ConfidentialStaking.ts

# Run tests with gas reporting
REPORT_GAS=true npm test

# Generate coverage report
npm run coverage
```

### Test Coverage
The project maintains comprehensive test coverage:
- Unit tests for all contract functions
- Integration tests for staking workflows
- Edge case and error condition testing
- Gas optimization verification

### Frontend Testing

```bash
cd home

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## Security Considerations

### Smart Contract Security

1. **Access Control**
   - Only whitelisted tokens can be staked
   - Encrypted values have strict access permissions
   - Operator authorization follows time-bound approval pattern

2. **FHE Safety**
   - All arithmetic operations use FHESafeMath library
   - Overflow/underflow protection for encrypted values
   - Proper initialization checks for encrypted types

3. **Reentrancy Protection**
   - State updates before external calls
   - Use of CEI (Checks-Effects-Interactions) pattern
   - No recursive call vulnerabilities

4. **Input Validation**
   - Zero-knowledge proof verification for encrypted inputs
   - Address validation for all user inputs
   - Token existence checks before operations

### Frontend Security

1. **Private Key Management**
   - Never store private keys
   - Wallet connection through trusted providers
   - Secure transaction signing flow

2. **Client-Side Encryption**
   - Encryption happens in browser before network transmission
   - Secure random number generation
   - Proper key derivation

3. **Data Privacy**
   - No sensitive data logged or transmitted to third parties
   - Encrypted data never exposed in plaintext
   - User consent for all blockchain operations

### Audit Status
- Smart contracts follow OpenZeppelin and Zama best practices
- Code reviewed for common vulnerabilities
- Recommended: Professional audit before mainnet deployment

## Future Roadmap

### Phase 1: Enhanced Functionality (Q2 2025)
- [ ] **Staking Rewards**: Implement encrypted reward distribution
- [ ] **Time-Locked Staking**: Add lock period options with bonus rewards
- [ ] **Partial Withdrawals**: Enable withdrawal of specific amounts instead of all
- [ ] **Multi-Signature Support**: Allow shared staking accounts
- [ ] **Delegation**: Implement staking delegation for governance

### Phase 2: User Experience (Q3 2025)
- [ ] **Mobile App**: Native mobile applications for iOS and Android
- [ ] **Transaction History**: Privacy-preserving transaction logs
- [ ] **Portfolio Dashboard**: Comprehensive analytics and insights
- [ ] **Notification System**: Real-time alerts for staking events
- [ ] **Multi-Language Support**: Internationalization for global users

### Phase 3: Advanced Features (Q4 2025)
- [ ] **Liquid Staking Derivatives**: Issue wrapped tokens representing stakes
- [ ] **Auto-Compounding**: Automatic reward reinvestment
- [ ] **Cross-Chain Staking**: Support for multiple blockchain networks
- [ ] **Governance Integration**: Token holder voting with privacy
- [ ] **NFT Staking**: Support for confidential NFT staking

### Phase 4: Enterprise & Institutional (Q1 2026)
- [ ] **Institutional Dashboard**: Advanced analytics and reporting
- [ ] **Compliance Tools**: Selective disclosure for regulatory requirements
- [ ] **Audit Trails**: Privacy-preserving audit capabilities
- [ ] **API Integration**: RESTful API for third-party integrations
- [ ] **White-Label Solution**: Customizable platform for institutions

### Phase 5: DeFi Integration (Q2 2026)
- [ ] **Lending Protocol**: Confidential lending/borrowing using staked assets
- [ ] **Yield Aggregation**: Privacy-preserving yield optimization
- [ ] **DEX Integration**: Confidential trading of staked positions
- [ ] **Insurance Protocol**: Protect staked assets with confidential coverage
- [ ] **Derivatives Market**: Privacy-preserving derivatives trading

### Research & Innovation
- **ZK-SNARK Integration**: Hybrid ZK + FHE for enhanced privacy and efficiency
- **Layer 2 Scaling**: Confidential staking on L2 networks
- **Privacy-Preserving Analytics**: Aggregate insights without individual exposure
- **Confidential Smart Contract Composition**: Complex DeFi strategies with privacy
- **Interoperability Protocols**: Cross-chain confidential state synchronization

### Security & Compliance
- **Professional Security Audit**: Comprehensive third-party security assessment
- **Bug Bounty Program**: Community-driven security testing
- **Formal Verification**: Mathematical proof of contract correctness
- **Regulatory Framework**: Compliance with evolving crypto regulations
- **Insurance Coverage**: Protocol insurance for user protection

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Code Contributions**
   - Bug fixes
   - New features
   - Performance improvements
   - Documentation updates

2. **Testing**
   - Write additional tests
   - Test on different networks
   - Report bugs and issues

3. **Documentation**
   - Improve existing docs
   - Translate documentation
   - Create tutorials and guides

4. **Community**
   - Answer questions in discussions
   - Share the project
   - Provide feedback

### Development Process

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/stake-confidential.git
   cd stake-confidential
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features

3. **Test thoroughly**
   ```bash
   npm test
   npm run lint
   ```

4. **Submit a pull request**
   - Describe your changes clearly
   - Reference related issues
   - Wait for review and feedback

### Code Style Guidelines

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Use ESLint and Prettier configurations provided
- **Commits**: Use conventional commit messages
- **Testing**: Maintain or improve test coverage

## License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for complete details.

### Key Points:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ Patent use NOT granted
- ⚠️ No warranty provided

## Support

### Documentation
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://react.dev)
- [Wagmi Documentation](https://wagmi.sh)

### Community
- **Discord**: [Join our Discord](https://discord.gg/zama)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/yourusername/stake-confidential/discussions)
- **Twitter**: [@ZamaFHE](https://twitter.com/ZamaFHE)

### Issues & Bug Reports
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/stake-confidential/issues)
- **Security Issues**: Please report security vulnerabilities privately to security@example.com

### Professional Support
For enterprise support, custom development, or consulting services, contact: enterprise@example.com

---

## Acknowledgments

This project is built with amazing open-source technologies:
- **Zama** for pioneering FHE technology and FHEVM protocol
- **OpenZeppelin** for secure smart contract libraries
- **Hardhat** team for excellent developer tooling
- **Wagmi** and **RainbowKit** teams for Web3 integrations
- The broader Ethereum and crypto community

---

**Built with ❤️ and 🔐 by the Confidential Staking team**

*Empowering privacy-preserving DeFi for everyone*
