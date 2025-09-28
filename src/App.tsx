import { Routes, Route } from "react-router-dom";

// Layouts
import TaskLayout from "./layouts/TaskLayout";
import ChatLayout from "./layouts/ChatLayout";
import './theme.css'
// Pages (dummy placeholders for now)
import { Start } from '../src/pages/Start';
// import AddProject from "./components/AddProject";
import { Viewproject } from '../src/pages/viewProject/viewproject';
import Login from "./pages/Login";
import { LoaderProvider } from "./contexts/GlobalLoaderContext";


const App: React.FC = () => {
  return (
    <LoaderProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Task Layout :- All routes under Task Manager */}
        <Route element={<TaskLayout />}>
          <Route path="/project/:id" element={<Viewproject />} />
          <Route path="/" element={<Start />} />
          {/* <Route path="/addProject" element={<AddProject />} /> */}
        </Route>
        {/* Chat Layout :- All routes under Chat Section */}
        <Route element={<ChatLayout />}>
          <Route path="/chat" element={<Start />} />
        </Route>
      </Routes>
    </LoaderProvider>

  );
};

export default App;
