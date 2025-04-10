import { useState } from "react";
import { useChat, ReceivedChatMessage } from "@livekit/components-react";
import { TbSend2 } from "react-icons/tb";
import { Modal } from "../base";
import TipCard, { parseMessage } from "../tip-card";
import { Participant } from "../../types";

type ChatModalProps = {
  closeFunc: (val: boolean) => void;
  chatMessages: ReceivedChatMessage[];
  participants: Participant[];
};

const ChatModal = ({ closeFunc, chatMessages, participants }: ChatModalProps) => {
  const { send } = useChat();
  const [message, setMessage] = useState<string>("");

  // Helper function to find participant by identity
  const findParticipant = (identity: string | undefined): Participant | undefined => {
    if (!identity) return undefined;
    return participants.find(p => p.userName === identity || p.id === identity);
  };

  const sendMessage = () => {
    if (message.trim()) {
      send(message);
      setMessage("");
    }
  };

  return (
    <div className="text-black">
      <Modal
        bgColor="bg-modal-black"
        closeFunc={closeFunc}
        position="right"
        width="w-2/3 md:w-1/2 lg:w-1/4"
      >
        <div className="">
          <div className="overflow-y-scroll h-[520px] lg:h-[550px]">
          {chatMessages.map((chat, i) => {
            const participant = findParticipant(chat.from?.identity);
            
            return (
              <div key={i} className="mb-1">
                <TipCard 
                  userName={chat.from?.identity ?? "Unknown"}
                  userWallet={participant?.walletAddress ?? ""}
                />
                <p className="text-sm"> {parseMessage({ 
                    text: chat.message,
                    participants 
                  })}</p>
              </div>
            );
          })}
          </div>


          <div className="absolute bottom-2 border border-black rounded-full w-[82%] lg:w-[88%] p-2 flex flex-row items-center justify-between">
            <input
              type="text"
              className="focus:outline-none bg-white w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage}>
              <TbSend2 className="text-xl" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatModal;
