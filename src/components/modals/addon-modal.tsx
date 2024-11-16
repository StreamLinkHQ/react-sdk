import { ActiveAddons } from "../../types";
import { Modal } from "../base";
import { PollContent } from "../guest-view";

type AddOnModalProps = {
  closeFunc: (val: boolean) => void;
  activeAddons: ActiveAddons;
};

const AddOnModal = ({ closeFunc, activeAddons }: AddOnModalProps) => {
  const renderAddonContent = () => {
    const activeAddonElements = Object.entries(activeAddons).map(
      ([type, state]) => {
        if (!state.isActive) return null;

        return (
          <div key={type} className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">{type}</h3>
            {type === "Poll" && state.data?.details && (
              <PollContent details={state.data.details} />
            )}
            {type === "Q&A" && <div>{/* Add your Q&A UI here */}</div>}
            {type === "Custom" && state.data && (
              <div>
                <p className="text-lg">{state.data.title}</p>
                {/* Add your custom action UI here */}
              </div>
            )}
          </div>
        );
      }
    );

    const filteredAddons = activeAddonElements.filter(
      (element) => element !== null
    );

    return filteredAddons.length > 0 ? (
      filteredAddons
    ) : (
      <div className="p-4 text-center text-gray-500">
        There are no addons currently
      </div>
    );
  };

  return (
    <Modal
      closeFunc={closeFunc}
      bgColor="bg-modal-black"
      position="bottom"
      width="w-full"
      height="h-1/3"
    >
      <div className="overflow-y-auto max-h-full">
        {renderAddonContent()}
      </div>
    </Modal>
  );
};

export default AddOnModal;