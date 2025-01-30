import { useCallReactions } from "../hooks";

type ReactionOverlayProps = {
  roomName: string;
  sender: string;
  showReactions: boolean;
};

const ReactionOverlay = ({
  roomName,
  sender,
  showReactions,
}: ReactionOverlayProps) => {
  const { reactions, sendReaction } = useCallReactions({ roomName });

  return (
    <div className="absolute top-0 left-0 w-full h-full z-[100] pointer-events-none">
      {reactions.map((r, index) => (
        <div
          key={index}
          className="absolute text-3xl animate-fade-up flex flex-row-reverse items-center"
          style={{
            top: `${Math.random() * 50}px`,
            left: `${Math.random() * 90}vw`,
            animationDelay: `${index * 0.3}s`,
            pointerEvents: "none",
          }}
        >
          {r.reaction}
          <p className="text-base">
            {sender === r.sender ? " (You)" : r.sender}
          </p>
        </div>
      ))}

      <div
        className={`fixed bottom-14 left-1/4 transform -translate-x-1/2 flex gap-4 pointer-events-auto ${
          showReactions ? "block" : "hidden"
        }`}
      >
        {["❤️", "😂", "👏", "👍", "🎉", "🔥"].map((emoji) => (
          <button
            key={emoji}
            className="px-2.5 py-1 text-xl bg-[#444444] rounded-md shadow cursor-pointer"
            onClick={() => sendReaction(emoji, sender)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionOverlay;
