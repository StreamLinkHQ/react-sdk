import { useState, useRef } from "react";
import { FaSquarePollHorizontal, FaGift } from "react-icons/fa6";
import { BiTransfer, BiSolidCustomize } from "react-icons/bi";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import { ActionType, StreamAgenda } from "../types";
import { Tooltip, Loader } from "./base";
import StreamAgendaItem from "./stream-agenda-item";
import { baseApi, formatTime } from "../utils";
import { useNotification } from "../hooks";

type TimelineProps = {
  actions: StreamAgenda[];
  onActionMove: (id: string, newTimestamp: number) => void;
  currentTime: number;
  setAgendas: (val: StreamAgenda[]) => void;
};

const Timeline = ({
  actions,
  onActionMove,
  currentTime,
  setAgendas,
}: TimelineProps) => {
  const [selectedAction, setSelectedAction] = useState<StreamAgenda | null>(
    null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotification();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text");
    if (!timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const dropPosition = e.clientX - timelineRect.left;
    const newTimestamp = Math.round((dropPosition / timelineRect.width) * 3600);

    onActionMove(id, newTimestamp);
  };

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case "Poll":
        return (
          <FaSquarePollHorizontal className="text-blue-500 text-sm lg:text-base" />
        );
      case "Transaction":
        return <BiTransfer className="text-green-500 text-sm lg:text-base" />;
      case "Giveaway":
        return <FaGift className="text-purple-500 text-sm lg:text-base" />;
      case "Q&A":
        return (
          <BsFillPatchQuestionFill className="text-orange-500 text-sm lg:text-base" />
        );
      case "Custom":
        return (
          <BiSolidCustomize className="text-red-500 text-sm lg:text-base" />
        );
    }
  };



  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleActionEdit = async (updatedAgenda: StreamAgenda) => {
    const {
      id,
      action,
      details: { item, wallets },
    } = updatedAgenda;

    const data = {
      action,
      details: { item, wallets },
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
        throw new Error("Failed to update the agenda");
      }

      const responseData = await response.json();

      const updatedAgendas = actions.map((action) =>
        action.id === id ? responseData : action
      );
      setAgendas(updatedAgendas);
      addNotification({
        type: "success",
        message: "Agenda updated successfully!",
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "There was an error updating the agenda.",
        duration: 3000,
      });
      console.error("Error editing agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionDelete = async (agendaId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseApi}/agenda/${agendaId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      const updatedAgendas = actions.filter((action) => action.id !== agendaId);
      setAgendas(updatedAgendas);
      setSelectedAction(null);
      addNotification({
        type: "success",
        message: `${data.message}`,
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Error deleting agenda",
        duration: 3000,
      });
      console.error("Error deleting agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full p-4">
        <div
          ref={timelineRef}
          className="relative w-full h-8 bg-gray-200 rounded-lg cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div
            className="absolute top-0 w-1 h-full bg-red-500"
            style={{ left: `${(currentTime / 3600) * 100}%` }}
          >
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs">
              {formatTime(currentTime)}
            </div>
          </div>
          {actions.map((action) => (
            <div
              key={action.id}
              className="absolute top-0 -translate-y-1/2"
              style={{ left: `${(action.timeStamp / 3600) * 100}%` }}
            >
              <Tooltip content={action.action}>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, action.id)}
                  className="cursor-move"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAction(action);
                  }}
                >
                  <div className="bg-white rounded-full p-1 shadow-md">
                    {getActionIcon(action.action)}
                  </div>
                </div>
              </Tooltip>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm">{formatTime(currentTime)} / 60:00</div>
        </div>
        {selectedAction && (
          <StreamAgendaItem
            selectedAction={selectedAction}
            handleActionDelete={handleActionDelete}
            handleActionEdit={handleActionEdit}
            toggleDropdown={toggleDropdown}
            isDropdownOpen={isDropdownOpen}
            currentTime={currentTime}
          />
        )}
      </div>
      {loading && <Loader closeFunc={setLoading} />}
    </>
  );
};

export default Timeline;
