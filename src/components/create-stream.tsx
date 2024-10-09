import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { baseApi } from "../utils";
import { ActionType } from "../types";
import { useNotification } from "../hooks";
import ShareModal from "./share-link-modal";
import { Loader } from "./base";

type AgendaItem = {
  time: number;
  actionType: ActionType;
  action: string | PollAction;
};

type PollAction = {
  title: string;
  options: string[];
};

const actionTypes: ActionType[] = [
  "Poll",
  "Transaction",
  "Giveaway",
  "Q&A",
  "Custom",
];

const transactionTypes = ["Send NFT", "Send Token"];

const LiveStreamForm = () => {
  const { publicKey } = useWallet();
  const { addNotification } = useNotification();
  const [selectedDate, setSelectedDate] = useState<string>();
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [streamType, setStreamType] = useState<"instant" | "scheduled">(
    "instant"
  );
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState<AgendaItem>({
    time: 0,
    actionType: "Poll",
    action: "",
  });
  const [pollTitle, setPollTitle] = useState<string>("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [streamName, setStreamName] = useState<string>("");

  const handleAddAgendaItem = () => {
    if (!newAgendaItem.actionType) {
      addNotification({
        type: "error",
        message: "Please select an action type.",
        duration: 3000,
      });
      return;
    }

    if (agendaItems.some((item) => item.time === newAgendaItem.time)) {
      addNotification({
        type: "error",
        message:
          "An agenda item with this time already exists. Please choose a different time.",
        duration: 3000,
      });
      return;
    }

    let actionDetails: string | PollAction;
    if (newAgendaItem.actionType === "Poll") {
      actionDetails = {
        title: pollTitle,
        options: pollOptions.filter((option) => option.trim() !== ""),
      };
      if (actionDetails.options.length < 2) {
        addNotification({
          type: "error",
          message: "A poll must have at least two non-empty options.",
          duration: 3000,
        });
        return;
      }
    } else {
      actionDetails = newAgendaItem.action as string;
      if (!actionDetails.trim()) {
        addNotification({
          type: "error",
          message: "Please provide action details.",
          duration: 3000,
        });
        return;
      }
    }

    setAgendaItems([
      ...agendaItems,
      { ...newAgendaItem, action: actionDetails },
    ]);
    setNewAgendaItem({ time: 0, actionType: "Poll", action: "" });
    setPollTitle("");
    setPollOptions(["", ""]);
  };

  const handleRemoveAgendaItem = (index: number) => {
    const updatedAgendaItems = agendaItems.filter((_, i) => i !== index);
    setAgendaItems(updatedAgendaItems);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const renderActionInput = () => {
    switch (newAgendaItem.actionType) {
      case "Poll":
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={pollTitle}
              onChange={(e) => setPollTitle(e.target.value)}
              placeholder="Poll Title"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...pollOptions];
                    newOptions[index] = e.target.value;
                    setPollOptions(newOptions);
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {pollOptions.length > 2 && (
                  <button
                    onClick={() => handleRemovePollOption(index)}
                    className="p-2 text-red-500"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setPollOptions([...pollOptions, ""])}
              className="w-full p-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Add Option
            </button>
          </div>
        );
      case "Transaction":
      case "Giveaway":
        return (
          <select
            onChange={(e) =>
              setNewAgendaItem({ ...newAgendaItem, action: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select type</option>
            {transactionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        );
      case "Q&A":
      case "Custom":
        return (
          <input
            type="text"
            value={newAgendaItem.action as string}
            onChange={(e) =>
              setNewAgendaItem({ ...newAgendaItem, action: e.target.value })
            }
            placeholder="Enter details"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );
      default:
        return null;
    }
  };

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
      console.log(streamData);
      setShowModal(true)
      setStreamName(streamData.name);
      addNotification({
        type: "success",
        message: "Streamlink created!",
        duration: 3000,
      });

      setNewAgendaItem({ time: 0, actionType: "Poll", action: "" });
      setPollTitle("");
      setPollOptions(["", ""]);
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
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md border mt-5">
        <h1 className="text-2xl font-bold mb-6">Create Streamlink</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Stream Type</h2>
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
            <h2 className="text-lg font-semibold mb-2">Select Date</h2>
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
          <h2 className="text-lg font-semibold mb-2">Call Type</h2>
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

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Agenda Items</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                Time (minutes)
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={newAgendaItem.time}
                  onChange={(e) =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      time: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </label>
              <div className="text-center">{newAgendaItem.time} minutes</div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {actionTypes.map((actionType) => (
                <button
                  key={actionType}
                  onClick={() =>
                    setNewAgendaItem({
                      ...newAgendaItem,
                      actionType,
                      action: "",
                    })
                  }
                  className={`p-2 rounded-md ${
                    newAgendaItem.actionType === actionType
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-800"
                  } hover:opacity-90 transition-opacity`}
                >
                  {actionType}
                </button>
              ))}
            </div>
            {renderActionInput()}
            <button
              onClick={handleAddAgendaItem}
              className="w-full p-2 bg-gray-800 text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Add Item
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {agendaItems.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
              >
                <span>
                  {item.time} min - {item.actionType}:
                  {item.actionType === "Poll"
                    ? ` ${(item.action as PollAction).title} (${
                        (item.action as PollAction).options.length
                      } options)`
                    : ` ${item.action}`}
                </span>
                <button
                  onClick={() => handleRemoveAgendaItem(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

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

export default LiveStreamForm;
