import { RxCross2 } from "react-icons/rx";

type ModalProps = {
  children: React.ReactNode;
  bgColor: string;
  closeFunc: (val: boolean) => void;
  position?: "left" | "right" | "center" | "bottom";
  width?: string;
  height?: string;
  childBgColor?: string;
  isClosable?: boolean;
};

const Modal = ({
  children,
  bgColor,
  closeFunc,
  position = "center",
  width = "w-3/4",
  height = "h-full",
  childBgColor = "bg-white",
  isClosable = true,
}: ModalProps) => {
  const positionClass =
    position === "right"
      ? "right-0 top-0"
      : position === "left"
      ? "left-0 top-0"
      : position === "bottom"
      ? "bottom-0 left-0 right-0"
      : "left-1/2 top-0 transform -translate-x-1/2";

  return (
    <div className={`z-[80] w-full h-full fixed top-0 ${bgColor}`}>
      <div
        className={`absolute ${positionClass} ${width} ${height} ${childBgColor} p-6 max-h-full max-w-screen overflow-y-auto overflow-x-hidden`}
      >
        {isClosable && (
          <div className="absolute top-5 right-5">
            <RxCross2
              onClick={() => closeFunc(false)}
              className="text-xl lg:text-3xl cursor-pointer"
            />
          </div>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
