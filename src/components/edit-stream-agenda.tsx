import { useState, useEffect } from "react";
import { BsTrash3Fill } from "react-icons/bs";
import { StreamAgenda, ActionType } from "../types";
import { useNotification } from "../hooks";

type EditAgendaProps = {
  agenda: StreamAgenda;
  onSubmit: (updatedAgenda: StreamAgenda) => void;
  closeFunc: (val: boolean) => void;
};

const EditAgenda = ({ agenda, onSubmit, closeFunc }: EditAgendaProps) => {
  const [agendaState, setAgendaState] = useState<
    Record<ActionType, { item: string; wallets?: string[] }>
  >({
    Poll: {
      item: agenda.details.item || "",
      wallets: agenda.details.wallets || [],
    },
    Transaction: { item: agenda.details.item || "" },
    Giveaway: { item: agenda.details.item || "" },
    Custom: { item: agenda.details.item || "" },
    "Q&A": { item: agenda.details.item || "" },
  });

  const [actionType, setActionType] = useState<ActionType>(
    agenda.action as ActionType
  );
  const [item, setItem] = useState<string>(agenda.details.item || "");
  const [wallets, setWallets] = useState<string[]>(
    agenda.details.wallets || []
  );
  const { addNotification } = useNotification();

  useEffect(() => {
    setActionType(agenda.action as ActionType);
    setItem(agenda.details.item || "");
    setWallets(agenda.details.wallets || []);
  }, [agenda]);

  const handleAddPollOption = () => {
    setWallets([...wallets, ""]);
  };

  const removePollOption = (index: number) => {
    if (wallets.length > 2) {
      const updatedWallets = wallets.filter((_, i) => i !== index);
      setWallets(updatedWallets);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const updatedWallets = [...wallets];
    updatedWallets[index] = value;
    setWallets(updatedWallets);
    setAgendaState((prevState) => ({
      ...prevState,
      Poll: { ...prevState.Poll, wallets: updatedWallets },
    }));
  };

  const handleActionTypeChange = (newActionType: ActionType) => {
    setAgendaState((prevState) => ({
      ...prevState,
      [actionType]: { item, wallets: actionType === "Poll" ? wallets : [] },
    }));

    setActionType(newActionType);

    if (newActionType === "Giveaway" || newActionType === "Transaction") {
      setItem("send NFT");
    } else {
      setItem(agendaState[newActionType]?.item || "");
    }

    setWallets(newActionType === "Poll" ? agendaState.Poll.wallets || [] : []);
  };

  const handleSubmit = () => {
    if (actionType === "Poll" && wallets.length === 0) {
      addNotification({
        type: "error",
        message: "Poll options are required.",
        duration: 3000,
      });
      return;
    }

    const updatedAgenda: StreamAgenda = {
      id: agenda.id,
      liveStreamId: agenda.liveStreamId,
      timeStamp: agenda.timeStamp,
      action: actionType,
      details: {
        agendaId: agenda.details.agendaId,
        id: agenda.details.id,
        item: item.trim(),
        wallets: actionType === "Poll" ? wallets : [],
      },
    };

    onSubmit(updatedAgenda);
    closeFunc(false);
  };

  const renderInputFields = () => {
    switch (actionType) {
      case "Poll":
        return (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Enter poll question"
              className="input-field w-full p-2 border rounded"
            />
            {wallets.map((option, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    handlePollOptionChange(index, e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  className="input-field w-full p-2 border rounded"
                />
                {wallets.length > 2 && (
                  <button
                    onClick={() => removePollOption(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <BsTrash3Fill className="text-red-600" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddPollOption}
              className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
            >
              Add Option
            </button>
          </div>
        );
      case "Transaction":
      case "Giveaway":
        return (
          <select
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full p-2 border rounded mt-4"
          >
            <option value="send NFT">Send NFT</option>
            <option value="send Token">Send Token</option>
          </select>
        );
      case "Custom":
      case "Q&A":
        return (
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder={
              actionType === "Custom"
                ? "Enter custom action"
                : "Enter Q&A question"
            }
            className="w-full p-2 border rounded mt-4"
          />
        );
      default:
        return null;
    }
  };

  const agendaTypes = ["Poll", "Transaction", "Giveaway", "Custom", "Q&A"];

  return (
    <>
      <div className="p-6 max-w-lg mx-auto bg-white rounded shadow-md border">
        <h3 className="text-xl font-bold mb-4 text-center">Edit Agenda</h3>
        <div className="flex space-x-3 mb-4 max-w-full">
          {agendaTypes.map((agendaType, i) => (
            <button
              key={i}
              onClick={() => handleActionTypeChange(agendaType as ActionType)}
              className={`p-2 rounded text-sm truncate lg:text-base ${
                actionType === agendaType
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {agendaType}
            </button>
          ))}
        </div>
        <p className="block md:hidden lg:hidden text-center font-bold">{actionType}</p>
        {renderInputFields()}

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => closeFunc(false)}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update
          </button>
        </div>
      </div>
    </>
  );
};

export default EditAgenda;
