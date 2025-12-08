import { useState, useContext } from "react";
import api from "../../lib/axios";
import { AuthContext } from "../../context/AuthContext";

const MessageInput = ({ conversationId, onMessageSent }) => {
  const { user } = useContext(AuthContext);
  const [text, setText] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      await api.post("/messages", { sender_id: user._id, conversation_id: conversationId, content: text });
      setText("");
      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 border rounded mr-2"
      />
      <button className="bg-blue-500 text-white p-2 rounded">Send</button>
    </form>
  );
};

export default MessageInput;
