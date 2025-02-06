import { useState, useEffect } from "react";
import { LocalParticipant } from "livekit-client";
import { MdCameraswitch } from "react-icons/md";

type CameraToggleProps = {
  localParticipant: LocalParticipant;
  children?: React.ReactNode;
};

const CameraToggle = ({ localParticipant, children }: CameraToggleProps) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");

      setVideoDevices(cameras);
      if (cameras.length > 0) {
        setCurrentDeviceId(cameras[0].deviceId);
      }
    };

    getDevices();
  }, []);

  const toggleCamera = async () => {
    if (videoDevices.length < 2) {
      console.warn("Not enough cameras to switch");
      return;
    }

    const nextDeviceIndex =
      (videoDevices.findIndex((d) => d.deviceId === currentDeviceId) + 1) %
      videoDevices.length;
    const nextDeviceId = videoDevices[nextDeviceIndex].deviceId;

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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: nextDeviceId },
      });

      const newTrack = stream.getVideoTracks()[0];
      await localParticipant.publishTrack(newTrack);
      setCurrentDeviceId(nextDeviceId);

      console.log(`Switched to camera: ${nextDeviceId}`);
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
