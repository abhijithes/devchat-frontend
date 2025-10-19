import { createContext, useContext, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { socket_url } from "../constant/constant";

interface SocketContextType {
  socket: Socket;
}

const SocketBaseContext = createContext<SocketContextType | undefined>(
  undefined
);

const socket: Socket = io(socket_url, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

const SocketBaseProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SocketBaseContext.Provider value={{ socket }}>
      {children}
    </SocketBaseContext.Provider>
  );
};

const useSocket = (): Socket => {
  const context = useContext(SocketBaseContext);
  if (!context)
    throw new Error("useSocket must be used within SocketBaseProvider");
  return context.socket;
};

export { SocketBaseContext, SocketBaseProvider, useSocket };
