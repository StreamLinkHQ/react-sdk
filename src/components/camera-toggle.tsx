import { useState } from "react";
import { LocalParticipant } from "livekit-client";
import { MdCameraswitch } from "react-icons/md";

type CameraToggleProps = {
  localParticipant: LocalParticipant;
  children?: React.ReactNode;
};

const CameraToggle = ({ localParticipant, children }: CameraToggleProps) => {
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const toggleCamera = async () => {
    const cameraTrackPublication = localParticipant.videoTrackPublications
      .values()
      .next().value;

    if (cameraTrackPublication) {
      const currentTrack = cameraTrackPublication.track;
      if (currentTrack) {
        currentTrack.stop();
        localParticipant.unpublishTrack(currentTrack);
      }
    }
    console.log({ facingMode });
    const newFacingMode = facingMode === "user" ? "environment" : "user";

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      // Check if there's a camera available for the new facing mode
      const videoDevice = videoDevices.find((device) =>
        device.label.toLowerCase().includes(newFacingMode)
      );

      if (!videoDevice) {
        console.warn(
          `No ${newFacingMode} camera found. Reverting to current mode.`
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: videoDevice.deviceId, facingMode: newFacingMode },
      });

      const newTrack = stream.getVideoTracks()[0];

      await localParticipant.publishTrack(newTrack);

      setFacingMode(newFacingMode);
      console.log(`Switched to ${newFacingMode} camera`);
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  return (
    <div onClick={toggleCamera} className="flex lg:hidden">
      {children ? (
        children
      ) : (
        <div className="bg-[#444444] py-2.5 px-4 rounded-lg cursor-pointer text-white block">
          <MdCameraswitch />
        </div>
      )}
    </div>
  );
};

export default CameraToggle;
