import { TrackToggle, DisconnectButton, GridLayout, ParticipantTile, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { MdCallEnd } from "react-icons/md";
import { BsAppIndicator } from "react-icons/bs";
import { TfiAgenda } from "react-icons/tfi";
import { UserType } from "../types";

type CallControlsProps = {
  userType: UserType;
  callType: string;
  setShowAgendaModal: (val: boolean) => void;
  setToken: (val: string | undefined) => void;
};
const CallControls = ({
  userType,
  callType,
  setShowAgendaModal,
  setToken,
}: CallControlsProps) => {
  return (
    <div className="flex lg:w-[80%] mx-auto justify-between items-center absolute bottom-0 left-4">
      {userType === "host" && (
        <div className="flex items-center ">
          <div
            className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white"
            onClick={() => setShowAgendaModal(true)}
          >
            <TfiAgenda />
          </div>
          <TrackToggle
            source={Track.Source.Microphone}
            style={{ margin: "10px" }}
          />
          {callType === "video" && <TrackToggle source={Track.Source.Camera} />}
        </div>
      )}
      {userType === "guest" && (
        <div className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white">
          <BsAppIndicator />
        </div>
      )}
      <DisconnectButton onClick={() => setToken(undefined)}>
        <MdCallEnd className="text-xl text-white" />
      </DisconnectButton>
    </div>
  );
};

export default CallControls;


export function UserView() {
    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
      ],
      { onlySubscribed: false }
    );
    return (
      <GridLayout
        tracks={tracks}
        style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
        // className="h-full"
      >
        <ParticipantTile />
      </GridLayout>
    );
  }