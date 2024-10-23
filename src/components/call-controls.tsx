import {
  TrackToggle,
  DisconnectButton,
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Track } from "livekit-client";
import { MdCallEnd, MdFrontHand } from "react-icons/md";
import { BsAppIndicator, BsWechat } from "react-icons/bs";
import { TfiAgenda } from "react-icons/tfi";
import { UserType } from "../types";
import { baseApi } from "../utils";
import { Tooltip } from "./base";

type CallControlsProps = {
  userType: UserType;
  callType: string;
  roomName: string;
  setShowAgendaModal: (val: boolean) => void;
  setShowChatModal: (val: boolean) => void;
  setToken: (val: string | undefined) => void;
};

const CallControls = ({
  userType,
  callType,
  setShowAgendaModal,
  setToken,
  setShowChatModal,
  roomName,
}: CallControlsProps) => {
  const { publicKey } = useWallet();

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
  return (
    <div className="flex w-[90%] lg:w-[80%] mx-auto justify-between items-center absolute bottom-2 left-4">
      <div
        className={`flex items-center justify-between ${
          userType === "host" ? "w-[80%] lg:w-[28%]" : "w-[50%] lg:w-[18%]"
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
              <div className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white">
                <BsAppIndicator />
              </div>
            </Tooltip>
            <Tooltip content="Raise to speak">
              <div className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white">
                <MdFrontHand />
              </div>
            </Tooltip>
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
