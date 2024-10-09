import { useState, useRef } from "react";
import { FaSquarePollHorizontal, FaGift } from "react-icons/fa6";
import { BiTransfer, BiSolidCustomize } from "react-icons/bi";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import { ActionType, StreamAgenda } from "../types";
import { Tooltip } from "./base";
import StreamAgendaItem from "./stream-agenda-item";

type TimelineProps = {
  actions: StreamAgenda[];
  onActionMove: (id: string, newTimestamp: number) => void;
  currentTime: number;
};

const Timeline = ({ actions, onActionMove, currentTime }: TimelineProps) => {
  const [selectedAction, setSelectedAction] = useState<StreamAgenda | null>(
    null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);

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
        return <FaSquarePollHorizontal className="text-blue-500 text-sm lg:text-base" />;
      case "Transaction":
        return <BiTransfer className="text-green-500 text-sm lg:text-base" />;
      case "Giveaway":
        return <FaGift className="text-purple-500 text-sm lg:text-base" />;
      case "Q&A":
        return <BsFillPatchQuestionFill className="text-orange-500 text-sm lg:text-base" />;
      case "Custom":
        return <BiSolidCustomize className="text-red-500 text-sm lg:text-base" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleActionEdit = (id: string) => {
    console.log(`Editing action with id: ${id}`);
    // Implement your edit logic here
  };

  const handleActionDelete = (id: string) => {
    console.log(`Deleting action with id: ${id}`);
    // Implement your delete logic here
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
          />
        )}
      </div>
    </>
  );
};

export default Timeline;
