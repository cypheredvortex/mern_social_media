import { useState, useEffect } from "react";
import api from "../../lib/axios";

const MessageList = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const res = await api.get("/messages");
      setMessages(res.data.filter(m => m.conversation_id === conversationId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  return (
    <div className="h-64 overflow-y-auto border rounded p-2 mb-2">
      {messages.map(m => (
        <p key={m._id}>
          <strong>{m.sender_id.name}:</strong> {m.content}
        </p>
      ))}
    </div>
  );
};

export default MessageList;