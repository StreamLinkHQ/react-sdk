import { useEffect, useState } from "react";
import {
  RoomAudioRenderer,
  useChat,
  ParticipantContext,
  useLocalParticipant,
} from "@livekit/components-react";
import StreamParticipants from "./stream-participants";
import CallControls from "./call-controls";
import UserView from "./user-view";
import { ChatModal, TipCardModal } from "./modals";
import { GuestRequest, UserType } from "../types";
import { useParticipantList, useUser } from "../hooks";

type StreamViewProps = {
  callType: string;
  userType: UserType;
  roomName: string;
  onShowAgenda: () => void;
  onShowAddonModal: () => void;
  onTokenChange: (token: string | undefined) => void;
  setGuestRequests: (val: GuestRequest[]) => void;
  setIdentity: (val: string) => void;
};

const StreamView = ({
  callType,
  userType,
  roomName,
  onShowAgenda,
  onTokenChange,
  onShowAddonModal,
  setGuestRequests,
  setIdentity,
}: StreamViewProps) => {
  const { chatMessages } = useChat();
  const p = useLocalParticipant();
  const { participants } = useParticipantList({ roomName });
  const [showTipCardModal, setShowTipCardModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const { user } = useUser();
  const [shouldShowTipIcon, setShouldShowTipIcon] = useState(!user?.tipCard);

  useEffect(() => {
    setShouldShowTipIcon(!user?.tipCard);
  }, [user?.tipCard]);

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
        setShowChatModal={setShowChatModal}
        setShowTipModal={setShowTipCardModal}
        setShowAddonModal={onShowAddonModal}
        setGuestRequests={setGuestRequests}
        setIdentity={setIdentity}
        showTipCardIcon={shouldShowTipIcon}
      />
      {showChatModal && (
        <ChatModal
          closeFunc={setShowChatModal}
          chatMessages={chatMessages}
          participants={participants}
        />
      )}
      {showTipCardModal && (
        <TipCardModal
          closeFunc={setShowTipCardModal}
          onSuccess={() => {
            setShouldShowTipIcon(false);
          }}
        />
      )}
    </ParticipantContext.Provider>
  );
};

export default StreamView;
