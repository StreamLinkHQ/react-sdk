import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { StreamAgenda } from "../types";
import { Dropdown, Loader } from "./base";
import { baseApi } from "../utils";

type StreamAgendaItemProps = {
  selectedAction: StreamAgenda;
  handleActionEdit: (val: string) => void;
  handleActionDelete: (val: string) => void;
  toggleDropdown: () => void;
  isDropdownOpen: boolean;
};

const StreamAgendaItem = ({
  selectedAction,
  handleActionEdit,
  toggleDropdown,
  isDropdownOpen,
}: StreamAgendaItemProps) => {
  const [loading, setLoading] = useState(false);
//   const [isEditingAgenda, setIsEditingAgenda] = useState(false)

  const handleDelete = async (agendaId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseApi}/agenda/${agendaId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Agenda deleted:", data);
      // removeAgendaFromList(agendaId);
    } catch (error) {
      console.error("Error deleting agenda:", error);
    } finally {
      setLoading(false);
    }
  };
  const dropdownOptions = selectedAction
    ? [
        {
          label: "Edit",
          action: () => handleActionEdit(selectedAction.id),
          icon: <FaEdit className="mr-2" />,
        },
        {
          label: "Delete",
          action: () => handleDelete(selectedAction.id),
          icon: <FaTrash className="mr-2" />,
        },
      ]
    : [];

  return (
    <>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">{selectedAction.action}</h3>
          <Dropdown
            options={dropdownOptions}
            isOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
          />
        </div>
        <p>Item: {selectedAction.details.item}</p>
        <p>ID: {selectedAction.id}</p>
        <p>Live Stream ID: {selectedAction.liveStreamId}</p>
      </div>

      {loading && <Loader closeFunc={setLoading} />}
      {/* <Modal bgColor="bg-white" closeFunc={setIsEditingAgenda}>

      </Modal> */}
    </>
  );
};

export default StreamAgendaItem;
