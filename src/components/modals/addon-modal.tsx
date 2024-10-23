import { ActiveAddons } from "../../types";
import { Modal } from "../base";

type AddOnModalProps = {
  closeFunc: (val: boolean) => void;
  activeAddons: ActiveAddons;
};

const AddOnModal = ({ closeFunc, activeAddons }: AddOnModalProps) => {
  const renderAddonContent = () => {
    return Object.entries(activeAddons).map(([type, state]) => {
      if (!state.isActive) return <p>There are no active addons</p>;

      return (
        <div
          key={type}
          className="absolute bottom-20 right-4 z-50 bg-white rounded-lg shadow-lg p-4"
        >
          <h3 className="font-bold mb-2">{type}</h3>
          {type === "Poll" && state.data && (
            <div>
              <h4>{state.data.title}</h4>
              {/* Add your poll UI here */}
            </div>
          )}
          {type === "Q&A" && <div>{/* Add your Q&A UI here */}</div>}
          {type === "Custom" && state.data && (
            <div>
              <h4>{state.data.title}</h4>
              {/* Add your custom action UI here */}
            </div>
          )}
        </div>
      );
    });
  };
  return (
    <Modal closeFunc={closeFunc} bgColor="bg-modal-black">
      <div>{renderAddonContent()}</div>
    </Modal>
  );
};

export default AddOnModal;
