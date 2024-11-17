import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { baseApi } from "../utils/index";
import { Recipient } from "../types/index";


interface UseFetchTransactionProps {
  publicKey: PublicKey | null;
  recipients: Recipient[];
  tokenName?: string;
}

interface UseFetchTransactionReturn {
  fetchTransaction: () => Promise<void>;
  transactionBase64: string | null;
  error: string | null;
  loading: boolean;
}

export const useFetchTransaction = ({
  publicKey,
  recipients,
  tokenName = "sol",
}: UseFetchTransactionProps): UseFetchTransactionReturn => {
  const [transactionBase64, setTransactionBase64] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTransaction = async () => {
    if (!publicKey) {
      setError("Wallet not connected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recipientsData = recipients.map((recipient) => ({
        recipientPublicKey: recipient.publicKey.toString(),
        amount: recipient.amount,
      }));

      const response = await fetch(`${baseApi}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderPublicKey: publicKey.toString(),
          recipients: recipientsData,
          tokenName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.transaction) {
        setTransactionBase64(data.transaction);
      } else {
        setError("No transaction data received.");
      }
    } catch (err) {
      console.error("Error fetching transaction:", err);
      setError("Failed to fetch transaction.");
    } finally {
      setLoading(false);
    }
  };
  return { fetchTransaction, transactionBase64, error, loading };
};
