import React from "react";
import { Fish, User } from "lucide-react";

const ChatMessage = ({ message, isUser }) => {
  return (
    <div
      className={`flex gap-4 mb-7 ${isUser ? "flex-row-reverse" : ""}`}
      style={{ animation: "floatMessage 8s ease-in-out infinite" }}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
        isUser
          ? "bg-gradient-to-br from-blue-500 to-indigo-600"
          : "bg-gradient-to-br from-cyan-400 to-blue-500"
      }`}>
        {isUser ? <User size={18} /> : <Fish size={18} />}
      </div>

      <div className={`glass-panel px-5 py-4 rounded-2xl max-w-[75%] ${
        isUser ? "text-blue-50 rounded-tr-md" : "text-slate-100 rounded-tl-md"
      }`}>
        <p className="text-sm leading-relaxed opacity-90 whitespace-pre-wrap">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
