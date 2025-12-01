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
import AppLayout from "./layouts/AppLayout";
import NoProjectSelected from "./pages/NoProjects";
import UserSettingsPage from "./pages/user-settings/UserSettingsPage";
import ChatWindow from "./pages/chats-window/ChatWindow";
import SelectChat from "./pages/SelectChat";
import { UsersInChatProvider } from "./contexts/chatListContext";
import TodoApp from "./pages/TodoApp";
import NotesPage from "./pages/notes/Notes";

const App: React.FC = () => {
    return (
        <LoaderProvider>
            <SnackBarContextProvider>
                <UsersInChatProvider>
                    <SocketBaseProvider>
                        <Routes>
                            <Route path="/" element={<Start />} />
                            <Route element={<AppLayout />}>
                                <Route path="/login" element={<Login />} />
                                {/* Task Layout :- All routes under Task Manager */}
                                <Route element={<TaskLayout />}>
                                    <Route path="/select-project" element={<NoProjectSelected />} />
                                    <Route path="/project/:id" element={<Viewproject />} />
                                    {/* <Route path="/addProject" element={<AddProject />} /> */}
                                    <Route path="/profile" element={<UserProfile />} />
                                    <Route path="/viewprofile/:id" element={<Viewprofile />}></Route>
                                    <Route path="/project/:projectId/viewtickets" element={<ViewTickets />} />
                                    <Route path="/notes" element={<NotesPage/>}/>
                                    <Route path="/listTodos" element={<TodoApp />} />
                                    <Route path="/settings" element={<UserSettingsPage />} />
                                </Route>
                                {/* Chat Layout :- All routes under Chat Section */}
                                <Route element={<ChatLayout />}>
                                    <Route path="/chat" element={<SelectChat />} />
                                    <Route path="/chat/:id" element={<ChatWindow />} />
                                </Route>
                            </Route>
                        </Routes>
                    </SocketBaseProvider>
                </UsersInChatProvider>
            </SnackBarContextProvider>
        </LoaderProvider>
    );
};

export default App;
