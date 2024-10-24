import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { AgendaDetails } from "../types";
import { baseApi } from "../utils";

type VoteCounts = {
  [answer: string]: number;
};

export const PollContent = ({ details }: { details: AgendaDetails }) => {
  const [answer, setAnswer] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { publicKey } = useWallet();
  // Mock vote counts - in real app, this would be fetched from backend
  const [voteCounts, setVoteCounts] = useState<VoteCounts>(() => {
    const counts: VoteCounts = {};
    details.wallets.forEach((wallet) => {
      counts[wallet] = Math.floor(Math.random() * 10); // Mock data
    });
    return counts;
  });

  const totalVotes = Object.values(voteCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const onVote = async (answer: string) => {
    console.log(answer);

    const data = {
      agendaId: details.id,
      response: answer,
      respondent: publicKey?.toString(),
    };
    try {
      const response = await fetch(`${baseApi}/poll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleVote = async () => {
    if (!answer || !onVote) return;

    setIsVoting(true);
    try {
      await onVote(answer);
      // Update local vote counts
      setVoteCounts((prev) => ({
        ...prev,
        [answer]: (prev[answer] || 0) + 1,
      }));
      setHasVoted(true);
    } catch (error) {
      console.error("Voting failed:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  if (hasVoted) {
    return (
      <div className="p-4">
        <h4 className="font-medium mb-4">{details.item}</h4>
        <div className="space-y-3">
          {details.wallets.map((wallet) => {
            const voteCount = voteCounts[wallet] || 0;
            const percentage = getPercentage(voteCount);

            return (
              <div key={wallet} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{wallet}</span>
                  <span>
                    {voteCount} votes ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-sm text-gray-500 text-center">
          Total votes: {totalVotes}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h4 className="font-medium mb-2">{details.item}</h4>
      <div className="space-y-2">
        {details.wallets.map((option) => (
          <button
            key={option}
            onClick={() => setAnswer(option)}
            className={`w-full p-3 rounded border transition-colors ${
              answer === option
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        onClick={handleVote}
        disabled={!answer || isVoting}
        className={`mt-4 w-full p-2 rounded text-white transition-colors ${
          answer && !isVoting
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isVoting ? "Voting..." : "Submit Vote"}
      </button>
    </div>
  );
};
