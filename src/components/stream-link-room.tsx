import {
  NotificationProvider,
  WalletProviders,
  UserProvider,
} from "../context";

const StreamLinkRoom = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProviders>
      <NotificationProvider>
        <UserProvider>{children}</UserProvider>
      </NotificationProvider>
    </WalletProviders>
  );
};

export default StreamLinkRoom;
