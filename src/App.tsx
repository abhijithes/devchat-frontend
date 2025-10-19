import { Routes, Route } from "react-router-dom";

// Layouts
import TaskLayout from "./layouts/TaskLayout";
import ChatLayout from "./layouts/ChatLayout";
import "./theme.css";
import "./App.css";
// Pages (dummy placeholders for now)
import { Start } from "../src/pages/Start";
// import AddProject from "./components/AddProject";
import { Viewproject } from "../src/pages/viewProject/viewproject";
import Login from "./pages/Login";
import UserProfile from "./pages/userprofile/profile";
import { LoaderProvider } from "./contexts/GlobalLoaderContext";
import Viewprofile from "./pages/viewprofile/viewprofile";
import SnackBarContextProvider from "./components/snack-bar/snack-bar-context";
import ViewTickets from "./pages/ViewTaskTable/ViewTaskTable";
import { SocketBaseProvider } from "./contexts/SocketBaseContext";

const App: React.FC = () => {
  return (
    <LoaderProvider>
      <SnackBarContextProvider>
        <SocketBaseProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Task Layout :- All routes under Task Manager */}
            <Route element={<TaskLayout />}>
              <Route path="/project/:id" element={<Viewproject />} />
              <Route path="/" element={<Start />} />
              {/* <Route path="/addProject" element={<AddProject />} /> */}
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/viewprofile/:id" element={<Viewprofile />}></Route>
              <Route
                path="/project/:projectId/viewtickets"
                element={<ViewTickets />}
              />
            </Route>
            {/* Chat Layout :- All routes under Chat Section */}
            <Route element={<ChatLayout />}>
              <Route path="/chat" element={<Start />} />
            </Route>
          </Routes>
        </SocketBaseProvider>
      </SnackBarContextProvider>
    </LoaderProvider>
  );
};

export default App;
