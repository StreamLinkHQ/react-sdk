import { useState } from "react";
import { Transaction, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import { baseApi } from "../utils/index";

interface UseSignAndSubmitTransactionProps {
  transactionBase64: string | null;
  publicKey: PublicKey | null;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
}

interface UseSignAndSubmitTransactionReturn {
  signAndSubmitTransaction: () => Promise<void>;
  transactionSignature: string | null;
  error: string | null;
  loading: boolean;
}

export const useSignAndSubmitTransaction = ({
  transactionBase64,
  publicKey,
  signTransaction,
}: UseSignAndSubmitTransactionProps): UseSignAndSubmitTransactionReturn => {
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const signAndSubmitTransaction = async () => {
    if (!transactionBase64) {
      setError("No transaction to sign.");
      return;
    }
    if (!publicKey) {
      setError("Wallet not connected.");
      return;
    }

    if (!signTransaction) {
      setError("Wallet doesn't support signing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transaction = Transaction.from(
        Buffer.from(transactionBase64, "base64")
      );

      const signedTransaction = await signTransaction(transaction);
      const serializedTransaction = signedTransaction
        .serialize()
        .toString("base64");

      const response = await fetch(`${baseApi}/pay/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signedTransaction: serializedTransaction,
          wallet: publicKey.toString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.signature) {
        setTransactionSignature(data.signature);
      } else {
        setError("No signature received after submission.");
      }
    } catch (err) {
      console.error("Error signing/submitting transaction:", err);
      setError("Failed to sign and submit the transaction.");
    } finally {
      setLoading(false);
    }
  };

  return { signAndSubmitTransaction, transactionSignature, error, loading };
};
