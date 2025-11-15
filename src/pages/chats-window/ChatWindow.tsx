import messages, { type Message } from "../../constant/messages";
import MessageBox from "../../components/chats/MessageBox";
import { Send, Settings } from "lucide-react";
import { useEffect, useRef } from "react";

const ChatWindow = () => {
  const textareaRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      // messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      console.log(messagesRef.current.scrollHeight);
    }
  }, []);

  const autoResize = () => {
    const ta = textareaRef.current;
    ta.style.height = "auto"; // reset
    ta.style.height = ta.scrollHeight + "px"; // set to content height
  };
  return (
    <section className="w-full h-full     overflow-auto flex flex-col relative ">
      <h1 className="sub-heading mb-5">Devchats</h1>
      <div
        ref={messagesRef}
        className="w-full h-full pr-5  overflow-auto flex flex-col pb-32"
      >
        {messages.map((msg: Message) => (
          <MessageBox key={msg._id} {...msg} />
        ))}
      </div>
      <div className="w-[98%] h-max bg-white/90 backdrop-blur-2xl shadow-xl border border-zinc-300 rounded-2xl flex gap-2 items-end p-5 absolute bottom-5 z-20 ">
        <textarea
          ref={textareaRef}
          onInput={autoResize}
          name="chat-input"
          id="chat-input"
          className="w-full   outline-none min-h-8 max-h-[30vh] resize-none bg-transparent scrollbar-hide text-black "
          placeholder="Add message..."
        />
        <button className="!w-max input-grad-btn-invert centered ">
          <Settings />
        </button>
        <button className="!w-max input-grad-btn centered ">
          <Send />
        </button>
      </div>
    </section>
  );
};

export default ChatWindow;
