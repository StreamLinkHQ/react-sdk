import { useEffect, useState } from "react";
import {
  TrackToggle,
  DisconnectButton,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import {
  MdCallEnd,
  MdFrontHand,
  MdOutlineAddReaction,
  MdAddReaction,
} from "react-icons/md";
import { BsAppIndicator, BsWechat, BsGiftFill } from "react-icons/bs";
import { TfiAgenda } from "react-icons/tfi";
import { LiaUserCheckSolid } from "react-icons/lia";
import { useWallet } from "@solana/wallet-adapter-react";
import { Track } from "livekit-client";
import { GuestRequest, UserType } from "../types";
import {
  useNotification,
  useSocket,
  useHandleStreamDisconnect,
  useDownloadParticipants,
} from "../hooks";
import { Tooltip } from "./base";
import { baseApi } from "../utils";
import CameraToggle from "./camera-toggle";

type CallControlsProps = {
  userType: UserType;
  callType: string;
  roomName: string;
  setGuestRequests: (val: GuestRequest[]) => void;
  setShowAgendaModal: (val: boolean) => void;
  setShowChatModal: (val: boolean) => void;
  setShowAddonModal: (val: boolean) => void;
  setShowTipModal: (val: boolean) => void;
  showTipCardIcon: boolean;
  setToken: (val: string | undefined) => void;
  setIdentity: (val: string) => void;
  showReactions: boolean;
  setShowReactions: (val: boolean) => void;
};

const CallControls = ({
  userType,
  callType,
  setShowAgendaModal,
  setToken,
  setShowChatModal,
  setShowAddonModal,
  roomName,
  setShowTipModal,
  setGuestRequests,
  setIdentity,
  showTipCardIcon,
  showReactions,
  setShowReactions,
}: CallControlsProps) => {
  const { publicKey } = useWallet();
  const [isInvited, setIsInvited] = useState<boolean>(false);
  const [hasPendingRequest, setHasPendingRequest] = useState<boolean>(false);
  // const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const { downloadParticipants } = useDownloadParticipants({
    roomName,
  });

  const { addNotification } = useNotification();

  const socket = useSocket(`${baseApi}`);

  const p = useLocalParticipant();

  const { leaveStream } = useHandleStreamDisconnect(
    publicKey?.toString() ?? "",
    roomName
  );

  const room = useRoomContext();

  useEffect(() => {
    if (socket && p.localParticipant?.identity) {
      setIdentity(p.localParticipant.identity);

      socket.emit("joinRoom", roomName, p.localParticipant.identity);

      socket.on(
        "inviteGuest",
        (data: { participantId: string; roomName: string }) => {
          if (data.participantId === p.localParticipant?.identity) {
            setIsInvited(true);
            setHasPendingRequest(false);
            addNotification({
              type: "success",
              message: "You have been invited!",
              duration: 3000,
            });
          }
        }
      );

      socket.on(
        "returnToGuest",
        (data: { participantId: string; roomName: string }) => {
          if (data.participantId === p.localParticipant?.identity) {
            setIsInvited(false);
            setHasPendingRequest(false);
            addNotification({
              type: "success",
              message: "You have been returned to the audience!",
              duration: 3000,
            });
          }
        }
      );

      socket.on("guestRequestsUpdate", (requests: GuestRequest[]) => {
        setGuestRequests(requests);

        const hasRequest = requests.some(
          (request) => request.participantId === p.localParticipant?.identity
        );
        setHasPendingRequest(hasRequest);
      });

      socket.on("newToken", async ({ token }) => {
        if (!room) {
          console.warn("LiveKit room is not available");
          return;
        }

        try {
          console.log("Disconnecting LiveKit...");
          await room.disconnect();

          console.log("Reconnecting with new token...");
          await room.connect("wss://streamlink-vtdavgse.livekit.cloud", token);

          console.log("Successfully reconnected to LiveKit!");
        } catch (error) {
          console.error("Error reconnecting to LiveKit:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });

      return () => {
        socket.off("inviteGuest");
        socket.off("guestRequestsUpdate");
        socket.off("newToken");
        socket.off("disconnect");
      };
    }
  }, [
    socket,
    p.localParticipant?.identity,
    roomName,
    setGuestRequests,
    addNotification,
    setIdentity,
    setToken,
    room,
  ]);

  const request = () => {
    if (socket) {
      socket.emit("requestToSpeak", {
        participantId: p.localParticipant?.identity,
        name: p.localParticipant?.identity,
        roomName,
        walletAddress: publicKey?.toString() ?? "",
      });
      setHasPendingRequest(true);
    } else {
      console.warn("Socket not initialized yet");
    }
  };

  const handleDisconnectClick = async () => {
    setToken(undefined);
    await leaveStream();
  };

  return (
    <div className="flex w-[90%] lg:w-[80%] mx-auto justify-between items-center absolute bottom-2 left-4">
      <div
        className={`flex items-center justify-between ${
          userType === "host"
            ? "w-[80%] lg:w-[32%]"
            : isInvited
            ? "w-[80%] lg:w-[30%]"
            : "w-[62%] lg:w-[18%]"
        }`}
      >
        {userType === "host" && (
          <>
            {/* <Tooltip content="More">
              <div
                className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white block lg:hidden"
                onClick={() => setIsDropdownOpen(true)}
              >
                <BsThreeDotsVertical />
              </div>
            </Tooltip>
             */}
            <Tooltip content="Agendas">
              <div
                className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
                onClick={() => setShowAgendaModal(true)}
              >
                <TfiAgenda />
              </div>
            </Tooltip>
            <Tooltip content="Mic">
              <TrackToggle source={Track.Source.Microphone} />
            </Tooltip>
            <Tooltip content="Screen">
              <TrackToggle source={Track.Source.ScreenShare} />
            </Tooltip>
            {callType === "video" && (
              <>
                <Tooltip content="Video">
                  <TrackToggle source={Track.Source.Camera} />
                </Tooltip>
                {p.isCameraEnabled && (
                  <Tooltip content="Switch camera">
                    <CameraToggle localParticipant={p.localParticipant} />
                  </Tooltip>
                )}
              </>
            )}
            <Tooltip content="Attendance">
              <div
                className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
                onClick={downloadParticipants}
              >
                <LiaUserCheckSolid />
              </div>
            </Tooltip>
          </>
        )}
        {userType === "guest" && (
          <>
            <Tooltip content="Addon">
              <div
                className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
                onClick={() => setShowAddonModal(true)}
              >
                <BsAppIndicator />
              </div>
            </Tooltip>
            {!hasPendingRequest && !isInvited && (
              <Tooltip content="Raise to speak">
                <div
                  className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
                  onClick={request}
                >
                  <MdFrontHand />
                </div>
              </Tooltip>
            )}
            {isInvited && (
              <>
                <Tooltip content="Mic">
                  <TrackToggle source={Track.Source.Microphone} />
                </Tooltip>

                {callType === "video" && (
                  <Tooltip content="Video">
                    <TrackToggle source={Track.Source.Camera} />
                  </Tooltip>
                )}
              </>
            )}
          </>
        )}
        <Tooltip content="Chat">
          <div
            className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
            onClick={() => setShowChatModal(true)}
          >
            <BsWechat />
          </div>
        </Tooltip>
        <Tooltip content="Reactions">
          <div
            className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
            onClick={() => setShowReactions(!showReactions)}
          >
            {showReactions ? <MdAddReaction /> : <MdOutlineAddReaction />}
          </div>
        </Tooltip>
        {showTipCardIcon && (
          <div className="fixed top-28 z-50">
            <Tooltip content="TipCard">
              <div
                className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
                onClick={() => setShowTipModal(true)}
              >
                <BsGiftFill />
              </div>
            </Tooltip>
          </div>
        )}
      </div>

      <DisconnectButton onClick={handleDisconnectClick}>
        <MdCallEnd className="text-xl text-white" />
      </DisconnectButton>
    </div>
  );
};

export default CallControls;
