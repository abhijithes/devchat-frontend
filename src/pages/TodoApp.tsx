import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

// TYPES
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// LOCAL STORAGE FUNCTIONS  
const STORAGE_KEY = "todos";

const getTodos = (): Todo[] => {
  const t = localStorage.getItem(STORAGE_KEY);
  return t ? JSON.parse(t) : [];
};

const addTodo = async (text: string): Promise<Todo> => {
  const todos = getTodos();
  const newTodo: Todo = { id: Date.now(), text, completed: false };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...todos, newTodo]));
  return newTodo;
};

const deleteTodo = async (id: number): Promise<Todo[]> => {
  const updated = getTodos().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

const toggleTodo = async (id: number): Promise<Todo[]> => {
  const updated = getTodos().map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

const editTodo = async (id: number, text: string): Promise<Todo[]> => {
  const updated = getTodos().map((t) =>
    t.id === id ? { ...t, text } : t
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// UI COMPONENT
export default function ListTodos() {
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const qc = useQueryClient();

  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: getTodos,
  });

  const addMutation = useMutation<Todo, Error, string>({
    mutationFn: addTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation<Todo[], Error, number>({
    mutationFn: deleteTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const toggleMutation = useMutation<Todo[], Error, number>({
    mutationFn: toggleTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const editMutation = useMutation<Todo[], Error, { id: number; text: string }>({
    mutationFn: ({ id, text }) => editTodo(id, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const handleAdd = () => {
    if (!value.trim()) return;
    addMutation.mutate(value);
    setValue("");
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <div className="w-full mx-auto px-5 space-y-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">Todo Manager</h1>
          <p className="text-gray-600 mt-2">Manage your tasks easily.</p>
        </header>

        {/* Add Todo */}
        <section className="flex gap-2 mb-6">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 border border-gray-300 rounded-md p-2"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Add
          </button>
        </section>

        {/* Todo List */}
        <section className="space-y-3">
          {todos.length === 0 && <p className="text-gray-500">No todos yet.</p>}

          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between border border-gray-300 rounded-md p-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleMutation.mutate(todo.id)}
                  className="w-5 h-5 accent-black"
                />

                {editingId === todo.id ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-1"
                  />
                ) : (
                  <span
                    className={
                      todo.completed ? "line-through text-gray-400" : ""
                    }
                  >
                    {todo.text}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 ml-1">
                {editingId === todo.id ? (
                  <>
                    <button onClick={() => editMutation.mutate({ id: todo.id, text: editValue })}>
                      <SaveIcon />
                    </button>
                    <button onClick={() => setEditingId(null)}>
                      <CloseIcon />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditValue(todo.text);
                      }}
                    >
                      <EditIcon />
                    </button>

                    <button onClick={() => deleteMutation.mutate(todo.id)}>
                      <DeleteIcon />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
