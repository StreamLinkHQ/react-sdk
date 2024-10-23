import { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";

export const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(url);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  return socket;
};
