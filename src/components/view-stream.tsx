import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  PreJoin,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { StreamAgenda } from "../types";
import { PollToast, CustomToast, ActionToast } from "./toasts";
import { baseApi } from "../utils";
import AgendaModal from "./agenda-modal";
import { useNotification } from "../hooks";
import { AddNotificationPayload, UserType } from "../types";
import WalletButton from "./wallet-button";
import CallControls, { UserView } from "./call-controls";
import TransactionModal from "./transaction-modal";
import StreamParticipants from "./stream-participants";

type ViewStreamProps = {
  roomName: string;
  userType: UserType;
};

type GenerateTokenParamProps = {
  audioDeviceId: string;
  audioEnabled: boolean;
  username: string;
  videoDeviceId: string;
  videoEnabled: boolean;
};

const serverUrl = "wss://streamlink-vtdavgse.livekit.cloud";

const ViewStream = ({ roomName, userType }: ViewStreamProps) => {
  const { publicKey } = useWallet();
  const [token, setToken] = useState<string | undefined>();
  const [callType, setCallType] = useState<string>("");
  const [agendas, setAgendas] = useState<StreamAgenda[]>([]);
  const [showAgendaModal, setShowAgendaModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { addNotification, removeNotification, updateNotification } =
    useNotification();
  const [executedActions, setExecutedActions] = useState<Set<string>>(
    new Set()
  );
  const [showTransactionModal, setShowTransactionModal] =
    useState<boolean>(false);

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
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseApi}/livestream/${roomName}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const streamData = await response.json();

        if (Array.isArray(streamData.agenda)) {
          setAgendas(streamData.agenda);
        } else {
          console.error("Invalid data format:", streamData);
        }

        if (streamData.callType) {
          setCallType(streamData.callType);
        } else {
          console.error("CallType not found in the response:", streamData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [roomName]);

  const generateToken = async (val: GenerateTokenParamProps) => {
    const { username } = val;
    if (!publicKey) {
      addNotification({
        type: "error",
        message: "Please, connect your wallet",
        duration: 3000,
      });
      return;
    }
    const walletAddress = publicKey.toBase58();
    const data = {
      roomName,
      userType,
      userName: username,
      wallet: walletAddress,
    };

    const response = await fetch(`${baseApi}/livestream/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const tokenRes = await response.json();
    setToken(tokenRes);
  };

  const handleAction = useCallback(
    (item: StreamAgenda) => {
      const notificationPayload: AddNotificationPayload = {
        type: "custom",
        content: null,
        duration: 5000,
      };

      const id = addNotification(notificationPayload);
      const onClose = () => removeNotification(id);
      const createNotificationContent = (
        onClose: () => void
      ): React.ReactNode => {
        switch (item.action) {
          case "Custom":
          case "Q&A":
            return <CustomToast item={item} onClose={onClose} />;
          case "Transaction":
          case "Giveaway":
            return (
              <ActionToast
                item={item}
                onClose={onClose}
                onAction={() => {
                  onClose();
                  // Logic to handle transactions
                  setShowTransactionModal(true);
                }}
                userType={userType}
              />
            );
          case "Poll":
            return (
              <PollToast
                item={item}
                onClose={onClose}
                onStart={() => {
                  onClose();
                  // Logic to start the poll
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
    [addNotification, removeNotification, userType, updateNotification]
  );

  useEffect(() => {
    if (!token) return;

    agendas.forEach((item: StreamAgenda) => {
      if (item.timeStamp <= currentTime && !executedActions.has(item.id)) {
        handleAction(item);
        setExecutedActions((prev) => new Set(prev).add(item.id));
      }
    });
  }, [currentTime, agendas, executedActions, token, handleAction]);

  return (
    <>
      {!token ? (
        <>
          <WalletButton />
          <PreJoin onSubmit={generateToken} />
        </>
      ) : (
        <LiveKitRoom
          video={callType === "video" ? true : false}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          data-lk-theme="default"
          // style={{ height: "100vh" }}
          className="relative h-screen"
        >
          <StreamParticipants roomName={roomName} />
          <UserView />
          <RoomAudioRenderer />
          <CallControls
            userType={userType}
            callType={callType}
            setShowAgendaModal={setShowAgendaModal}
            setToken={setToken}
          />
        </LiveKitRoom>
      )}
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
    </>
  );
};

export default ViewStream;
