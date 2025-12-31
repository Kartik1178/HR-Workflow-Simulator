import React from 'react';
import { Fish, User } from 'lucide-react';

const ChatMessage = ({ message, isUser }) => {
  return (
    <div
      className={`flex gap-4 mb-6 animate-in slide-in-from-bottom-4 duration-500 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/30'
            : 'bg-gradient-to-br from-cyan-400/90 to-blue-500/90 backdrop-blur-sm border border-cyan-300/30'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Fish className="w-5 h-5 text-white" />
        )}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-xl ${
          isUser
            ? 'bg-gradient-to-br from-blue-600/90 to-indigo-700/90 backdrop-blur-sm text-white rounded-tr-md border border-blue-400/30'
            : 'bg-white/95 backdrop-blur-sm text-gray-800 rounded-tl-md border border-cyan-100/50'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;