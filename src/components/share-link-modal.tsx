import { TbCopy } from "react-icons/tb";
import { Modal } from "./base";
import { useNotification } from "../hooks";

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
    <Modal bgColor="bg-modal-black" closeFunc={closeFunc} childBgColor="bg-[#222]" width="w-1/3" height="h-[50%]" >
      {/* <div className=" w-[78%] mx-auto rounded-xl p-5 text-black my-28 lg:w-[28%]"> */}
        <div className="flex flex-row justify-between items-center mb-4">
          <p className="text-xl text-white font-semibold">Share</p>
        </div>
        <div className="flex flex-col">
          <div className="my-2">
            <p className="capitalize font-semibold text-sm text-white">
              for Co-host
            </p>
            <div className="bg-[#222] border border-yellow flex flex-row items-center rounded-md mt-3 p-2 justify-between">
              <p className="text-sm truncate text-white">{`${window.location.hostname}/${streamName}?mode=host`}</p>
              <TbCopy
                className="text-white text-3xl font-semibold"
                onClick={() =>
                  copyText(
                    `${window.location.hostname}/${streamName}?mode=host`
                  )
                }
              />
            </div>
          </div>
          <div className="mt-2">
            <p className="capitalize font-semibold text-sm text-white">
              for Audience
            </p>
            <div className="bg-[#222] border border-yellow flex flex-row items-center rounded-md mt-3 p-2 justify-between">
              <p className="text-sm truncate text-white">{`${window.location.hostname}/${streamName}?mode=guest`}</p>
              <TbCopy
                className="text-white text-3xl font-semibold"
                onClick={() =>
                  copyText(
                    `${window.location.hostname}/${streamName}?mode=guest`
                  )
                }
              />
            </div>
          </div>
        </div>
      {/* </div> */}
    </Modal>
  );
};

export default ShareModal;
