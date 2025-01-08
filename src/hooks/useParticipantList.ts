import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Participant } from "../types/index";
import { baseApi } from "../utils/index";

interface UseParticipantListProps {
  roomName: string;
}

interface UseParticipantListReturn {
  participants: Participant[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useParticipantList = ({
  roomName,
}: UseParticipantListProps): UseParticipantListReturn => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseApi}/participant/${roomName}`);
      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }
      const data: { participants: Participant[] } = await response.json();
      const activeParticipants = data.participants.filter(
        (participant) => !participant.leftAt
      );
      setParticipants(activeParticipants);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [roomName]);

  useEffect(() => {
    fetchParticipants();

    // Establish WebSocket connection
    const socket: Socket = io(`${baseApi}`);

    // Join the room
    socket.emit("joinRoom", roomName);

    // Listen for participant updates
    socket.on("participantJoined", (data: Participant) => {
      setParticipants((prev) => [...prev, data]);
    });

    socket.on("participantLeft", ({ participantId }: { participantId: string }) => {
      setParticipants((prev) =>
        prev.filter((participant) => participant.id !== participantId)
      );
    });

    return () => {
      socket.disconnect(); // Clean up on component unmount
    };
  }, [fetchParticipants, roomName]);

  return {
    participants,
    count: participants.length,
    isLoading,
    error,
    refetch: fetchParticipants,
  };
};