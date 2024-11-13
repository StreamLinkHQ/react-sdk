import {
  RoomAudioRenderer,
  useChat,
  ParticipantContext,
  useLocalParticipant,
} from "@livekit/components-react";
import StreamParticipants from "./stream-participants";
import CallControls, { UserView } from "./call-controls";
import { ChatModal } from "./modals";
import { GuestRequest, UserType } from "../types";
import { useParticipantList } from "../hooks";

type StreamViewProps = {
  callType: string;
  userType: UserType;
  roomName: string;
  onShowAgenda: () => void;
  onShowAddonModal: () => void;
  onTokenChange: (token: string | undefined) => void;
  showChatModal: boolean;
  onShowChat: (show: boolean) => void;
  setGuestRequests: (val: GuestRequest[]) => void;
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
  setGuestRequests,
}: StreamViewProps) => {
  const { chatMessages } = useChat();
  const p = useLocalParticipant();
  const { participants } = useParticipantList({ roomName });
  return (
    <ParticipantContext.Provider value={p.localParticipant}>
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
        setGuestRequests={setGuestRequests}
      />
      {showChatModal && (
        <ChatModal
          closeFunc={onShowChat}
          chatMessages={chatMessages}
          participants={participants}
        />
      )}
    </ParticipantContext.Provider>
  );
};

export default StreamView;
