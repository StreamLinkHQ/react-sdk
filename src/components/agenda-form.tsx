import { useState } from "react";
import { UnSavedAgendaItem, PollAction, ActionType } from "../types";
import { useNotification } from "../hooks";

type AgendaFormProps = {
  newAgendaItem: UnSavedAgendaItem;
  setNewAgendaItem: (val: UnSavedAgendaItem) => void;
  agendaItems: UnSavedAgendaItem[];
  setAgendaItems: (val: UnSavedAgendaItem[]) => void;
  setSelectedTimes?: React.Dispatch<React.SetStateAction<Set<number>>>;
  selectedTimes?: Set<number>;
};

const transactionTypes = ["Send NFT", "Send Token"];

const actionTypes: ActionType[] = [
  "Poll",
  "Transaction",
  "Giveaway",
  "Q&A",
  "Custom",
];

const AgendaForm = ({
  newAgendaItem,
  setNewAgendaItem,
  agendaItems,
  setAgendaItems,
  selectedTimes,
  setSelectedTimes
}: AgendaFormProps) => {
  const [pollTitle, setPollTitle] = useState<string>("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const { addNotification } = useNotification();

  const addSelectedTime = (time: number) => {
    setSelectedTimes?.((prev) => {
      const newSet = new Set(prev);
      newSet.add(time*60);
      return newSet;
    });
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };
  const handleAddAgendaItem = () => {
    if (!newAgendaItem.actionType) {
      addNotification({
        type: "error",
        message: "Please select an action type.",
        duration: 3000,
      });
      return;
    }

    if (selectedTimes?.has(newAgendaItem.time)) {
      addNotification({
        type: "error",
        message:
          "An agenda item with this time already exists. Please choose a different time.",
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
    addSelectedTime(newAgendaItem.time);
    setNewAgendaItem({ time: 0, actionType: "Poll", action: "" });
    setPollTitle("");
    setPollOptions(["", ""]);
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
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
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
          />
        );
      default:
        return null;
    }
  };

  const handleRemoveAgendaItem = (index: number, item: UnSavedAgendaItem) => {
    const updatedAgendaItems = agendaItems.filter((_, i) => i !== index);
    setAgendaItems(updatedAgendaItems);
    if(selectedTimes) {
      setSelectedTimes?.((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.time);
        return newSet;
      });
    }
  };

  return (
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
              className={`p-2 rounded-md text-sm truncate lg:text-base ${
                newAgendaItem.actionType === actionType
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-800"
              } hover:opacity-90 transition-opacity`}
            >
              {actionType}
            </button>
          ))}
        </div>
        <p className="block md:hidden lg:hidden text-center font-bold">{newAgendaItem.actionType}</p>
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
              onClick={() => handleRemoveAgendaItem(index, item)}
              className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgendaForm;
