import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Fish } from "lucide-react";
import ChatMessage from "../components/ChatMessage";
import MarineBackground from "../components/MarineBackground";
import { getMarineResponse, welcomeMessage, quickPrompts } from "../mock/marineData";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { text: welcomeMessage, isUser: false, id: 1 },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (messageText = null) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    const userMessage = {
      text: textToSend,
      isUser: true,
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getMarineResponse(textToSend);
      const botMessage = {
        text: response,
        isUser: false,
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <MarineBackground />

      {/* UI */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Header */}
        <header className="glass-panel border-b border-cyan-400/10">
          <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/20">
                <Fish className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#071427] animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Marine Assistant
              </h1>
              <p className="text-xs text-cyan-300/80 font-medium">
                Powered by Ocean AI
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.text}
                isUser={msg.isUser}
              />
            ))}

            {isTyping && (
              <div className="flex gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Fish className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="glass-panel px-5 py-4 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:.15s]" />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:.3s]" />
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span className="text-sm font-medium text-cyan-200">
                    Explore these topics
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="glass-panel text-left px-5 py-4 rounded-2xl text-sm text-white hover:scale-[1.02] transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="sticky bottom-0 glass-panel border-t border-cyan-400/10">
          <div className="max-w-4xl mx-auto px-4 py-5 flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about marine life, ocean creatures, or aquatic ecosystems..."
              className="resize-none bg-white/95 rounded-2xl min-h-[58px]"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="h-[58px] w-[58px] rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-center text-cyan-300/60 text-xs pb-4">
            Mock data mode • Real AI integration ready
          </p>
        </div>

      </div>
    </div>
  );
};

export default ChatbotPage;
