import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { baseApi } from "../utils";
import { UnSavedAgendaItem, PollAction } from "../types";
import { useNotification } from "../hooks";
import { ShareModal } from "./modals";
import { Loader } from "./base";
import AgendaForm from "./agenda-form";

const CreateStreamForm = () => {
  const { publicKey } = useWallet();
  const { addNotification } = useNotification();
  const [selectedDate, setSelectedDate] = useState<string>();
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [streamType, setStreamType] = useState<"instant" | "scheduled">(
    "instant"
  );
  const [agendaItems, setAgendaItems] = useState<UnSavedAgendaItem[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState<UnSavedAgendaItem>({
    time: 0,
    actionType: "Poll",
    action: "",
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [streamName, setStreamName] = useState<string>("");

  const createStreamLink = async () => {
    if (
      agendaItems.length === 0 ||
      (streamType === "scheduled" && !selectedDate)
    ) {
      addNotification({
        type: "error",
        message: "Please, add an agenda and select a date",
        duration: 3000,
      });
      return;
    }

    if (!publicKey) {
      addNotification({
        type: "error",
        message: "Please, connect your wallet",
        duration: 3000,
      });
      return;
    }
    const data = {
      callType,
      scheduledFor: selectedDate,
      wallet: publicKey,
      agendas: agendaItems.map((item) => {
        const isPoll =
          item.actionType === "Poll" && typeof item.action !== "string";
        return {
          timeStamp: item.time * 60,
          action: item.actionType,
          details: {
            item: isPoll ? (item.action as PollAction).title : item.action,
            wallets: isPoll ? (item.action as PollAction).options : [],
          },
        };
      }),
    };
    setLoading(true);
    try {
      const response = await fetch(`${baseApi}/livestream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const streamData = await response.json();
      setShowModal(true);
      setStreamName(streamData.name);
      addNotification({
        type: "success",
        message: "Streamlink created!",
        duration: 3000,
      });

      setNewAgendaItem({ time: 0, actionType: "Poll", action: "" });
      setAgendaItems([]);
    } catch (error) {
      console.error(error);
      addNotification({
        type: "error",
        message: "Failed to create streamlink",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-[90%] md:w-[80%] lg:w-[80%] max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md border mt-5">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Streamlink</h1>

        <div className="mb-6">
          <p className="text-lg font-semibold mb-2">Stream Type</p>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="instant"
                checked={streamType === "instant"}
                onChange={() => setStreamType("instant")}
                className="mr-2"
              />
              <span>Instant</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="scheduled"
                checked={streamType === "scheduled"}
                onChange={() => setStreamType("scheduled")}
                className="mr-2"
              />
              <span>Scheduled</span>
            </label>
          </div>
        </div>

        {streamType === "scheduled" && (
          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">Select Date</p>
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div className="mb-6">
          <p className="text-lg font-semibold mb-2">Call Type</p>
          <div className="flex space-x-4">
            <button
              onClick={() => setCallType("video")}
              className={`px-4 py-2 rounded-md ${
                callType === "video"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-800"
              } hover:opacity-90 transition-opacity`}
            >
              Video
            </button>
            <button
              onClick={() => setCallType("audio")}
              className={`px-4 py-2 rounded-md ${
                callType === "audio"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-800"
              } hover:opacity-90 transition-opacity`}
            >
              Audio
            </button>
          </div>
        </div>

        <AgendaForm
          newAgendaItem={newAgendaItem}
          setNewAgendaItem={setNewAgendaItem}
          agendaItems={agendaItems}
          setAgendaItems={setAgendaItems}
        />

        <button
          onClick={createStreamLink}
          className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Streamlink
        </button>
      </div>
      {showModal && (
        <ShareModal streamName={streamName} closeFunc={setShowModal} />
      )}
      {loading && <Loader closeFunc={setLoading} />}
    </>
  );
};

export default CreateStreamForm;
