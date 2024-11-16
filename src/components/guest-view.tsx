import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import { AgendaDetails } from "../types";
import { baseApi } from "../utils";

type VoteCounts = {
  [answer: string]: number;
};

export const PollContent = ({ details }: { details: AgendaDetails }) => {
  const [answer, setAnswer] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});
  const { publicKey } = useWallet();

  const fetchVoteCounts = useCallback(async () => {
    try {
      const response = await fetch(
        `${baseApi}/poll/${details.agendaId}`
      );
      if (response.ok) {
        const data = await response.json();
        setVoteCounts(data.voteCounts);
      }
    } catch (error) {
      console.error("Failed to fetch vote counts:", error);
    }
  }, [details.agendaId]);
  
  useEffect(() => {
    // Check if user has already voted
    const checkUserVote = async () => {
      if (!publicKey) return;

      try {
        const response = await fetch(
          `${baseApi}/poll/${details.agendaId}/user-vote/${publicKey}`,
          {
            headers: {
             "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.vote) {
            setHasVoted(true);
            fetchVoteCounts(); // Fetch current vote counts if user has voted
          }
        }
      } catch (error) {
        console.error("Failed to check user vote:", error);
      }
    };

    checkUserVote();
  }, [publicKey, details.agendaId, fetchVoteCounts]);


  const onVote = async (selectedOption: string) => {
    if (!publicKey) return;

    const data = {
      agendaId: details.agendaId,
      response: selectedOption,
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
        throw new Error("Voting failed");
      }

      await fetchVoteCounts();
      return true;
    } catch (error) {
      console.error("Voting failed:", error);
      throw error;
    }
  };

  const handleVote = async () => {
    if (!answer || !onVote) return;

    setIsVoting(true);
    try {
      await onVote(answer);
      setHasVoted(true);
    } catch (error) {
      console.error("Voting failed:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = Object.values(voteCounts).reduce(
    (sum, count) => sum + count,
    0
  );

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
        disabled={!answer || isVoting || !publicKey}
        className={`mt-4 w-full p-2 rounded text-white transition-colors ${
          answer && !isVoting && publicKey
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {!publicKey
          ? "Connect Wallet to Vote"
          : isVoting
          ? "Voting..."
          : "Submit Vote"}
      </button>
    </div>
  );
};
