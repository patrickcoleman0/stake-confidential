import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Confidential Staking Dashboard</h1>
            <span className="header-badge">FHE Protected</span>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
