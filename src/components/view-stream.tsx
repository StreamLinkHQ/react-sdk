import { useState, useCallback, useEffect } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import {
  useSocket,
  useStreamToken,
  useStreamData,
  useStreamAddons,
  useNotification,
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
  const { token, setToken, generateToken } = useStreamToken(roomName, userType);
  const { agendas, setAgendas, callType } = useStreamData(roomName);
  const socket = useSocket("http://localhost:8001");
  const { activeAddons } = useStreamAddons(socket);

  const { addNotification, removeNotification, updateNotification } =
    useNotification();

  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [executedActions, setExecutedActions] = useState<Set<string>>(
    new Set()
  );
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([]);

  const handleGuestRequests = useCallback((newRequests: GuestRequest[]) => {
    setGuestRequests(newRequests);
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
      userType,
      updateNotification,
      toastComponents,
      onTransactionStart,
      onPollStart,
      onCustomAction,
      socket,
    ]
  );

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const newTime = prevTime + 1;
        return newTime >= 3600 ? 0 : newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    agendas.forEach((item: StreamAgenda) => {
      if (item.timeStamp <= currentTime && !executedActions.has(item.id)) {
        handleAction(item);
        setExecutedActions((prev) => new Set(prev).add(item.id));
      }
    });
  }, [currentTime, agendas, executedActions, token, handleAction]);

  if (!token) {
    return <PreJoinView onSubmit={generateToken} />;
  }

  return (
    <>
      <LiveKitRoom
        video={callType === "video"}
        audio={true}
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
          showChatModal={showChatModal}
          onShowChat={setShowChatModal}
          onShowAddonModal={() => setShowAddonModal(true)}
          setGuestRequests={handleGuestRequests}
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
          <RequestCard request={request} userType={userType} roomName={roomName} key={i}/>
        ))}
      </div>
    </>
  );
};

export default ViewStream;
