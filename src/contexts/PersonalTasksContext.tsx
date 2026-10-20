import { createContext, useContext, useState } from "react";

const PersonalTasksContext = createContext(undefined);

const PersonalTasksContextProvider = ({ children }) => {
  const [window, setWindow] = useState(false);

 
  return (
    <PersonalTasksContext.Provider value={{window,setWindow}}>
      {children}
    </PersonalTasksContext.Provider>
  );
};

export default PersonalTasksContextProvider;

interface PersonalTasksContextType {
  window: boolean;
  setWindow: any;
}

export const usePersonalTasks = () => useContext(PersonalTasksContext) as PersonalTasksContextType;
