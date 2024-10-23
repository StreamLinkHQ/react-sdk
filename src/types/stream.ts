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

export type GenerateTokenParams = {
  audioDeviceId: string;
  audioEnabled: boolean;
  username: string;
  videoDeviceId: string;
  videoEnabled: boolean;
};

type PollData = {
  title: string;
  // Add other poll-specific fields
};

type QAData = {
  title: string;
  // Add other Q&A-specific fields
};

type CustomData = {
  title: string;
  // Add other custom-specific fields
};

export type AddonState = {
  type: "Custom";
  isActive: boolean;
  data?: CustomData;
} | {
  type: "Q&A";
  isActive: boolean;
  data?: QAData;
} | {
  type: "Poll";
  isActive: boolean;
  data?: PollData;
};

export type ActiveAddons = Record<string, AddonState>;