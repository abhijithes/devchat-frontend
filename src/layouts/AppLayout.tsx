import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "../utils/token";
import { useLoader } from "../contexts/GlobalLoaderContext";
import GlobalLoader from "./GlobalLoader";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";
import NavBar from "../components/NavBar";
import { usePushSetup } from "../utils/usePushSetup";

const AppLayout = () => {
    const { isLoading } = useLoader();
    const { showSnackBar } = useSnackBar();
    const [isLogged, setIsLogged] = useState(false);
    const navigate = useNavigate();

    // Auto-register service worker and subscribe to push notifications
    usePushSetup();

    useEffect(() => {
        const token = getToken();
        setIsLogged(!!token);
        if (!token) {
            navigate("/login");
            showSnackBar("Login to access all features", "error", 3000);
        }
    }, [getToken()]);

    return (
        <>
            {isLogged && <NavBar />}
            {isLoading && <GlobalLoader />}
            <Outlet />
        </>
    );
};

export default AppLayout;
