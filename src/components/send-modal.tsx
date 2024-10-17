import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Modal } from "./base";
import { Participant } from "../types";
import { useTransaction, useNotification } from "../hooks";

type SendModalProps = {
  selectedUser: Participant | null;
  closeFunc: (val: boolean) => void;
};

const SendModal = ({ selectedUser, closeFunc }: SendModalProps) => {
  const [tokenAmount, setTokenAmount] = useState<string>();
  const [tokenName, setTokenName] = useState<string>("");
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [isTransactionFetched, setIsTransactionFetched] = useState<boolean>(false);

  const recipients = selectedUser
    ? [{
        publicKey: selectedUser.walletAddress,
        amount: Number(tokenAmount),
      }]
    : [];

  const { addNotification } = useNotification();
  const {
    fetchTransaction,
    signAndSubmitTransaction,
    transactionBase64,
    transactionSignature,
    error,
    loading: transactionLoading,
  } = useTransaction({
    publicKey,
    recipients,
    tokenName,
    signTransaction,
  });

  const handleTokenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTokenName(event.target.value);
    setIsTransactionFetched(false); // Reset when token changes
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAmount(event.target.value);
    setIsTransactionFetched(false); // Reset when amount changes
  };

  // Effect to handle transaction signing after fetch
  useEffect(() => {
    const handleTransactionSign = async () => {
      if (transactionBase64 && isTransactionFetched) {
        try {
          await signAndSubmitTransaction();
          
          // Only handle success here - errors are handled in the catch block
          if (transactionSignature) {
            addNotification({
              type: "success",
              message: "Transaction completed successfully",
              duration: 3000,
            });
            closeFunc(false);
          }
        } catch (error) {
          console.error("Error in signing transaction:", error);
          addNotification({
            type: "error",
            message: error instanceof Error ? error.message : "Failed to sign and submit the transaction",
            duration: 3000,
          });
        } finally {
          setIsTransactionFetched(false);
          setLoading(false);
        }
      }
    };

    handleTransactionSign();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionBase64, isTransactionFetched]);

  const sendToken = async () => {
    if (!tokenName || !tokenAmount) {
      addNotification({
        type: "error",
        message: "Token name and amount is required",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await fetchTransaction();
      setIsTransactionFetched(true);
    } catch (error) {
      console.error("Error in sendToken:", error);
      addNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to fetch transaction",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="text-black">
      <Modal
        bgColor="bg-modal-black"
        closeFunc={closeFunc}
        height="h-[320px]"
        position="center"
        width="w-[550px]"
      >
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="recipient" className="text-right">
              Recipient
            </label>
            <input
              id="recipient"
              value={selectedUser?.userName || ""}
              className="col-span-3 w-full bg-white border border-gray-300 p-2 rounded-md focus:outline-none"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="token" className="text-right">
              Token
            </label>
            <select
              className="col-span-3 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none"
              value={tokenName}
              onChange={handleTokenChange}
            >
              <option value="">Select token</option>
              <option value="sol">SOL</option>
              <option value="usdc">USDC</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              value={tokenAmount}
              onChange={handleAmountChange}
              className="col-span-3 w-full bg-white border border-gray-300 p-2 rounded-md focus:outline-none"
            />
          </div>
          <button
            onClick={sendToken}
            disabled={loading || transactionLoading}
            className="lg:w-[30%] ml-auto p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading || transactionLoading ? "Processing..." : "Send"}
          </button>
        </div>
        {error && (
          <p className="text-wrap text-sm text-red-600">
            Error: {error}
          </p>
        )}
        {transactionSignature && (
          <div className="text-sm text-wrap w-[80%]">
            <p>Transaction Signature:</p>
            <a
              href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all"
            >
              {transactionSignature}
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SendModal;

