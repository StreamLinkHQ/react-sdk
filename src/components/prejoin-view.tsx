import { PreJoin } from "@livekit/components-react";
import "@livekit/components-styles";
import WalletButton from "./wallet-button";
import { GenerateTokenParams } from "../types";

type PreJoinViewProps = {
  onSubmit: (val: GenerateTokenParams) => Promise<void>;
  setWallet: (val: string) => void;
};

const PreJoinView = ({ onSubmit, setWallet }: PreJoinViewProps) => (
  <>
    <WalletButton />
    <PreJoin onSubmit={onSubmit} />
    <input type="text" placeholder="wallet" className="border-2 border-black" onChange={(e) => setWallet(e.target.value)}/>
  </>
);

export default PreJoinView