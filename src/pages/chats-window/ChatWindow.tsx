import messages, { type Message } from "../../constant/messages";

const ChatWindow = () => {
  return (
    <section className="w-full h-full p-5   overflow-auto flex flex-col ">
      <h1 className="sub-heading">Devchats</h1>
      <div>
        {messages.map((msg: Message) => (
          <div key={msg._id} className="mb-4">
            <div className="bg-gray-200 p-4 rounded-lg max-w-lg">
              <p className="text-gray-800">{msg.content}</p>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(msg.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChatWindow;
