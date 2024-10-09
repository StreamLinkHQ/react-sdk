import { Modal } from "./base";
import Timeline from "./timeline";
import { StreamAgenda } from "../types";
import { baseApi } from "../utils";
import { useNotification } from "../hooks";

type AgendaModalProps = {
  closeFunc: (val: boolean) => void;
  agendas: StreamAgenda[];
  setAgendas: (val: StreamAgenda[]) => void;
  currentTime: number;
};

const AgendaModal = ({
  closeFunc,
  agendas,
  setAgendas,
  currentTime,
}: AgendaModalProps) => {
  const { addNotification } = useNotification();

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

  return (
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
      />
    </Modal>
  );
};

export default AgendaModal;

//   const handleActionMove = (id: string, newTimestamp: number) => {
//     console.log({newTimestamp})
//     const updatedAgendas = agendas.map((action) =>
//         action.id === id ? { ...action, timeStamp: newTimestamp } : action
//       );
//       setAgendas(updatedAgendas);
//   };
