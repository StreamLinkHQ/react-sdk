export type ActionType =
  | "Poll"
  | "Transaction"
  | "Giveaway"
  | "Q&A"
  | "Custom"
  | "Q_A";

export type UserType = "host" | "guest";

export type AgendaDetails = {
  agendaId: string;
  id: number;
  item: string;
  wallets: string[];
};

export type StreamAgenda = {
  action: ActionType;
  details: AgendaDetails;
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
};

export type GenerateTokenParams = {
  audioDeviceId: string;
  audioEnabled: boolean;
  username: string;
  videoDeviceId: string;
  videoEnabled: boolean;
};

type PollData = {
  title: string;
  details: AgendaDetails;
  // Add other poll-specific fields
};

type QAData = {
  title: string;
  details: AgendaDetails;
  // Add other Q&A-specific fields
};

type CustomData = {
  title: string;
  details: AgendaDetails;
  // Add other custom-specific fields
};

export type AddonState =
  | {
      type: "Custom";
      isActive: boolean;
      data?: CustomData;
    }
  | {
      type: "Q&A";
      isActive: boolean;
      data?: QAData;
    }
  | {
      type: "Poll";
      isActive: boolean;
      data?: PollData;
    };

export type ActiveAddons = Record<string, AddonState>;

export type GuestRequest = {
  participantId: string;
  name: string;
};
