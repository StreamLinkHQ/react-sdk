import { useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { baseApi } from "../utils";

const WalletButton = () => {
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      saveUserToDB(walletAddress);
    }
  }, [connected, publicKey]);

  const saveUserToDB = async (walletAddress: string) => {
    try {
      await fetch(`${baseApi}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet: walletAddress }),
      });
    } catch (error) {
      console.error("Error saving wallet address:", error);
    }
    
  };
  return <WalletMultiButton />;
};

export default WalletButton;
