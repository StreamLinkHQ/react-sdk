import { useState, useEffect } from "react";
import { QActionType, StreamAgenda } from "../types/index";
import { baseApi } from "../utils/index";

export const useStreamData = (roomName: string) => {
  const [agendas, setAgendas] = useState<StreamAgenda[]>([]);
  const [callType, setCallType] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseApi}/livestream/${roomName}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const streamData = await response.json();
        if (Array.isArray(streamData.agenda)) {
          const updatedAgenda = streamData.agenda.map(
            (agenda: StreamAgenda) => ({
              ...agenda,
              action:
                (agenda.action as QActionType) === "Q_A"
                  ? "Q&A"
                  : agenda.action,
            })
          );
          setAgendas(updatedAgenda);
        }
        if (streamData.callType) {
          setCallType(streamData.callType);
        }
      } catch (error) {
        console.error("Failed to fetch stream data:", error);
      }
    };

    fetchData();
  }, [roomName]);

  return { agendas, setAgendas, callType };
};
