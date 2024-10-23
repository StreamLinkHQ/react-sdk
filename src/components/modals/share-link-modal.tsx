import { TbCopy } from "react-icons/tb";
import { Modal } from "../base";
import { useNotification } from "../../hooks";

type ShareModalProps = {
  closeFunc: (val: boolean) => void;
  streamName: string;
};

const ShareModal = ({ closeFunc, streamName }: ShareModalProps) => {
  const { addNotification } = useNotification();
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification({
        type: "success",
        message: "Link copied",
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
      addNotification({
        type: "error",
        message: "Something went wrong",
        duration: 3000,
      });
    }
  };
  return (
    <Modal
      bgColor="bg-modal-black"
      closeFunc={closeFunc}
      width="w-1/3"
      height="h-[50%]"
    >
      <div className="flex flex-row justify-between items-center mb-4">
        <p className="text-xl font-semibold">Share</p>
      </div>
      <div className="flex flex-col">
        <div className="my-2">
          <p className="capitalize font-semibold text-sm ">for Co-host</p>
          <div className="border border-black flex flex-row items-center rounded-md mt-3 p-2 justify-between">
            <p className="text-sm truncate ">{`${window.location.hostname}/${streamName}?mode=host`}</p>
            <TbCopy
              className="text-3xl font-semibold cursor-pointer"
              onClick={() =>
                copyText(`${window.location.hostname}/${streamName}?mode=host`)
              }
            />
          </div>
        </div>
        <div className="mt-2">
          <p className="capitalize font-semibold text-sm ">for Audience</p>
          <div className="border border-black flex flex-row items-center rounded-md mt-3 p-2 justify-between">
            <p className="text-sm truncate ">{`${window.location.hostname}/${streamName}?mode=guest`}</p>
            <TbCopy
              className="text-3xl font-semibold cursor-pointer"
              onClick={() =>
                copyText(`${window.location.hostname}/${streamName}?mode=guest`)
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
