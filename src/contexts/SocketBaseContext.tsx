import { createContext, useContext, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { socket_url } from "../constant/constant";

const SocketBaseContext = createContext(undefined);

const SocketBaseProvider = ({ children }: { children: ReactNode }) => {
    const socket: Socket = io(socket_url, {});

    socket.on("connection", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });
    socket.on("get_notification", (data) => {
        console.log("📩 Notification:", data.message);
        alert(data.message); // Or render in UI
    });

    return <SocketBaseContext.Provider value={{ socket }}>{children}</SocketBaseContext.Provider>;
};

const userSocketBaseContext = (): Socket => {
    return useContext(SocketBaseContext);
};

export { SocketBaseContext, SocketBaseProvider, userSocketBaseContext };
