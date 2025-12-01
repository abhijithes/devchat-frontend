import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

interface Note {
  id: number;
  text: string;
  color: string;
}

const COLORS = [
  { name: "Green", bg: "#98FB98", border: "#2E8B57" },
  { name: "Aquamarine", bg: "#7FFFD4", border: "#008B8B" },
  { name: "SandyBrown", bg: "#F4A460", border: "#A0522D" },
  { name: "Pumpkin", bg: "#FFB347", border: "#FF8C00" },
  { name: "Lavender", bg: "#E6E6FA", border: "#6A5ACD" },
];

const STORAGE_KEY = "notes-page-data";

const getNotes = (): Note[] => {
  const n = localStorage.getItem(STORAGE_KEY);
  return n ? JSON.parse(n) : [];
};

const saveNotes = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [text, setText] = useState("");
  const [color, setColor] = useState(COLORS[0].name);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    const updated = [...notes, { id: Date.now(), text, color }];
    setNotes(updated);
    saveNotes(updated);
    setText("");
  };

  const handleDelete = (id: number) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const updated = notes.map((n) =>
      n.id === editingId ? { ...n, text: editText } : n
    );
    setNotes(updated);
    saveNotes(updated);
    setEditingId(null);
    setEditText("");
  };

  const getNoteStyles = (note: Note): React.CSSProperties => {
    // Safe fallback for undefined color
    const c = COLORS.find((x) => x.name === note.color) || COLORS[0];
    return {
      backgroundColor: c.bg,
      border:
        editingId === note.id
          ? `3px solid ${c.border}`
          : `2px solid ${c.border}`,
      color: "white",
      wordWrap: "break-word",
      overflowWrap: "break-word",
      transition: "all 0.2s",
    };
  };

  return (
    <div className="h-screen flex flex-col ">
     
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-semibold mb-4">Quick Notes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-40">
          {notes.map((note) => (
            <div
              key={note.id}
              style={getNoteStyles(note)}
              className="rounded-lg p-4 shadow min-h-[170px] flex flex-col justify-between"
            >
              {editingId === note.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 rounded text-black border border-gray-400"
                />
              ) : (
                <p className="mb-4 whitespace-pre-wrap">{note.text}</p>
              )}

              <div className="flex justify-end gap-2 mt-3">
                {editingId === note.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-white text-black rounded"
                    >
                      <SaveIcon />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-white text-black rounded"
                    >
                      <CloseIcon />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setEditText(note.text);
                      }}
                      className="px-3 py-1 bg-white text-black rounded"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="px-3 py-1 bg-white text-black rounded"
                    >
                      <DeleteIcon />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FIXED INPUT BAR */}
      <div className="p-4 border-t bg-white sticky bottom-0 z-20">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your note..."
          className="w-full border border-gray-300 rounded-lg p-3 h-20 mb-3"
        />

        <div className="flex items-center justify-between gap-3">
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="p-2 rounded-md border font-medium"
            style={{
              backgroundColor:
                COLORS.find((c) => c.name === color)?.bg || COLORS[0].bg,
              color: "white",
            }}
          >
            {COLORS.map((c) => (
              <option
                key={c.name}
                value={c.name}
                style={{ backgroundColor: c.bg, color: "white" }}
              >
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-black text-white rounded-md"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
