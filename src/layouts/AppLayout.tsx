import { Outlet, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketBaseContext";
import { useEffect, useState } from "react";
import { getToken, getUserPublicInfo } from "../utils/token";
import { useLoader } from "../contexts/GlobalLoaderContext";
import GlobalLoader from "./GlobalLoader";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";
import NavBar from "../components/NavBar";

const AppLayout = () => {
  const { socket } = useSocket();
  const user = getUserPublicInfo();
  const { isLoading } = useLoader();
  const { showSnackBar } = useSnackBar();
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    setIsLogged(!!token);
    if (!token) {
      navigate("/login");
      showSnackBar("Login to access all features", "error", 3000);
    }
  }, [getToken()]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
    });

    socket.emit("register", user?.id);

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  return (
    <>
      {isLogged && <NavBar />}
      {isLoading && <GlobalLoader />}
      <Outlet />
    </>
  );
};

export default AppLayout;
