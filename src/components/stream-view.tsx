import { RoomAudioRenderer, useChat } from "@livekit/components-react";
import StreamParticipants from "./stream-participants";
import CallControls, { UserView } from "./call-controls";
import { ChatModal } from "./modals";
import { UserType } from "../types";

type StreamViewProps = {
  callType: string;
  userType: UserType;
  roomName: string;
  onShowAgenda: () => void;
  onShowAddonModal: () => void;
  onTokenChange: (token: string | undefined) => void;
  showChatModal: boolean;
  onShowChat: (show: boolean) => void;
};

const StreamView = ({
  callType,
  userType,
  roomName,
  onShowAgenda,
  onTokenChange,
  showChatModal,
  onShowChat,
  onShowAddonModal,
}: StreamViewProps) => {
  const { chatMessages } = useChat();

  return (
    <>
      <StreamParticipants roomName={roomName} userType={userType} />
      <UserView />
      <RoomAudioRenderer />
      <CallControls
        userType={userType}
        callType={callType}
        setShowAgendaModal={onShowAgenda}
        setToken={onTokenChange}
        roomName={roomName}
        setShowChatModal={onShowChat}
        setShowAddonModal={onShowAddonModal}
      />
      {showChatModal && (
        <ChatModal closeFunc={onShowChat} chatMessages={chatMessages} />
      )}
    </>
  );
};

export default StreamView;
