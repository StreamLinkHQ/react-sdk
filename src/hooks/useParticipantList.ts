import { useState, useEffect, useCallback } from 'react';
import { baseApi } from '../utils';
import { Participant } from '../types';

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
  refreshInterval = 5000
}: UseParticipantListProps): UseParticipantListReturn => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseApi}/participant/${roomName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      const data: { participants: Participant[] } = await response.json();
      setParticipants(data.participants);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    refetch: fetchParticipants
  };
};