// import { useTracks, GridLayout, TrackRefContext, VideoTrack, TrackReference, AudioTrack } from "@livekit/components-react";
// import { Track } from "livekit-client";
// import { FaUser } from "react-icons/fa";

// export default function UserView() {
//     const tracks = useTracks(
//       [
//         { source: Track.Source.Camera, withPlaceholder: true },
//         { source: Track.Source.ScreenShare, withPlaceholder: false },
//       ],
//       { onlySubscribed: false }
//     );
  
//     return (
//       <GridLayout
//         tracks={tracks}
//         style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
//       >
//         <TrackRefContext.Consumer>
//           {(track) => {
//             if (!track?.participant) return null;
//             const metadata = track.participant.metadata
//               ? JSON.parse(track.participant.metadata)
//               : {};
  
//             const isGuestUser = metadata.userType === "guest";
//             const shouldShowVideo =
//               track.publication?.isSubscribed &&
//               track.publication?.isEnabled &&
//               track.source === Track.Source.Camera;
//             return (
//               <div className="relative w-full h-full">
//                 {!shouldShowVideo ? (
//                   <div className="flex flex-col items-center gap-2">
//                     <FaUser className="w-24 h-24 text-gray-400" />
//                     <div className="text-gray-400 text-sm">
//                       {isGuestUser ? "Guest User" : "Camera Off"}
//                     </div>
//                   </div>
//                 ) : (
//                   <VideoTrack trackRef={track as TrackReference} />
//                 )}
//                 <AudioTrack trackRef={track as TrackReference} />
//                 <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white">
//                   {metadata.userName || track.participant.identity}
//                 </div>
//               </div>
//             );
//           }}
//         </TrackRefContext.Consumer>
//       </GridLayout>
//     );
//   }

import {
  useTracks,
  GridLayout,
  TrackRefContext,
  VideoTrack,
  TrackReference,
  AudioTrack,
  useRoomContext,
} from "@livekit/components-react";
import { Track, RoomEvent, Participant } from "livekit-client";
import { FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function UserView() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const room = useRoomContext();
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  useEffect(() => {
    const handleActiveSpeakerChange = (speakers: Participant[]) => {
      if (speakers.length > 0) {
        setActiveSpeaker(speakers[0].identity); // Set the first active speaker
      } else {
        setActiveSpeaker(null);
      }
    };

    room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange);

    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange);
    };
  }, [room]);

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <TrackRefContext.Consumer>
        {(track) => {
          if (!track?.participant) return null;

          const metadata = track.participant.metadata
            ? JSON.parse(track.participant.metadata)
            : {};
          const isGuestUser = metadata.userType === "guest";

          const shouldShowVideo =
            track.publication?.isSubscribed &&
            track.publication?.isEnabled &&
            track.source === Track.Source.Camera;

          const isActive = track.participant.identity === activeSpeaker;

          return (
            <div
              className={`relative w-full h-full rounded-xl p-1 ${
                isActive ? "border-4 border-green-500 shadow-lg" : ""
              }`}
            >
              {!shouldShowVideo ? (
                <div className="flex flex-col items-center gap-2">
                  <FaUser className="w-24 h-24 text-gray-400" />
                  <div className="text-gray-400 text-sm">
                    {isGuestUser ? "Guest User" : "Camera Off"}
                  </div>
                </div>
              ) : (
                <VideoTrack trackRef={track as TrackReference} />
              )}
              <AudioTrack trackRef={track as TrackReference} />
              <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white">
                {metadata.userName || track.participant.identity}
              </div>
            </div>
          );
        }}
      </TrackRefContext.Consumer>
    </GridLayout>
  );
}
