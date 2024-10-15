import { useState, useRef, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LuUsers, LuChevronUp, LuChevronDown } from "react-icons/lu";
import { useClickOutside } from "../hooks/useClickOutside";
import { Dropdown } from "./base";
import { useParticipantList } from "../hooks";
import { Participant } from "../types";
import SendModal from "./send-modal";

type StreamParticipantsProps = {
  roomName: string;
};

const StreamParticipants = ({ roomName }: StreamParticipantsProps) => {
  const { participants, count, isLoading, refetch } = useParticipantList({
    roomName,
  });
  const { publicKey } = useWallet();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<Participant | null>(null);

  const componentRef = useRef<HTMLDivElement>(null);

  useClickOutside(componentRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
      setOpenDropdownId(null);
    }
  });

  const handleRefetch = useCallback(() => {
    if (!isLoading) {
      refetch();
    }
  }, [isLoading, refetch]);

  useEffect(() => {
    handleRefetch();

    const intervalId = setInterval(handleRefetch, 30000);

    return () => clearInterval(intervalId);
  }, [handleRefetch]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      handleRefetch();
    }
  };

  const toggleDropdown = (userId: string) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
    handleRefetch();
  };

  const handleAction = (user: Participant, action: "token" | "nft") => {
    setSelectedUser(user);
    if (action === "token") {
      setIsModalOpen(true);
    } else {
      console.log(`Sending NFT to user ${user.walletAddress}`);
    }
    handleRefetch();
  };

  const getDropdownOptions = (user: Participant) => [
    {
      label: "Send token",
      action: () => handleAction(user, "token"),
    },
    {
      label: "Send NFT",
      action: () => handleAction(user, "nft"),
    },
  ];

  return (
    <>
      <div
        className="absolute top-5 z-50 left-4"
        ref={componentRef}
        onMouseEnter={handleRefetch}
      >
        <button
          onClick={toggleExpand}
          className="flex items-center space-x-2 bg-white text-black px-1.5 py-1 rounded-md transition-colors"
        >
          <LuUsers className="text-lg" />
          <span>{count}</span>
          {isExpanded ? (
            <LuChevronUp className="text-lg" />
          ) : (
            <LuChevronDown className="text-lg" />
          )}
        </button>
        {isExpanded && participants.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 text-black lg:h-auto overflow-y-auto">
            <ul className="py-2">
              {participants.map((user) => (
                <li key={user.id} className="px-4 py-2 hover:bg-gray-100">
                  <div className="flex justify-between items-center">
                    <span>{user.userName}</span>
                    {publicKey?.toString() !== user.walletAddress && (
                      <Dropdown
                        options={getDropdownOptions(user)}
                        isOpen={openDropdownId === user.id}
                        toggleDropdown={() => toggleDropdown(user.id)}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {isModalOpen && (
       <SendModal selectedUser={selectedUser} closeFunc={setIsModalOpen}/>
      )}
    </>
  );
};

export default StreamParticipants;
