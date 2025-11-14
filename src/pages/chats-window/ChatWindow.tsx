import messages, { type Message } from "../../constant/messages";
import MessageBox from "../../components/chats/MessageBox";

const ChatWindow = () => {
  return (
    <section className="w-full h-full     overflow-auto flex flex-col ">
      <h1 className="sub-heading mb-5">Devchats</h1>
      <div className="w-full h-full pr-5  overflow-auto flex flex-col pb-10">
        {messages.map((msg: Message) => (
          <MessageBox key={msg._id} {...msg} />
        ))}
      </div>
    </section>
  );
};

export default ChatWindow;
