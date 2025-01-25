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
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
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
      // console.log("participantJoined event:", data);
      setParticipants((prev) => [...prev, data]);
    });

    socket.on(
      "participantLeft",
      ({ participantId }: { participantId: string }) => {
        setParticipants((prev) =>
          prev.filter((participant) => participant.id !== participantId)
        );
      }
    );

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

export const useDownloadParticipants = ({ roomName }: UseParticipantListProps) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const downloadParticipants = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const response = await fetch(`${baseApi}/participant/${roomName}`);
      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }
      const participants = await response.json();

      // Ensure participants is an array
      const participantsArray = Array.isArray(participants) 
        ? participants 
        : participants.participants || [];

      // Verify we have data
      if (participantsArray.length === 0) {
        throw new Error("No participants found");
      }

      const csvContent = convertToCSV(participantsArray);

      // Use more robust download method
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `participants_${roomName}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const convertToCSV = (data: Participant[]) => {
    if (data.length === 0) return '';

    // Get all unique keys from all objects
    const headers = Array.from(
      new Set(data.flatMap(obj => Object.keys(obj)))
    );

    // Create CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(obj =>
      headers.map(header =>
        `"${String(obj[header as keyof Participant] ?? '').replace(/"/g, '""')}"`
      ).join(',')
      )
    ];

    return csvRows.join('\n');
  };

  return { downloadParticipants, isDownloading, error };
};