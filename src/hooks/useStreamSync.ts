import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { StreamAgenda } from "../types/index";

interface InitialSyncData {
  currentTime: number;
  executedActions: string[];
  joinTime: number;
}

export const useStreamSync = (
  token: string | undefined,
  socket: Socket | null,
  roomName: string,
  identity: string | undefined,
  agendas: StreamAgenda[],
  handleAction: (item: StreamAgenda) => string
) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [joinTime, setJoinTime] = useState<number | null>(null);
  const [executedActions, setExecutedActions] = useState<Set<string>>(
    new Set()
  );
  const [initialSyncComplete, setInitialSyncComplete] = useState(false);

  // Socket connection and time sync effect
  useEffect(() => {
    if (!token || !socket || !identity) return;

    socket.emit("joinRoom", roomName, identity);

    const handleInitialSync = ({
      currentTime: serverTime,
      executedActions: serverActions,
      joinTime: serverJoinTime,
    }: InitialSyncData) => {
      setCurrentTime(serverTime);
      setExecutedActions(new Set(serverActions));
      setJoinTime(serverJoinTime);
      setInitialSyncComplete(true);
    };

    const handleTimeSync = (serverTime: number) => {
      setCurrentTime(serverTime);
    };

    const handleActionSync = (actionId: string) => {
      setExecutedActions((prev) => new Set([...prev, actionId]));
    };

    socket.on("initialSync", handleInitialSync);
    socket.on("timeSync", handleTimeSync);
    socket.on("actionExecutedSync", handleActionSync);

    return () => {
      socket.off("initialSync", handleInitialSync);
      socket.off("timeSync", handleTimeSync);
      socket.off("actionExecutedSync", handleActionSync);
    };
  }, [token, socket, roomName, identity]);

  // Agenda execution effect
  useEffect(() => {
    if (!token || !socket || !initialSyncComplete || joinTime === null) return;

    agendas.forEach((item: StreamAgenda) => {
      const shouldExecute =
        item.timeStamp <= currentTime &&
        !executedActions.has(item.id) &&
        (item.timeStamp > joinTime ||
          (item === agendas[0] && currentTime - joinTime < 5));

      if (shouldExecute) {
        handleAction(item);
        setExecutedActions((prev) => new Set([...prev, item.id]));
        socket.emit("actionExecuted", { roomName, actionId: item.id });
      }
    });
  }, [
    currentTime,
    agendas,
    executedActions,
    token,
    handleAction,
    socket,
    roomName,
    joinTime,
    initialSyncComplete,
  ]);

  return {
    currentTime,
  };
};
