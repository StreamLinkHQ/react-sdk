import { useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { baseApi } from "../utils/index";

export const useHandleStreamDisconnect = (
  publicKey: string,
  roomName: string
) => {
  const leaveStream = useCallback(async () => {
    try {
      const response = await fetch(`${baseApi}/participant/${roomName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          liveStreamId: roomName,
          leftAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error(error);
    }
  }, [publicKey, roomName]);

  useEffect(() => {
    const handlePageLeave = async (event: BeforeUnloadEvent | Event) => {
      if (event.type === "beforeunload") {
        event.preventDefault();
      }

      await leaveStream();
    };

    window.addEventListener("beforeunload", handlePageLeave);
    window.addEventListener("unload", handlePageLeave);
    window.addEventListener("load", handlePageLeave);

    const socket: Socket = io(`${baseApi}`);
    socket.on("userDisconnected", leaveStream);

    return () => {
      window.removeEventListener("beforeunload", handlePageLeave);
      window.removeEventListener("unload", handlePageLeave);
      window.removeEventListener("load", handlePageLeave);
      socket.off("userDisconnected", leaveStream);
    };
  }, [leaveStream]);

  return { leaveStream };
};
