import { PreJoin } from "@livekit/components-react";
import "@livekit/components-styles";
import WalletButton from "./wallet-button";
import { GenerateTokenParams } from "../types";

type PreJoinViewProps = {
  onSubmit: (val: GenerateTokenParams) => Promise<void>;
};

const PreJoinView = ({ onSubmit }: PreJoinViewProps) => (
  <>
    <WalletButton />
    <PreJoin onSubmit={onSubmit} />
  </>
);

export default PreJoinView