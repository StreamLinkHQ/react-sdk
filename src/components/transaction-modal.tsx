import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Modal } from "./base";
import {
  useParticipantList,
  useFetchTransaction,
  useSignAndSubmitTransaction,
} from "../hooks";
import { Participant } from "../types";

type TransactionModalProps = {
  closeFunc: (val: boolean) => void;
  roomName: string;
};

const TransactionModal = ({ closeFunc, roomName }: TransactionModalProps) => {
  const { publicKey, signTransaction } = useWallet();
  const [sendToAll, setSendToAll] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<Participant[]>([]);
  const { participants } = useParticipantList({ roomName });

  const recipients = sendToAll
    ? participants.filter(p => p.walletAddress !== publicKey?.toString()).map((p) => ({
        publicKey: p.walletAddress,
        amount: Number(amount),
      }))
    : selectedUsers.map((user) => ({
        publicKey: user.walletAddress,
        amount: Number(amount),
      }));
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("heyyy");
    await fetchTransaction();

    if (transactionBase64) {
      await signAndSubmitTransaction();
    }
  };

  const handleUserSelection = (user: Participant) => {
    setSelectedUsers((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (selected) => selected.id === user.id
      );
      if (isAlreadySelected) {
        return prevSelected.filter((selected) => selected.id !== user.id);
      } else {
        return [...prevSelected, user];
      }
    });
  };
  return (
    <Modal
      bgColor="bg-modal-black"
      closeFunc={closeFunc}
      position="left"
      width="w-1/3"
    >
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={sendToAll}
                onChange={() => setSendToAll(true)}
                className="form-radio"
              />
              <span>Send to all users</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!sendToAll}
                onChange={() => setSendToAll(false)}
                className="form-radio"
              />
              <span>Send to specific users</span>
            </label>
          </div>

          {!sendToAll && (
            <div className="space-y-2">
              {participants.map((user) => (
                <label key={user.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.some(
                      (selected) => selected.id === user.id
                    )}
                    onChange={() => handleUserSelection(user)}
                    className="form-checkbox"
                  />
                  <span>{user.userName}</span>
                </label>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="amount" className="block">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => closeFunc(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={fetchLoading || signLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              {fetchLoading || signLoading ? "Processing..." : "Send"}
            </button>
          </div>
        </form>
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
      </div>
    </Modal>
  );
};

export default TransactionModal;
