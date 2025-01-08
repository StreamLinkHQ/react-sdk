import { useTracks, GridLayout, TrackRefContext, VideoTrack, TrackReference, AudioTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import { FaUser } from "react-icons/fa";

export default function UserView() {
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
            return (
              <div className="relative w-full h-full">
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