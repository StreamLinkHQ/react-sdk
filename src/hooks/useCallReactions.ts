import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";
import { baseApi } from "../utils/index";

interface UseCallReactionsProps {
  roomName: string;
}

export const useCallReactions = ({
  roomName,
}: UseCallReactionsProps) => {
  const socket = useSocket(`${baseApi}`);
  const [reactions, setReactions] = useState<
    { reaction: string; sender: string }[]
  >([]);

  useEffect(() => {
    if (socket) {
      socket.emit("joinRoom", roomName);

      socket.on("receiveReaction", (reactionData) => {
        setReactions((prev) => [...prev, reactionData]);

        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r !== reactionData));
        }, 3000);
      });
      return () => {
        socket.off("receiveReaction");
      };
    }
  }, [roomName, socket]);

  const sendReaction = (reaction: string, sender: string) => {
    if (socket) {
      socket.emit("sendReaction", { roomName, reaction, sender });
    }
  };

  return { reactions, sendReaction };
};
