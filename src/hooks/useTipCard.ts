import { useState, useEffect } from "react";
import { User } from "../types";
import { baseApi } from "../utils";

export const useTipCard = (userWallet: string) => {
  const [tipCardData, setTipCardData] = useState<{
    loading: boolean;
    error: boolean;
    tipCardUrl: string | undefined;
  }>({
    loading: true,
    error: false,
    tipCardUrl: undefined,
  });

  useEffect(() => {
    const fetchTipCard = async () => {
      try {
        const response = await fetch(`${baseApi}/user/${userWallet}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tip card");
        }
        const userData: User = await response.json();

        setTipCardData({
          loading: false,
          error: false,
          tipCardUrl: userData.tipCard,
        });
      } catch (error) {
        setTipCardData({
          loading: false,
          error: true,
          tipCardUrl: undefined,
        });
        console.error("An error occured", error);
      }
    };

    if (userWallet) {
      fetchTipCard();
    }
  }, [userWallet]);

  return tipCardData;
};
