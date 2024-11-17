import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { ActiveAddons } from "../types/index";

export const useStreamAddons = (socket: Socket | null) => {
  const [activeAddons, setActiveAddons] = useState<ActiveAddons>({
    Custom: { type: "Custom", isActive: false },
    "Q&A": { type: "Q&A", isActive: false },
    Poll: { type: "Poll", isActive: false },
  });

  useEffect(() => {
    if (!socket) return;

    socket.on("addonState", setActiveAddons);
    socket.on("addonStateUpdate", (update) => {
      setActiveAddons((prev) => ({
        ...prev,
        [update.type]: update,
      }));
    });

    return () => {
      socket.off("addonState");
      socket.off("addonStateUpdate");
    };
  }, [socket]);

  return { activeAddons, setActiveAddons };
};
