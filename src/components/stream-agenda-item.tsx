import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { StreamAgenda } from "../types";
import { formatTime } from "../utils";
import { Dropdown, Modal } from "./base";
import EditAgenda from "./edit-stream-agenda";

type StreamAgendaItemProps = {
  selectedAction: StreamAgenda;
  handleActionEdit: (val: StreamAgenda) => void;
  handleActionDelete: (val: string) => void;
  toggleDropdown: () => void;
  isDropdownOpen: boolean;
  currentTime: number;
};

const StreamAgendaItem = ({
  selectedAction,
  handleActionEdit,
  handleActionDelete,
  toggleDropdown,
  isDropdownOpen,
  currentTime,
}: StreamAgendaItemProps) => {
  const [isEditingAgenda, setIsEditingAgenda] = useState<boolean>(false);

  const handleEdit = () => {
    setIsEditingAgenda(true);
  };

  const dropdownOptions = selectedAction
    ? [
        {
          label: "Edit",
          action: () => handleEdit(),
          icon: <FaEdit className="mr-2" />,
        },
        {
          label: "Delete",
          action: () => handleActionDelete(selectedAction.id),
          icon: <FaTrash className="mr-2" />,
        },
      ]
    : [];

  return (
    <>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">{selectedAction.action}</h3>
          {currentTime < selectedAction.timeStamp && (
            <Dropdown
              options={dropdownOptions}
              isOpen={isDropdownOpen}
              toggleDropdown={toggleDropdown}
            />
          )}
        </div>
        <p>Item: {selectedAction.details.item}</p>
        <p>Time: {formatTime(selectedAction.timeStamp)}</p>
      </div>
      {isEditingAgenda && (
        <Modal
          bgColor="bg-modal-black"
          closeFunc={setIsEditingAgenda}
          position="center"
          height="h-auto"
          width="w-[40%]"
        >
          <EditAgenda
            agenda={selectedAction}
            closeFunc={setIsEditingAgenda}
            onSubmit={handleActionEdit}
          />
        </Modal>
      )}
    </>
  );
};

export default StreamAgendaItem;
