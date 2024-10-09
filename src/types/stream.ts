export type ActionType = "Poll" | "Transaction" | "Giveaway" | "Q&A" | "Custom";

export type UserType = "host" | "guest"

export type StreamAgenda = {
  action: ActionType;
  details: {
    agendaId: string;
    id: number;
    item: string;
    wallets: string[];
  };
  id: string;
  liveStreamId: string;
  timeStamp: number;
};

export type Participant = {
  id: string;
  userName: string;
  walletAddress: string;
  userType: UserType;
};
