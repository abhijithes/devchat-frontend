import { useEffect, useState } from "react";
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
  { name: "Mint", bg: "#C8F7C5", border: "#7BC47F" },
  { name: "SkyBlue", bg: "#D6F0FF", border: "#72A9E1" },
  { name: "Peach", bg: "#FFE2CC", border: "#FF9F6E" },
  { name: "SoftYellow", bg: "#FFF7C2", border: "#E6D872" },
  { name: "Rose", bg: "#FFD6E7", border: "#E76C9F" },
  { name: "Lilac", bg: "#EAD8FF", border: "#A87BE6" },
  { name: "AquaMist", bg: "#D4FFF7", border: "#57CFC0" },
  { name: "PowderBlue", bg: "#E3EDFF", border: "#7C9CE1" },
  { name: "CoralBlush", bg: "#FFDAD1", border: "#FF8A74" },
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
  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    setNotes(notes?.sort((a, b) => b.id - a.id));
  }, [notes]);

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
      // backgroundColor: c.bg,
      border:
        editingId === note.id
          ? `1px solid ${c.border}`
          : `1px solid ${c.border}`,
      color: "white",
      wordWrap: "break-word",
      overflowWrap: "break-word",
      transition: "all 0.2s",
    };
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-8 p-4 md:p-6 bg-gray-50">
      {/* LEFT — Notes List */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-5">Quick Notes</h1>

        <div
          className="
          grid gap-4 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          auto-rows-min 
          max-h-[80vh] overflow-y-auto pr-2
        "
        >
          {!notes.length && (
            <div className="col-span-full h-[40vh] bg-white shadow rounded-xl flex items-center justify-center">
              <p className="text-gray-500 text-lg">No notes yet...</p>
            </div>
          )}

          {notes.map((note) => (
            <div
              key={note.id}
              style={getNoteStyles(note)}
              className="
              bg-white rounded-xl shadow 
              p-4 flex flex-col justify-between 
              min-h-[180px]
              hover:shadow-lg hover:-translate-y-1 
              transition-all
            "
            >
              {editingId === note.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 rounded-lg text-black bg-gray-100 border"
                />
              ) : (
                <p className="text-gray-800 whitespace-pre-wrap text-[15px] leading-relaxed">
                  {note.text}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-3">
                {editingId === note.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 bg-green-100 hover:bg-green-200 rounded-full"
                    >
                      <SaveIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-full"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setEditText(note.text);
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Add Note */}
      <div className="lg:w-1/3 bg-white shadow-md p-6 rounded-xl sticky top-4 h-fit">
        <h1 className="text-xl font-semibold mb-4">Write Your Thoughts</h1>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note..."
          className="
          w-full min-h-48 p-4 bg-gray-100 rounded-xl border focus:ring-2 
          focus:ring-purple-300 outline-none
        "
        />

        {/* Color Picker + Add Button */}
        <div className="flex items-center justify-between mt-4">
          {/* Color Picker */}
          <div className="relative">
            <div
              title="Select Color"
              onClick={() => setOpen(!open)}
              className="w-9 h-9 rounded-full border cursor-pointer shadow"
              style={{
                backgroundColor: COLORS.find((c) => c.name === color)?.bg,
              }}
            ></div>

            {open && (
              <div
                className="
                absolute bottom-14 bg-white shadow-xl rounded-xl p-4 
                grid grid-cols-4 gap-3 w-48 z-50
              "
              >
                {COLORS.map((c) => (
                  <div
                    key={c.name}
                    onClick={() => {
                      setColor(c.name);
                      setOpen(false);
                    }}
                    className={`
                      w-8 h-8 rounded-full border cursor-pointer 
                      hover:scale-110 transition 
                      ${color === c.name ? "ring-2 ring-black" : ""}
                    `}
                    style={{ backgroundColor: c.bg }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="
            px-6 py-2 rounded-lg text-white font-medium 
            bg-gradient-to-r from-purple-500 to-blue-500 
            hover:opacity-90 transition
          "
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
