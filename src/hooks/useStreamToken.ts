import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { UserType, GenerateTokenParams } from "../types/index";
import { baseApi } from "../utils/index";
import { useNotification } from "./useNotification";


export const useStreamToken = (roomName: string, userType: UserType, walletAddress: string) => {
  const [token, setToken] = useState<string>();
  const { publicKey } = useWallet();
  const { addNotification } = useNotification();

  const generateToken = async (val: GenerateTokenParams) => {
    if (!publicKey) {
      addNotification({
        type: "error",
        message: "Please, connect your wallet",
        duration: 3000,
      });
      return;
    }

    // const walletAddress = publicKey.toBase58();
    const data = {
      roomName,
      userType,
      userName: val.username,
      wallet: walletAddress,
      // wallet: val.walletAddress
    };

    try {
      const response = await fetch(`${baseApi}/livestream/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const tokenRes = await response.json();
      if (!tokenRes) {
        addNotification({
          type: "error",
          message: "Something went wrong, please try again",
          duration: 3000,
        });
        return;
      }
      
      setToken(tokenRes);
    } catch (error) {
      console.error('Token generation failed:', error);
      addNotification({
        type: "error",
        message: "Failed to generate token",
        duration: 3000,
      });
    }
  };

  return { token, setToken, generateToken };
};