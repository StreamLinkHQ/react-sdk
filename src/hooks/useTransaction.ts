import { useState } from "react";
import { Transaction, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import { baseApi } from "../utils";
import { Recipient } from "../types";

interface UseTransactionProps {
  publicKey: PublicKey | null;
  recipients: Recipient[];
  tokenName?: string;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
}

interface UseTransactionReturn {
  fetchTransaction: () => Promise<void>;
  signAndSubmitTransaction: () => Promise<void>;
  transactionBase64: string | null;
  transactionSignature: string | null;
  error: string | null;
  loading: boolean;
}

export const useTransaction = ({
  publicKey,
  recipients,
  tokenName = "sol",
  signTransaction,
}: UseTransactionProps): UseTransactionReturn => {
  const [transactionBase64, setTransactionBase64] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transaction.");
      }

      if (!data.transaction) {
        throw new Error("No transaction data received.");
      }

      setTransactionBase64(data.transaction);
    } catch (err) {
      console.error("Error fetching transaction:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch transaction.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signAndSubmitTransaction = async () => {
    if (!transactionBase64) {
      throw new Error("No transaction to sign.");
    }

    if (!publicKey) {
      throw new Error("Wallet not connected.");
    }

    if (!signTransaction) {
      throw new Error("Wallet doesn't support signing.");
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit transaction.");
      }

      if (!data.signature) {
        throw new Error("No signature received after submission.");
      }

      setTransactionSignature(data.signature);
    } catch (err) {
      console.error("Error signing/submitting transaction:", err);
      setError(err instanceof Error ? err.message : "Failed to sign and submit the transaction.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchTransaction,
    signAndSubmitTransaction,
    transactionBase64,
    transactionSignature,
    error,
    loading
  };
};