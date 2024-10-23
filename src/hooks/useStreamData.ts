import { useState, useEffect } from 'react';
import { StreamAgenda } from "../types";
import { baseApi } from "../utils";

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
          setAgendas(streamData.agenda);
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