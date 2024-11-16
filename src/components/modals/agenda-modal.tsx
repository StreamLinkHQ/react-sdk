import { useState } from "react";
import { Modal, Loader } from "../base";
import Timeline from "../timeline";
import { StreamAgenda, UnSavedAgendaItem, PollAction, QActionType } from "../../types";
import { baseApi } from "../../utils";
import { useNotification } from "../../hooks";
import AgendaForm from "../agenda-form";

type AgendaModalProps = {
  closeFunc: (val: boolean) => void;
  agendas: StreamAgenda[];
  setAgendas: (val: StreamAgenda[]) => void;
  currentTime: number;
  streamId: string;
};

const AgendaModal = ({
  closeFunc,
  agendas,
  setAgendas,
  currentTime,
  streamId,
}: AgendaModalProps) => {
  const { addNotification } = useNotification();
  const [showAddAgenda, setShowAddAgenda] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [agendaItems, setAgendaItems] = useState<UnSavedAgendaItem[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState<UnSavedAgendaItem>({
    time: 0,
    actionType: "Poll",
    action: "",
  });
  const [selectedTimes, setSelectedTimes] = useState<Set<number>>(
    () => new Set(agendas.map((agenda) => agenda.timeStamp))
  );

  const handleActionMove = async (id: string, newTimestamp: number) => {
    const agendaToUpdate = agendas.find((action) => action.id === id);

    if (!agendaToUpdate) {
      console.error(`Agenda with id ${id} not found.`);
      return;
    }

    const data = {
      action: agendaToUpdate.action,
      timeStamp: newTimestamp,
      details: {
        item: agendaToUpdate.details.item,
        wallets: agendaToUpdate.details.wallets,
      },
    };

    try {
      const response = await fetch(`${baseApi}/agenda/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update backend.");
      }

      const updatedAgendas = agendas.map((action) =>
        action.id === id ? { ...action, timeStamp: newTimestamp } : action
      );
      setAgendas(updatedAgendas);
      addNotification({
        type: "success",
        message: "Agenda updated successfully.",
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Error updating agenda",
        duration: 3000,
      });
      console.error("Error updating agenda:", error);
    }
  };
  const addStreamAgenda = async () => {
    setLoading(true);
    try {
      const data = {
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

      const response = await fetch(`${baseApi}/agenda/${streamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update the agenda");
      }

      const newAgendas = await response.json();
      const updatedAgendas= newAgendas.map((item: StreamAgenda)=> {
        if (item.action as QActionType === "Q_A") {
          return {
            ...item,
            action: "Q&A"
          };
        }
        return item;
      });
      setAgendas([...agendas, ...updatedAgendas]);
      addNotification({
        type: "success",
        message: "Agendas updated successfully.",
        duration: 3000,
      });
      setAgendaItems([]);
    } catch (error) {
      console.error("Error updating agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        bgColor="bg-modal-black"
        closeFunc={closeFunc}
        position="bottom"
        width="w-full"
        height="h-1/3"
      >
        <Timeline
          actions={agendas}
          onActionMove={handleActionMove}
          currentTime={currentTime}
          setAgendas={setAgendas}
        />
        <button
          onClick={() => setShowAddAgenda(true)}
          className={`flex items-center bg-blue-500 text-white px-3 py-2 rounded-md`}
        >
          Add Agenda
        </button>
      </Modal>

      {showAddAgenda && (
        <Modal
          bgColor="bg-modal-black"
          closeFunc={setShowAddAgenda}
          width="w-[88%] md:w-[65%] lg:w-[40%]"
          position="center"
          height="h-auto lg:h-[520px]"
        >
          <div>
            <AgendaForm
              newAgendaItem={newAgendaItem}
              setNewAgendaItem={setNewAgendaItem}
              agendaItems={agendaItems}
              setAgendaItems={setAgendaItems}
              selectedTimes={selectedTimes}
              setSelectedTimes={setSelectedTimes}
            />
            {agendaItems.length > 0 && (
              <button
                className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={addStreamAgenda}
              >
                Save Agenda
              </button>
            )}
          </div>
        </Modal>
      )}
      {loading && <Loader closeFunc={setLoading} />}
    </>
  );
};

export default AgendaModal;
