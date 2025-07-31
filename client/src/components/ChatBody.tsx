import React, { useEffect, useRef } from "react";


type ChatBodyType = {
  messages: { from: string; message: string; sender: string }[];
  activeUser: { socketID: string; userName: string }|null;
  activeRoom:string|null;
  
};

const ChatBody: React.FC<ChatBodyType> = ({ messages, activeUser, activeRoom }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatTitle = activeRoom ? `Group: ${activeRoom}` : activeUser?.userName || "Chat";

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-white text-blue-500 sticky top-0 z-10">
        <h2 className="text-xl font-semibold">{chatTitle}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.from === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="font-semibold text-[10px]">
                {msg.from === "me" ? "You" : msg.sender}
              </p>
              <p className="mt-1">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatBody;
