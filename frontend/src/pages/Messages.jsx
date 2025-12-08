import { useState } from "react";
import MessageList from "../components/messages/MessageList";
import MessageInput from "../components/messages/MessageInput";

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="max-w-2xl mx-auto mt-6">
      {/* For simplicity, assuming one conversation */}
      {selectedConversation ? (
        <>
          <MessageList conversationId={selectedConversation} />
          <MessageInput conversationId={selectedConversation} onMessageSent={() => {}} />
        </>
      ) : (
        <p>Select a conversation</p>
      )}
    </div>
  );
};

export default Messages;
