import { ReactNode } from "react";
import { StreamAgenda, UserType } from "./stream";

interface BaseToastProps {
  item: StreamAgenda;
  onClose: () => void;
  children?: ReactNode;
}

export interface CustomToastProps extends BaseToastProps {
  onStart?: () => void;
  userType: UserType;
}

export interface ActionToastProps extends BaseToastProps {
  onAction: () => void;
  userType: UserType;
}

export interface PollToastProps extends BaseToastProps {
  onStart: () => void;
  userType: UserType;
}

export type ToastComponents = {
  CustomToast?: React.ComponentType<CustomToastProps>;
  ActionToast?: React.ComponentType<ActionToastProps>;
  PollToast?: React.ComponentType<PollToastProps>;
};
