import Modal from "./modal";

type LoaderProps = {
  closeFunc: (val: boolean) => void;
};

const Loader = ({ closeFunc }: LoaderProps) => {
  return (
    <Modal
      bgColor="bg-modal-black"
      closeFunc={closeFunc}
      childBgColor="bg-transparent"
      isClosable={false}
      position="center"
      height="h-auto"
    >
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow" />
      </div>
    </Modal>
  );
};

export default Loader;
