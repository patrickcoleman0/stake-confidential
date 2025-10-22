import { useCallback, useMemo, useState } from 'react';
import { useReadContract } from 'wagmi';
import { Contract, Interface } from 'ethers';
import type { Abi } from 'viem';
import type { JsonRpcSigner } from 'ethers';

import type { SupportedTokenKey } from '../config/contracts';
import '../styles/TokenStakeCard.css';

type EthersInterfaceAbi = ConstructorParameters<typeof Interface>[0];

type TokenConfig = {
  key: SupportedTokenKey;
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  abi: readonly unknown[];
};

type TokenStakeCardProps = {
  token: TokenConfig;
  stakingAddress: string;
  stakingAbi: readonly unknown[];
  zamaInstance: any;
  signerPromise?: Promise<JsonRpcSigner>;
  userAddress: string | null;
  isConnected: boolean;
};

const ZERO_HANDLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

function parseAmountInput(value: string, decimals: number): bigint | null {
  if (!value.trim()) {
    return null;
  }

  const decimalIndex = value.indexOf('.');
  const wholePart = decimalIndex === -1 ? value : value.slice(0, decimalIndex);
  const fractionPart = decimalIndex === -1 ? '' : value.slice(decimalIndex + 1);

  if (!/^\d*$/.test(wholePart) || !/^\d*$/.test(fractionPart)) {
    return null;
  }

  if (fractionPart.length > decimals) {
    return null;
  }

  const paddedFraction = fractionPart.padEnd(decimals, '0');
  const normalized = `${wholePart || '0'}${paddedFraction}`.replace(/^0+(\d)/, '$1');

  try {
    return BigInt(normalized || '0');
  } catch {
    return null;
  }
}

