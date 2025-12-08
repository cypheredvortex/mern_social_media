const ChatWindow = ({ conversation }) => {
  return (
    <div className="bg-white p-4 rounded shadow h-96 overflow-y-auto">
      {conversation?.messages.map((m) => (
        <div key={m._id} className="mb-2">
          <span className="font-bold">{m.sender.name}:</span> {m.text}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;