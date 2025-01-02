import { useEffect, useCallback } from "react";
import { GoogleViaTipLinkWalletName } from "@tiplink/wallet-adapter";
import { useWallet } from "@solana/wallet-adapter-react";
import { baseApi } from "../utils";
import { useUser, useNotification } from "../hooks";

const WalletButton = () => {
  const { select, wallet, connect, autoConnect, publicKey, connected } =
    useWallet();

  const { setUser } = useUser();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (!autoConnect) {
      if ("_disconnected" in (wallet?.adapter ?? {})) {
        connect();
      }
    }
  }, [autoConnect, connect, select, wallet]);
  const saveUserToDB = useCallback(
    async (walletAddress: string) => {
      try {
        const response = await fetch(`${baseApi}/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wallet: walletAddress }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const user = await response.json();
        if (!user) {
          addNotification({
            type: "error",
            message: "Something went wrong, please try again",
            duration: 3000,
          });
          return;
        }

        setUser(user.data);
      } catch (error) {
        console.error("Error saving wallet address:", error);
        addNotification({
          type: "error",
          message: "Failed to save wallet address",
          duration: 3000,
        });
      }
    },
    [addNotification, setUser]
  );

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      saveUserToDB(walletAddress);
    }
  }, [connected, publicKey, saveUserToDB]);

  return (
    <>
      <button onClick={() => select(GoogleViaTipLinkWalletName)}>
        Connect Wallet
      </button>
      <div>{wallet?.adapter.publicKey?.toBase58()}</div>
    </>
  );
};

export default WalletButton;
