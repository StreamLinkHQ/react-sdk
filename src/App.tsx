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

// const handleAddAgendaItem = () => {
//   if (
//     newAgendaItem.actionType &&
//     !agendaItems.some((item) => item.time === newAgendaItem.time)
//   ) {
//     let actionDetails: string | PollAction;
//     if (newAgendaItem.actionType === "Poll") {
//       actionDetails = {
//         title: pollTitle,
//         options: pollOptions.filter((option) => option.trim() !== ""),
//       };
//     } else {
//       actionDetails = newAgendaItem.action as string;
//     }

//     if (
//       actionDetails &&
//       (typeof actionDetails === "string" || actionDetails.options.length >= 2)
//     ) {
//       setAgendaItems([
//         ...agendaItems,
//         { ...newAgendaItem, action: actionDetails },
//       ]);
//       setNewAgendaItem({ time: 0, actionType: "Poll", action: "" });
//       setPollTitle("");
//       setPollOptions(["", ""]);
//     }
//   }
// };