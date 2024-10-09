import { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";
import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  console.log("Using network:", network);
  console.log("Endpoint:", endpoint);

  const wallets = useMemo(
    () => [
      new TipLinkWalletAdapter({
        title: "Streamlink",
        clientId: "3d4e3da1-1e46-4715-80c7-30de8b045a4d",
        theme: "dark",
        walletAdapterNetwork:
          network === "devnet"
            ? WalletAdapterNetwork.Devnet
            : WalletAdapterNetwork.Mainnet,
      }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