function formatAmount(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = absolute / base;
  const fraction = absolute % base;
  if (fraction === 0n) {
    return `${negative ? '-' : ''}${whole.toString()}`;
  }
  const fractionString = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole.toString()}.${fractionString}`;
}

export function TokenStakeCard({
  token,
  stakingAddress,
  stakingAbi,
  zamaInstance,
  signerPromise,
  userAddress,
  isConnected,
}: TokenStakeCardProps) {
  const [amountInput, setAmountInput] = useState('');
  const [balanceValue, setBalanceValue] = useState<bigint | null>(null);
  const [stakeValue, setStakeValue] = useState<bigint | null>(null);
  const [totalValue, setTotalValue] = useState<bigint | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isFauceting, setIsFauceting] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const canInteract = isConnected && !!userAddress;

  const commonQuery = useMemo(
    () => ({
      enabled: canInteract,
    }),
    [canInteract],
  );

  const tokenAddress = token.address as `0x${string}`;
  const stakingContractAddress = stakingAddress as `0x${string}`;
  const tokenAbi = token.abi as Abi;
  const stakingAbiTyped = stakingAbi as Abi;

  const {
    data: balanceHandle,
    refetch: refetchBalance,
    isFetching: isBalanceFetching,
  } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'confidentialBalanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: commonQuery,
  });

  const {
    data: stakeHandle,
    refetch: refetchStake,
    isFetching: isStakeFetching,
  } = useReadContract({
    address: stakingContractAddress,
    abi: stakingAbiTyped,
    functionName: 'stakeOf',
    args: userAddress ? [userAddress, token.address] : undefined,
    query: commonQuery,
  });

  const {
    data: totalHandle,
    refetch: refetchTotal,
    isFetching: isTotalFetching,
  } = useReadContract({
    address: stakingContractAddress,
    abi: stakingAbiTyped,
    functionName: 'totalStaked',
    args: [token.address],
    query: { enabled: true },
  });

  const decryptValue = useCallback(
    async (handle: unknown, contractAddress: string) => {
      if (!handle || typeof handle !== 'string' || handle === ZERO_HANDLE) {
        return 0n;
      }
      if (!zamaInstance) {
        throw new Error('Encryption service is not ready');
      }
      if (!signerPromise) {
        throw new Error('Wallet signer is unavailable');
      }
      if (!userAddress) {
        throw new Error('Connect your wallet to decrypt values');
      }

      const keypair = zamaInstance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [contractAddress];

      const eip712 = zamaInstance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
      );

      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer is not available');
      }

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const result = await zamaInstance.userDecrypt(
        [
          {
            handle,
            contractAddress,
          },
        ],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        userAddress,
        startTimestamp,
        durationDays,
      );

      const decrypted = result[handle];
      return decrypted ? BigInt(decrypted) : 0n;
    },
    [zamaInstance, signerPromise, userAddress],
  );

  const refreshDecryptedValues = useCallback(async () => {
    if (!canInteract) {
      setStatusMessage('Connect your wallet to decrypt balances.');
      return;
    }

    setIsDecrypting(true);
    setStatusMessage(null);
    try {
      const [balance, stake, total] = await Promise.all([
        decryptValue(balanceHandle, token.address),
        decryptValue(stakeHandle, stakingAddress),
        decryptValue(totalHandle, stakingAddress),
      ]);

      setBalanceValue(balance);
      setStakeValue(stake);
      setTotalValue(total);
    } catch (error) {
      console.error('Failed to decrypt values', error);
      setStatusMessage(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDecrypting(false);
    }
  }, [
    balanceHandle,
    stakeHandle,
    totalHandle,
    decryptValue,
    token.address,
    stakingAddress,
    canInteract,
  ]);

  const handleFaucet = useCallback(async () => {
    if (!canInteract) {
      setStatusMessage('Connect a wallet before using the faucet.');
      return;
    }
    if (!signerPromise) {
      setStatusMessage('Wallet signer is not ready.');
      return;
    }

    setIsFauceting(true);
    setStatusMessage(null);
    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer is not available');
      }
      const tokenInterface = new Interface(token.abi as EthersInterfaceAbi);
      const contract = new Contract(token.address, tokenInterface, signer);
      const tx = await contract.faucet(userAddress);
      await tx.wait();
      setStatusMessage('Faucet transaction confirmed.');
      await refetchBalance();
    } catch (error) {
      console.error('Faucet failed', error);
      setStatusMessage(`Faucet failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFauceting(false);
    }
  }, [canInteract, signerPromise, token.address, token.abi, userAddress, refetchBalance]);

  const handleAuthorize = useCallback(async () => {
    if (!canInteract) {
      setStatusMessage('Connect a wallet before authorizing the staking contract.');
      return;
    }
    if (!signerPromise) {
      setStatusMessage('Wallet signer is not ready.');
      return;
    }

    setIsAuthorizing(true);
    setStatusMessage(null);
    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer is not available');
      }
      const tokenInterface = new Interface(token.abi as EthersInterfaceAbi);
      const contract = new Contract(token.address, tokenInterface, signer);
      const until = Math.floor(Date.now() / 1000) + 86400;
      const tx = await contract.setOperator(stakingAddress, until);
      await tx.wait();
      setStatusMessage('Staking contract authorized successfully.');
    } catch (error) {
      console.error('Authorization failed', error);
      setStatusMessage(`Authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAuthorizing(false);
    }
  }, [canInteract, signerPromise, token.address, token.abi, stakingAddress]);

  const handleStake = useCallback(async () => {
    if (!canInteract) {
      setStatusMessage('Connect your wallet to stake tokens.');
      return;
    }
    if (!signerPromise) {
      setStatusMessage('Wallet signer is not ready.');
      return;
    }
    if (!zamaInstance) {
      setStatusMessage('Encryption service is still loading.');
      return;
    }

    const parsedAmount = parseAmountInput(amountInput, token.decimals);
    if (parsedAmount === null || parsedAmount <= 0n) {
      setStatusMessage('Enter a valid amount to stake.');
      return;
    }

    if (balanceValue !== null && parsedAmount > balanceValue) {
      setStatusMessage('Stake amount exceeds available balance.');
      return;
    }

    setIsStaking(true);
    setStatusMessage(null);
    try {
      const builder = zamaInstance.createEncryptedInput(stakingAddress, userAddress);
      builder.add64(parsedAmount);
      const encrypted = await builder.encrypt();

      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer is not available');
      }

      const stakingInterface = new Interface(stakingAbi as EthersInterfaceAbi);
      const contract = new Contract(stakingAddress, stakingInterface, signer);
      const tx = await contract.stake(token.address, encrypted.handles[0], encrypted.inputProof);
      await tx.wait();

      setAmountInput('');
      setStatusMessage('Stake transaction confirmed.');
      await Promise.all([refetchBalance(), refetchStake(), refetchTotal()]);
    } catch (error) {
      console.error('Stake failed', error);
      setStatusMessage(`Stake failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsStaking(false);
    }
  }, [
    amountInput,
    canInteract,
    signerPromise,
    zamaInstance,
    token.decimals,
    token.address,
    stakingAddress,
    stakingAbi,
    userAddress,
    balanceValue,
    refetchBalance,
    refetchStake,
    refetchTotal,
  ]);

  const handleWithdrawAll = useCallback(async () => {
    if (!canInteract) {
      setStatusMessage('Connect your wallet to withdraw.');
      return;
    }
    if (!signerPromise) {
      setStatusMessage('Wallet signer is not ready.');
      return;
    }

    setIsWithdrawing(true);
    setStatusMessage(null);
    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Signer is not available');
      }
      const stakingInterface = new Interface(stakingAbi as EthersInterfaceAbi);
      const contract = new Contract(stakingAddress, stakingInterface, signer);
      const tx = await contract.withdrawAll(token.address);
      await tx.wait();
      setStatusMessage('Withdrawal confirmed.');
      await Promise.all([refetchBalance(), refetchStake(), refetchTotal()]);
    } catch (error) {
      console.error('Withdrawal failed', error);
      setStatusMessage(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsWithdrawing(false);
    }
  }, [
    canInteract,
    signerPromise,
    stakingAddress,
    stakingAbi,
    token.address,
    refetchBalance,
    refetchStake,
    refetchTotal,
  ]);

  const renderAmount = useCallback(
    (value: bigint | null) => {
      if (!canInteract) {
        return 'Connect wallet';
      }
      if (value === null) {
        return 'Encrypted';
      }
      return formatAmount(value, token.decimals);
    },
    [canInteract, token.decimals],
  );

  return (
    <article className="token-card">
      <header className="token-card__header">
        <div>
          <h2 className="token-card__title">{token.symbol}</h2>
          <p className="token-card__subtitle">{token.name}</p>
        </div>
      </header>

      <div className="token-card__metrics">
        <div className="token-card__metric">
          <span className="token-card__metric-label">Your balance</span>
          <span className="token-card__metric-value">{renderAmount(balanceValue)}</span>
        </div>
        <div className="token-card__metric">
          <span className="token-card__metric-label">Your stake</span>
          <span className="token-card__metric-value">{renderAmount(stakeValue)}</span>
        </div>
        <div className="token-card__metric">
          <span className="token-card__metric-label">Total staked</span>
          <span className="token-card__metric-value">{renderAmount(totalValue)}</span>
        </div>
      </div>

      <div className="token-card__actions">
        <div className="token-card__input-group">
          <input
            type="text"
            inputMode="decimal"
            placeholder={`Amount in ${token.symbol}`}
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            className="token-card__input"
            disabled={!canInteract || isStaking}
          />
          <button
            className="token-card__primary-button"
            onClick={handleStake}
            disabled={!canInteract || isStaking || isDecrypting}
          >
            {isStaking ? 'Staking…' : 'Stake'}
          </button>
        </div>

        <div className="token-card__button-row">
          <button
            className="token-card__secondary-button"
            onClick={refreshDecryptedValues}
            disabled={!canInteract || isDecrypting || isBalanceFetching || isStakeFetching || isTotalFetching}
          >
            {isDecrypting ? 'Decrypting…' : 'Decrypt balances'}
          </button>
          <button
            className="token-card__secondary-button"
            onClick={handleWithdrawAll}
            disabled={!canInteract || isWithdrawing}
          >
            {isWithdrawing ? 'Withdrawing…' : 'Withdraw all'}
          </button>
        </div>

        <div className="token-card__button-row">
          <button
            className="token-card__ghost-button"
            onClick={handleAuthorize}
            disabled={!canInteract || isAuthorizing}
          >
            {isAuthorizing ? 'Authorizing…' : 'Authorize staking'}
          </button>
          <button
            className="token-card__ghost-button"
            onClick={handleFaucet}
            disabled={!canInteract || isFauceting}
          >
            {isFauceting ? 'Minting…' : 'Mint test tokens'}
          </button>
        </div>
      </div>

      {statusMessage && <p className="token-card__status">{statusMessage}</p>}
    </article>
  );
}
