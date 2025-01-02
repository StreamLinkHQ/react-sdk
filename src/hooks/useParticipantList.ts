import { useState, useEffect, useCallback } from "react";
import { baseApi } from "../utils/index";
import { Participant } from "../types/index";

interface UseParticipantListProps {
  roomName: string;
  refreshInterval?: number;
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
  refreshInterval = 2000,
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
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [roomName]);

  useEffect(() => {
    fetchParticipants();

    const intervalId = setInterval(fetchParticipants, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchParticipants, refreshInterval]);

  return {
    participants,
    count: participants.length,
    isLoading,
    error,
    refetch: fetchParticipants,
  };
};
