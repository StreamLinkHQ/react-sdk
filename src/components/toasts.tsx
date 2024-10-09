import { StreamAgenda, UserType } from "../types";

type CustomToastProps = {
  item: StreamAgenda;
  onClose: () => void;
  children?: React.ReactNode;
};

export const CustomToast = ({
  item,
  onClose,
  children,
}: CustomToastProps) => (
  <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 animate-slideIn">
    {children ? (
      children
    ) : (
      <>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {item.details.item}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={onClose}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium"
          >
            Close
          </button>
        </div>
      </>
    )}
  </div>
);

type ActionToastProps = {
  item: StreamAgenda;
  onClose: () => void;
  onAction: () => void;
  children?: React.ReactNode;
  userType: UserType;
};

export const ActionToast = ({
  item,
  onClose,
  onAction,
  userType,
  children,
}: ActionToastProps) => (
  <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5 animate-slideIn">
    {children ? (
      children
    ) : (
      <>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 whitespace-nowrap capitalize">
                {item.details.item}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-gray-200">
          {userType === "host" && (
            <button
              onClick={onAction}
              className="w-full border border-transparent p-2 flex items-center justify-center text-sm font-medium"
            >
              Create Transaction
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full border border-transparent p-2 flex items-center justify-center text-sm font-medium"
          >
            Close
          </button>
        </div>
      </>
    )}
  </div>
);

type PollToastProps = {
  item: StreamAgenda;
  onClose: () => void;
  onStart: () => void;
  children?: React.ReactNode;
  userType: UserType;
};

export const PollToast = ({
  item,
  onClose,
  onStart,
  userType,
  children,
}: PollToastProps) => (
  <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5 animate-slideIn">
    {children ? (
      children
    ) : (
      <>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 whitespace-nowrap capitalize">
                {item.details.item}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-gray-200">
          {userType === "host" && (
            <button
              onClick={onStart}
              className="w-full border border-transparent p-2 flex items-center justify-center text-sm font-medium"
            >
              Start Now
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full border border-transparent p-2 flex items-center justify-center text-sm font-medium"
          >
            Close
          </button>
        </div>
      </>
    )}
  </div>
);