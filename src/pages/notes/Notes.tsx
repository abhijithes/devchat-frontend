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
  { name: "Green", bg: "#F7FFD9", dot: "#D1FF00" },
  { name: "Blue", bg: "#D9FBFF", dot: "#00CFFF" },
  { name: "LightGreen", bg: "#D9FFE7", dot: "#00FF3C" },
  { name: "Yellow", bg: "#FBFFD9", dot: "#FFF200" },
  { name: "Purple", bg: "#F0D9FF", dot: "#C100FF" },
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

  const [colorOpen, setColorOpen] = useState(false);

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
    const id =  Date.now();
    const updated = notes.map((n) =>
      n.id === editingId ? { ...n, id:id,text: editText } : n
    );
    setNotes(updated);
    saveNotes(updated);
    setEditingId(null);
    setEditText("");
  };

  const getBgColor = (clr: string) =>
    COLORS.find((c) => c.name === clr)?.bg || COLORS[0].bg;

  const getDotColor = (clr: string) =>
    COLORS.find((c) => c.name === clr)?.dot || COLORS[0].dot;

  const formatNoteDate = (timestamp: number) => {
  const date = new Date(timestamp);

  return date.toLocaleString("en-US", {
    weekday: "short",   
    month: "short",     
    year: "numeric",    
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return (
    <div className="p-10">
      <h1 className="font-semibold text-3xl mb-6">Quick Notes</h1>

      <div className="flex gap-10 h-[500px] w-full  ">
      
        <div className="w-2/3 h-full max-h-[600px] overflow-y-auto pr-4   ">
          <div className="grid grid-cols-2 gap-6  ">
            {notes.map((note) => (
              <div
                key={note.id}
                className="relative p-5 rounded-4xl shadow flex flex-col justify-between"
                style={{ backgroundColor: getBgColor(note.color) }}
              >
                
                <span
                  className="absolute top-4 right-4 h-5 w-5 rounded-full"
                  style={{ backgroundColor: getDotColor(note.color) }}
                ></span>

                {/* edit  */}
                {editingId === note.id ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: getBgColor(note.color),
                      minHeight: "100px",
                    }}
                  />
                ) : (
                  <p className="font-medium break-words whitespace-pre-wrap max-h-[120px] overflow-y-auto pr-4">
                    {note.text}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4 pt-2">
                  <div className="text-xs text-gray-600">
                     {
                      formatNoteDate(note.id)
                     }
                  </div>

                  <div className="flex items-center gap-3">
                    {editingId === note.id ? (
                      <>
                        <button onClick={handleSaveEdit}>
                          <SaveIcon fontSize="small" />
                        </button>
                        <button onClick={() => setEditingId(null)}>
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
                        >
                          <EditIcon fontSize="small" />
                        </button>
                        <button onClick={() => handleDelete(note.id)}>
                          <DeleteIcon fontSize="small" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/3 h-full border rounded-2xl p-5 flex flex-col">
          <p className="text-sm mb-2">Write your notes</p>

          <textarea
            className="border rounded-lg p-3 flex-1 resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-between items-center mt-4 px-3 py-2">
            <div className="relative">
              

              {/* Dropdown List */}
             
                <div className="relative flex items-center gap-2">
                  {/* Selected Color Circle */}
                  <span
                    className="h-6 w-6 rounded-full cursor-pointer border"
                    style={{
                      backgroundColor: COLORS.find((x) => x.name === color)
                        ?.dot,
                    }}
                    onClick={() => setColorOpen(!colorOpen)}
                  ></span>

                  {/* Dropdown Arrow Icon */}
                  <span
                    className="cursor-pointer select-none text-gray-700"
                    onClick={() => setColorOpen(!colorOpen)}
                  >
                    ▼
                  </span>

                  {/* Dropdown Menu */}
                  {colorOpen && (
                    <div className="absolute top-8 left-0 bg-white border shadow-md rounded-xl p-2 flex flex-col gap-2 z-50">
                      {COLORS.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setColor(c.name);
                            setColorOpen(false);
                          }}
                        >
                          <span
                            className="h-6 w-6 rounded-full border"
                            style={{ backgroundColor: c.dot }}
                          ></span>

                          {/* Color name */}
                          <span className="text-sm">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              
            </div>

            <button
              onClick={handleAdd}
              className="bg-black text-white px-6 py-2 rounded-xl"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
