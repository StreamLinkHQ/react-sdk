import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import StreamParticipants from "./stream-participants";
import CallControls, { UserView } from "./call-controls";
import {ChatModal} from "./modals";
import { UserType } from "../types";

type StreamViewProps = {
  token: string;
  callType: string;
  userType: UserType;
  roomName: string;
  onShowAgenda: () => void;
  onTokenChange: (token: string | undefined) => void;
  showChatModal: boolean;
  onShowChat: (show: boolean) => void;
};

const StreamView = ({
  token,
  callType,
  userType,
  roomName,
  onShowAgenda,
  onTokenChange,
  showChatModal,
  onShowChat, 
}: StreamViewProps) => (
  <LiveKitRoom
    video={callType === "video"}
    audio={true}
    token={token}
    serverUrl="wss://streamlink-vtdavgse.livekit.cloud"
    data-lk-theme="default"
    className="relative h-screen overflow-x-hidden w-screen"
  >
    <StreamParticipants roomName={roomName} userType={userType} />
    <UserView />
    <RoomAudioRenderer />
    <CallControls
      userType={userType}
      callType={callType}
      setShowAgendaModal={onShowAgenda}
      setToken={onTokenChange}
      roomName={roomName}
      setShowChatModal={onShowChat}  // Changed this prop
    />
    {showChatModal && <ChatModal closeFunc={() => onShowChat(false)} />}
  </LiveKitRoom>
);

export default StreamView