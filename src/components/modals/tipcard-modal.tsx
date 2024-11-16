import { useState } from "react";
import { Modal, Loader } from "../base";
import { useUser, useNotification } from "../../hooks";
import { baseApi } from "../../utils";
import { User } from "../../types";

type TipCardModalProps = {
  closeFunc: (val: boolean) => void;
  onSuccess?: () => void;
};

const TipCardModal = ({ closeFunc, onSuccess }: TipCardModalProps) => {
  const [tipCard, setTipCard] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user, setUser } = useUser();
  const { addNotification } = useNotification();

  const addTipCard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!tipCard.trim()) {
      addNotification({
        type: "error",
        message: "Please enter a tip card value",
        duration: 3000,
      });
      return;
    }

    const updateData = {
      tipCard: tipCard.trim(),
    };

    setLoading(true);
    try {
      const response = await fetch(`${baseApi}/user/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update account");
      }

      const updatedUser: User = await response.json();
      
      if (user) {
        const newUserData = {
          ...user,
          ...updatedUser,
          id: user.id,
        };
        setUser(newUserData);
        
        onSuccess?.();
      }

      closeFunc(false);
      addNotification({
        type: "success",
        message: "Tip card added successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        message: "Failed to add tip card",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-black">
        <Modal
          bgColor="bg-modal-black"
          closeFunc={closeFunc}
          position="center"
          height="h-auto"
          width="w-[80%] md:w-[55%] lg:w-[420px]"
        >
          <form className="text-black" onSubmit={(e) => e.preventDefault()}>
            <div className="">
              <p className="mb-1.5 font-semibold">Tip Card</p>
              <input
                type="text"
                value={tipCard}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none"
                onChange={(e) => setTipCard(e.target.value)}
                placeholder="Enter tip card details"
              />
            </div>
            
            <button
              className="w-full mt-2 bg-blue-700 text-white rounded-md p-2.5 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={addTipCard}
              disabled={loading}
            >
              {loading ? "Processing..." : "Send"}
            </button>
          </form>
        </Modal>
      </div>
      {loading && <Loader closeFunc={setLoading} />}
    </>
  );
};

export default TipCardModal;
