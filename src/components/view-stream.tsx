import { useState, useCallback } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import {
  useSocket,
  useStreamToken,
  useStreamData,
  useStreamAddons,
  useNotification,
  useStreamSync,
} from "../hooks";
import { PollToast, CustomToast, ActionToast } from "./toasts";
import { AgendaModal, TransactionModal, AddOnModal } from "./modals";
import PreJoinView from "./prejoin-view";
import StreamView from "./stream-view";
import {
  AddNotificationPayload,
  StreamAgenda,
  ToastComponents,
  UserType,
  GuestRequest,
} from "../types";
import RequestCard from "./request-card";
import { baseApi } from "../utils";

type ViewStreamProps = {
  roomName: string;
  userType: UserType;
  toastComponents?: ToastComponents;
  onTransactionStart?: () => void;
  onPollStart?: () => void;
  onCustomAction?: (item: StreamAgenda) => void;
};

const ViewStream = ({
  roomName,
  userType,
  toastComponents,
  onTransactionStart,
  onPollStart,
  onCustomAction,
}: ViewStreamProps) => {
  const [showAgendaModal, setShowAgendaModal] = useState<boolean>(false);
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [showAddonModal, setShowAddonModal] = useState<boolean>(false);
  const [identity, setIdentity] = useState<string>();

  const { token, setToken, generateToken } = useStreamToken(roomName, userType);
  const { agendas, setAgendas, callType } = useStreamData(roomName);
  const socket = useSocket(`${baseApi}`);
  const { activeAddons } = useStreamAddons(socket);
  const { addNotification, removeNotification, updateNotification } =
    useNotification();

  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([]);

  const handleGuestRequests = useCallback((newRequests: GuestRequest[]) => {
    setGuestRequests(newRequests);
  }, []);

  const handleIdentity = useCallback((val: string) => {
    setIdentity(val);
  }, []);

  const handleAction = useCallback(
    (item: StreamAgenda) => {
      const notificationPayload: AddNotificationPayload = {
        type: "custom",
        content: null,
        duration: 5000,
      };

      const id = addNotification(notificationPayload);
      const onClose = () => removeNotification(id);
      const {
        CustomToast: CustomToastOverride,
        ActionToast: ActionToastOverride,
        PollToast: PollToastOverride,
      } = toastComponents || {};
      const startAddon = (type: "Custom" | "Q&A" | "Poll", data?: unknown) => {
        if (socket && userType === "host") {
          socket.emit("startAddon", { type, data });
        }
      };
      const createNotificationContent = (
        onClose: () => void
      ): React.ReactNode => {
        switch (item.action) {
          case "Custom":
          case "Q&A":
            return CustomToastOverride ? (
              <CustomToastOverride
                item={item}
                onClose={onClose}
                onStart={() => {
                  onClose();
                  onCustomAction?.(item);
                }}
                userType={userType}
              />
            ) : (
              <CustomToast
                item={item}
                onClose={onClose}
                userType={userType}
                onStart={() => {
                  onClose();
                  // startAddon(item.action, item);
                }}
              />
            );
          case "Transaction":
          case "Giveaway":
            return ActionToastOverride ? (
              <ActionToastOverride
                item={item}
                onClose={onClose}
                onAction={() => {
                  onClose();
                  onTransactionStart?.();
                }}
                userType={userType}
              />
            ) : (
              <ActionToast
                item={item}
                onClose={onClose}
                onAction={() => {
                  onClose();
                  setShowTransactionModal(true);
                }}
                userType={userType}
              />
            );
          case "Poll":
            return PollToastOverride ? (
              <PollToastOverride
                item={item}
                onClose={onClose}
                onStart={() => {
                  onClose();
                  onPollStart?.();
                }}
                userType={userType}
              />
            ) : (
              <PollToast
                item={item}
                onClose={onClose}
                onStart={() => {
                  onClose();
                  // Default poll start logic
                  startAddon("Poll", item);
                }}
                userType={userType}
              />
            );
          default:
            return (
              <div>
                Unknown action: {item.action}
                <button onClick={onClose}>Close</button>
              </div>
            );
        }
      };

      const updatedContent = createNotificationContent(onClose);
      updateNotification(id, { content: updatedContent });

      return id;
    },
    [
      addNotification,
      removeNotification,
      updateNotification,
      userType,
      toastComponents,
      onTransactionStart,
      onPollStart,
      onCustomAction,
      socket,
    ]
  );

  const { currentTime } = useStreamSync(
    token,
    socket,
    roomName,
    identity,
    agendas,
    handleAction,
  );
  if (!token) {
    return <PreJoinView onSubmit={generateToken} />;
  }
  return (
    <>
      <LiveKitRoom
      //  key={token}
        // video={callType === "video"}
        // screen={true}
        audio={false}
        video={false}
        token={token}
        serverUrl="wss://streamlink-vtdavgse.livekit.cloud"
        data-lk-theme="default"
        className="relative h-screen overflow-x-hidden w-screen"
      >
        <StreamView
          callType={callType}
          userType={userType}
          roomName={roomName}
          onShowAgenda={() => setShowAgendaModal(true)}
          onTokenChange={setToken}
          onShowAddonModal={() => setShowAddonModal(true)}
          setGuestRequests={handleGuestRequests}
          setIdentity={handleIdentity}
        />
      </LiveKitRoom>

      {showAgendaModal && (
        <AgendaModal
          closeFunc={setShowAgendaModal}
          agendas={agendas}
          setAgendas={setAgendas}
          currentTime={currentTime}
          streamId={roomName}
        />
      )}
      {showTransactionModal && (
        <TransactionModal
          closeFunc={setShowTransactionModal}
          roomName={roomName}
        />
      )}
      {showAddonModal && (
        <AddOnModal closeFunc={setShowAddonModal} activeAddons={activeAddons} />
      )}
      <div className="absolute right-10 top-20">
        {guestRequests.map((request, i) => (
          <RequestCard
            request={request}
            userType={userType}
            roomName={roomName}
            key={i}
          />
        ))}
      </div>
    </>
  );
};

export default ViewStream;
