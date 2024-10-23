import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Modal } from "../base";
import { useParticipantList, useTransaction, useNotification } from "../../hooks";
import { Participant } from "../../types";

type TransactionModalProps = {
  closeFunc: (val: boolean) => void;
  roomName: string;
};

const TransactionModal = ({ closeFunc, roomName }: TransactionModalProps) => {
  const { publicKey, signTransaction } = useWallet();
  const [sendToAll, setSendToAll] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<Participant[]>([]);
  const [tokenName, setTokenName] = useState<string>("");
  const { participants } = useParticipantList({ roomName });
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const [isTransactionFetched, setIsTransactionFetched] =
    useState<boolean>(false);

  const recipients = sendToAll
    ? participants
        .filter((p) => p.walletAddress !== publicKey?.toString())
        .map((p) => ({
          publicKey: p.walletAddress,
          amount: Number(amount),
        }))
    : selectedUsers.map((user) => ({
        publicKey: user.walletAddress,
        amount: Number(amount),
      }));

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

  // Effect to handle transaction signing after fetch
  useEffect(() => {
    const handleTransactionSign = async () => {
      if (transactionBase64 && isTransactionFetched) {
        try {
          await signAndSubmitTransaction();

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
            message:
              error instanceof Error
                ? error.message
                : "Failed to sign and submit the transaction",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!amount) {
      addNotification({
        type: "error",
        message: "Amount is required",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await fetchTransaction();
      setIsTransactionFetched(true);
    } catch (err) {
      console.error("Transaction error:", err);
      addNotification({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to fetch transaction",
        duration: 3000,
      });
      setLoading(false);
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
            <label htmlFor="token" className="block">
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
              disabled={loading || transactionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading || transactionLoading ? "Processing..." : "Send"}
            </button>
          </div>
        </form>
        {error && (
          <p className="text-wrap text-sm text-red-600">Error: {error}</p>
        )}
        {transactionSignature && (
          <div className="text-sm text-wrap w-[96%] mt-2">
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
      </div>
    </Modal>
  );
};

export default TransactionModal;
