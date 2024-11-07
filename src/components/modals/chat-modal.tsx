import { useState } from "react";
import { useChat, ReceivedChatMessage } from "@livekit/components-react";
import { TbSend2 } from "react-icons/tb";
import { Modal } from "../base";

type ChatModalProps = {
  closeFunc: (val: boolean) => void;
  chatMessages: ReceivedChatMessage[];
};

const ChatModal = ({ closeFunc, chatMessages }: ChatModalProps) => {
  const { send } = useChat();
  const [message, setMessage] = useState<string>("");

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
        <div>
          {chatMessages.map((chat, i) => (
            <div key={i} className="mb-1">
              <p className="font-bold text-sm">{chat.from?.identity}</p>
              <p className="text-sm"> {chat.message}</p>
            </div>
          ))}

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
