import { GuestRequest, UserType } from "../types";
import { baseApi } from "../utils";
import { useNotification } from "../hooks";

type RequestCardProps = {
  userType: UserType;
  request: GuestRequest;
  roomName: string;
};

const RequestCard = ({ userType, request, roomName }: RequestCardProps) => {
  const { addNotification } = useNotification();
  const inviteGuest = async (participantId: string) => {
    try {
      const response = await fetch(`${baseApi}/livestream/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId, roomName }),
      });

      if (!response.ok) {
        console.error("Failed to invite guest:", await response.text());
        addNotification({
          type: "error",
          message: "Failed to invite guest",
          duration: 3000,
        });
      } else {
        addNotification({
          type: "success",
          message: "Guest invited successfully!",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error inviting guest:", error);
    }
  };

  return (
    <div className="flex flex-row bg-white p-0.5 lg:p-1.5 border rounded-md my-1 justify-between items-center text-[10px] lg:text-base">
      <p>{request.name} has requested to permissions to share video/audio</p>
      {userType === "host" && (
        <button
          onClick={() => inviteGuest(request.participantId)}
          className="border-l-2 border-black p-1 ml-1"
        >
          Invite
        </button>
      )}
    </div>
  );
};

export default RequestCard;
