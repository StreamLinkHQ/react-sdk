// import CreateStream from "./components/create-stream"
import ViewStream from "./components/view-stream";
import { NotificationProvider, WalletProviders } from "./context";

function App() {
  return (
    <WalletProviders>
      <NotificationProvider>
        {/* <CreateStream /> */}
        <ViewStream roomName="e3a-520-vud" userType="host" />
      </NotificationProvider>
    </WalletProviders>
  );
}

export default App;