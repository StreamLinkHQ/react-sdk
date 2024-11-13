import { useState, useEffect } from "react";
import { useTipCard } from "../hooks";
import { Participant } from "../types";

type TipCardProps = {
  userName: string;
  isMention?: boolean;
  userWallet: string;
};

const TipCard = ({ userName, userWallet, isMention = false }: TipCardProps) => {
  const [showTipCard, setShowTipCard] = useState(false);
  const {
    loading: isLoading,
    error: hasError,
    tipCardUrl,
  } = useTipCard(userWallet);

  // Reset loading state when the card is shown
  useEffect(() => {
    if (!showTipCard) {
      return;
    }
  }, [showTipCard]);

  const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isMention) {
      return (
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => setShowTipCard(!showTipCard)}
          onMouseEnter={() => setShowTipCard(true)}
          onMouseLeave={() => setShowTipCard(false)}
        >
          @{children}
        </span>
      );
    }
    return (
      <span
        className="font-bold text-sm cursor-pointer"
        onMouseEnter={() => setShowTipCard(true)}
        onMouseLeave={() => setShowTipCard(false)}
      >
        {children}
      </span>
    );
  };

  return (
    <span className="relative inline-block">
      <ContentWrapper>{userName}</ContentWrapper>

      {showTipCard && (
        <div className="absolute z-50 left-0 mt-2">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
            </div>
          )}

          {hasError && (
            <div className="bg-gray-900 text-white p-4 rounded-lg">
              Failed to load tip card
            </div>
          )}

          <div className="relative">
            {isMention && (
              <button
                onClick={() => setShowTipCard(false)}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-700 focus:outline-none z-10"
              >
                ×
              </button>
            )}
            {tipCardUrl && (
              <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={tipCardUrl}
                className="w-[200px] h-[450px] md:w-[280px] lg:w-[300px] lg:h-[400px] border-0 rounded-lg shadow-lg bg-transparent"
                title={`Tip Card for ${userName}`}
              />
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
};

export default TipCard;

type ParseMessageProps = {
  text: string;
  participants: Participant[];
};
// eslint-disable-next-line react-refresh/only-export-components
export const parseMessage = ({ text, participants }: ParseMessageProps) => {
  const parts = text.split(/(@\w+)/g);

  const findParticipant = (username: string): Participant | undefined => {
    return participants.find(
      (p) =>
        p.userName.toLowerCase() === username.toLowerCase() ||
        p.id.toLowerCase() === username.toLowerCase()
    );
  };

  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      const username = part.slice(1);
      const participant = findParticipant(username);

      return (
        <span key={index} className="inline-block">
          <TipCard
            userName={username}
            userWallet={participant?.walletAddress ?? ""}
            isMention={true}
          />
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};
