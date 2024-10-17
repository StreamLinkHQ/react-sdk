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
  leftAt?: number;
  userType: UserType;
};

export type UnSavedAgendaItem = {
  time: number;
  actionType: ActionType;
  action: string | PollAction;
};

export type PollAction = {
  title: string;
  options: string[];
};

export type Recipient = {
  publicKey: string;
  amount: number;
}