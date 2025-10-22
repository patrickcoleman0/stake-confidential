import { useAccount } from 'wagmi';

import { TOKEN_CONTRACTS, STAKING_CONTRACT } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { Header } from './Header';
import { TokenStakeCard } from './TokenStakeCard';
import '../styles/StakingApp.css';

export function StakingApp() {
  const { address, isConnected } = useAccount();
  const { instance, isLoading: isZamaLoading, error } = useZamaInstance();
  const signerPromise = useEthersSigner();

  return (
    <div className="staking-app">
      <Header />
      <main className="staking-main">
        <section className="staking-hero">
          <h1 className="staking-title">Confidential Token Staking</h1>
          <p className="staking-subtitle">
            Stake and withdraw encrypted balances while keeping amounts private. Authorize the staking contract, encrypt
            your stake, and track totals with FHE-secured workflows.
          </p>
        </section>

        {error && <div className="staking-alert error">{error}</div>}
        {isZamaLoading && !error && (
          <div className="staking-alert info">Initializing encryption service. This usually takes a few seconds.</div>
        )}

        <section className="token-grid">
          {TOKEN_CONTRACTS.map((token) => (
            <TokenStakeCard
              key={token.key}
              token={token}
              stakingAddress={STAKING_CONTRACT.address}
              stakingAbi={STAKING_CONTRACT.abi}
              zamaInstance={instance}
              signerPromise={signerPromise}
              userAddress={address ?? null}
              isConnected={isConnected}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
