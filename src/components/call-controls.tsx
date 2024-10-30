import { useEffect, useState } from "react";
import {
  TrackToggle,
  DisconnectButton,
  useLocalParticipant,
  useTracks,
  GridLayout,
  ParticipantTile,
} from "@livekit/components-react";
import { MdCallEnd, MdFrontHand } from "react-icons/md";
import { BsAppIndicator, BsWechat } from "react-icons/bs";
import { TfiAgenda } from "react-icons/tfi";
import { useWallet } from "@solana/wallet-adapter-react";
import { Track } from "livekit-client";
import { UserType } from "../types";
import { baseApi } from "../utils";
import { Tooltip } from "./base";
import { useSocket } from "../hooks";

type CallControlsProps = {
  userType: UserType;
  callType: string;
  roomName: string;
  setShowAgendaModal: (val: boolean) => void;
  setShowChatModal: (val: boolean) => void;
  setShowAddonModal: (val: boolean) => void;
  setToken: (val: string | undefined) => void;
};

const CallControls = ({
  userType,
  callType,
  setShowAgendaModal,
  setToken,
  setShowChatModal,
  setShowAddonModal,
  roomName,
}: CallControlsProps) => {
  const { publicKey } = useWallet();
  const [isInvited, setIsInvited] = useState(false); // State to track invitation status
  const socket = useSocket("http://localhost:8001");
  const p = useLocalParticipant();

  // Listen for "inviteGuest" event to enable controls for invited guests
  useEffect(() => {
    if (socket) {
      socket.on("inviteGuest", (data: { participantId: string }) => {
        if (data.participantId === p.localParticipant?.identity) {
          setIsInvited(true);
        }
      });

      return () => {
        socket.off("inviteGuest");
      };
    }
  }, [socket, p.localParticipant?.identity]);

  const leaveStream = async () => {
    setToken(undefined);
    const data = {
      walletAddress: publicKey,
      liveStreamId: roomName,
      leftAt: new Date(),
    };
    try {
      const response = await fetch(`${baseApi}/participant/${roomName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const request = () => {
    if (socket) {
      socket.emit("requestToSpeak", {
        participantId: p.localParticipant?.identity,
        name: p.localParticipant?.identity,
      });
    } else {
      console.warn("Socket not initialized yet");
    }
  };

  return (
    <div className="flex w-[90%] lg:w-[80%] mx-auto justify-between items-center absolute bottom-2 left-4">
      <div
        className={`flex items-center justify-between ${
          userType === "host" ? "w-[80%] lg:w-[28%]" : isInvited ? "w-[80%] lg:w-[28%]" : "w-[50%] lg:w-[18%]"
        }`}
      >
        {userType === "host" && (
          <>
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
            <Tooltip content="Video">
              {callType === "video" && (
                <TrackToggle source={Track.Source.Camera} />
              )}
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
            <Tooltip content="Raise to speak">
              <div
                className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
                onClick={request}
              >
                <MdFrontHand />
              </div>
            </Tooltip>
            {isInvited && (
              <>
                <Tooltip content="Mic">
                  <TrackToggle source={Track.Source.Microphone} />
                </Tooltip>
                <Tooltip content="Video">
                  {callType === "video" && (
                    <TrackToggle source={Track.Source.Camera} />
                  )}
                </Tooltip>
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
      </div>

      <DisconnectButton onClick={leaveStream}>
        <MdCallEnd className="text-xl text-white" />
      </DisconnectButton>
    </div>
  );
};

export default CallControls;


export function UserView() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
      // className="h-full"
    >
      <ParticipantTile />
    </GridLayout>
  );
}
