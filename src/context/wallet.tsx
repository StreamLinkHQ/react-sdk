import { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";
import { WalletModalProvider } from "@tiplink/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Define network outside useMemo to avoid recreation
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), []);

  // Move adapter creation to useMemo with proper dependencies
  const wallets = useMemo(() => {
    const adapter = new TipLinkWalletAdapter({
      title: "Streamlink",
      clientId: "3d4e3da1-1e46-4715-80c7-30de8b045a4d",
      theme: "dark",
      walletAdapterNetwork: network === WalletAdapterNetwork.Devnet
        ? WalletAdapterNetwork.Devnet
        : WalletAdapterNetwork.Mainnet,
    });

    return [adapter];
  }, []); // Empty dependency array since network is constant

  // Debug logs
  console.log("Using network:", network);
  console.log("Endpoint:", endpoint);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};