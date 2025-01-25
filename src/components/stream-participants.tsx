import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LuUsers, LuChevronUp, LuChevronDown } from "react-icons/lu";
import { Dropdown } from "./base";
import { useParticipantList, useNotification, useClickOutside } from "../hooks";
import { Participant, UserType, DropdownOption } from "../types";
import { SendModal } from "./modals";
import { baseApi } from "../utils";

type StreamParticipantsProps = {
  roomName: string;
  userType: UserType;
};

const StreamParticipants = ({
  roomName,
  userType,
}: StreamParticipantsProps) => {
  const { participants, count, isLoading, refetch } = useParticipantList({
    roomName,
  });
  const { publicKey } = useWallet();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<Participant | null>(null);

  const componentRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotification();

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
  const makeTempHost = async (participantId: string, walletAddress: string) => {
    try {
      const response = await fetch(`${baseApi}/participant/make-host`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId, roomName, walletAddress }),
      });

      if (!response.ok) {
        console.error("Failed to invite guest:", await response.text());
        addNotification({
          type: "error",
          message: "Failed to invite guest",
          duration: 3000,
        });
      } else {
        addNotification({
          type: "success",
          message: "User made host successfully!",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error inviting guest:", error);
    }
  };

  const makeGuest = async (participantId: string, walletAddress: string) => {
    try {
      const response = await fetch(`${baseApi}/participant/make-guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId, roomName, walletAddress }),
      });

      if (!response.ok) {
        console.error("Failed to invite guest:", await response.text());
        addNotification({
          type: "error",
          message: "Failed to invite guest",
          duration: 3000,
        });
      } else {
        addNotification({
          type: "success",
          message: "User made guest successfully!",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error inviting guest:", error);
    }
  }

  const getDropdownOptions = (
    user: Participant,
    userType: string
  ): DropdownOption[] => {
    const baseOptions: DropdownOption[] = [
      {
        label: "Send token",
        action: () => handleAction(user, "token"),
      },
    ];

    const hostOptions: DropdownOption[] =
      userType === "host"
        ? [
            {
              label: user.userType === "temp-host" ? "Return to Guest" : "Make Host",
              action: () => user.userType === "temp-host"? makeGuest(user.userName, user.walletAddress) :  makeTempHost(user.userName, user.walletAddress),
            },
          ]
        : [];

    return [...baseOptions, ...hostOptions];
  };

  const sortedParticipants = useMemo(() => {
    if (!publicKey) return participants;

    const currentUser = participants.find(
      (p) => p.walletAddress === publicKey.toString()
    );
    const otherParticipants = participants.filter(
      (p) => p.walletAddress !== publicKey.toString()
    );

    return currentUser ? [currentUser, ...otherParticipants] : participants;
  }, [participants, publicKey]);
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
              {sortedParticipants.map((user) => {
                const isCurrentUser =
                  user.walletAddress === publicKey?.toString();

                return (
                  <li
                    key={user.id}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>{user.userName}</span>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            you
                          </span>
                        )}
                      </div>
                      {!isCurrentUser && (
                        <Dropdown
                          options={getDropdownOptions(user, userType)}
                          isOpen={openDropdownId === user.id}
                          toggleDropdown={() => toggleDropdown(user.id)}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      {isModalOpen && (
        <SendModal selectedUser={selectedUser} closeFunc={setIsModalOpen} />
      )}
    </>
  );
};

export default StreamParticipants;
