import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Confidential Staking',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect Cloud project ID
  chains: [sepolia],
  ssr: false,
});
