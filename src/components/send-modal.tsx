import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Modal } from "./base";
import { Participant } from "../types";
import { useFetchTransaction, useSignAndSubmitTransaction, useNotification } from "../hooks";

type SendModalProps = {
  selectedUser: Participant | null;
  closeFunc: (val: boolean) => void;
};

const SendModal = ({ selectedUser, closeFunc }: SendModalProps) => {
  const [tokenAmount, setTokenAmount] = useState<string>();
  const [tokenName, setTokenName] = useState<string>("");
  const { publicKey, signTransaction } = useWallet();

  const recipients = selectedUser
  ? [{
      publicKey: selectedUser.walletAddress,
      amount: Number(tokenAmount),
    }]
  : [];

  const { addNotification } = useNotification()
  const {
    fetchTransaction,
    transactionBase64,
    error: fetchError,
    loading: fetchLoading,
  } = useFetchTransaction({ publicKey, recipients });

  const {
    signAndSubmitTransaction,
    transactionSignature,
    error: signError,
    loading: signLoading,
  } = useSignAndSubmitTransaction({
    transactionBase64,
    publicKey,
    signTransaction,
  });

  const handleTokenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTokenName(event.target.value);
  };

  const sendToken = async() => {
    if(!tokenName || !tokenAmount) {
      addNotification({
        type: "error",
        message: "Token name and amount is required",
        duration: 3000,
      });
      return
    }
    await fetchTransaction();

    if (transactionBase64) {
      await signAndSubmitTransaction();
    }
  }
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
              className="col-span-3 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none "
              value={tokenName}
              onChange={handleTokenChange}
            >
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
              onChange={(e) => setTokenAmount(e.target.value)}
              className="col-span-3 w-full bg-white border border-gray-300 p-2 rounded-md focus:outline-none"
            />
          </div>
          <button
            onClick={sendToken}
            disabled={fetchLoading || signLoading}
            className="lg:w-[30%] ml-auto p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
        {fetchError && (
          <p className="text-wrap text-sm text-red-600">
            Error fetching transaction: {fetchError}
          </p>
        )}
        {signError && (
          <p className="text-wrap text-sm text-red-600">
            Error signing/submitting transaction: {signError}
          </p>
        )}
        {transactionSignature && (
          <div className="text-sm text-wrap w-[80%]">
            <p>Transaction Signature:</p>
            <a
              href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
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
