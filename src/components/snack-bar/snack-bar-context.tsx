import { createContext, useContext, useState, type ReactNode } from "react";
import SnackBar, { type User } from "./SnackBar";

const SnackBarContext = createContext(undefined);

interface SnackParams {
  message: string;
  type: "success" | "error" | "info" | "drop-notification";
  user?: User;
  duration?: number;
}
const SnackBarContextProvider = ({ children }: { children: ReactNode }) => {
  const [snackContent, setSnackContent] = useState<SnackParams | null>(null);

  const showSnackBar = (
    message: string,
    type: "success" | "error" | "info" | "drop-notification",
    duration: number,
    user?: User
  ) => {
    setSnackContent({ message, type, duration, user });
    setTimeout(() => {
      setSnackContent(null);
    }, duration || 3000);
  };

  return (
    <SnackBarContext.Provider value={{ showSnackBar }}>
      {snackContent && (
        <SnackBar {...snackContent} onClose={() => setSnackContent(null)} />
      )}
      {children}
    </SnackBarContext.Provider>
  );
};

export default SnackBarContextProvider;

export const useSnackBar = () => {
  const context = useContext(SnackBarContext);
  if (context === undefined) {
    throw new Error(
      "useSnackBar must be used within a SnackBarContextProvider"
    );
  }
  const {
    showSnackBar,
  }: {
    showSnackBar: (
      message: string,
      type: "success" | "error" | "info" | "drop-notification",
      duration: number,
      user?: User
    ) => void;
  } = useContext(SnackBarContext);
  return { showSnackBar };
};
