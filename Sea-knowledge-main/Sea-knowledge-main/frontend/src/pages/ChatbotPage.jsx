import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Fish } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import MarineBackground from '../components/MarineBackground';
import { getMarineResponse, welcomeMessage, quickPrompts } from '../mock/marineData';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { text: welcomeMessage, isUser: false, id: 1 }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputValue.trim();
    
    if (!textToSend) return;

    // Add user message
    const userMessage = {
      text: textToSend,
      isUser: true,
      id: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = getMarineResponse(textToSend);
      const botMessage = {
        text: response,
        isUser: false,
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Marine Background */}
      <MarineBackground />

      {/* Main Content - ChatGPT/Perplexity Style */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-5 px-4 backdrop-blur-xl bg-[#0a1628]/60 border-b border-cyan-400/10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/20">
                  <Fish className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a1628] animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Marine Assistant</h1>
                <p className="text-xs text-cyan-300/80 font-medium">Powered by Ocean AI</p>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container - Centered like ChatGPT */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
              />
            ))}
            
            {isTyping && (
              <div className="flex gap-4 mb-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/90 to-blue-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-cyan-300/30">
                  <Fish className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-5 py-4 bg-white/95 backdrop-blur-sm shadow-xl border border-cyan-100/50">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick prompts - show only at start */}
            {messages.length === 1 && (
              <div className="mb-8 animate-in fade-in duration-700">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span className="text-sm font-medium text-cyan-200">Explore these topics</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="group text-left px-5 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-sm text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-white/10 hover:border-cyan-400/50"
                    >
                      <span className="group-hover:text-cyan-200 transition-colors">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area - Fixed at bottom like ChatGPT */}
        <div className="sticky bottom-0 backdrop-blur-2xl bg-[#0a1628]/70 border-t border-cyan-400/10">
          <div className="max-w-4xl mx-auto px-4 py-5">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about marine life, ocean creatures, or aquatic ecosystems..."
                  className="resize-none bg-white/98 backdrop-blur-sm border-gray-200/50 focus:border-cyan-400 focus:ring-cyan-400/30 rounded-2xl min-h-[58px] max-h-[120px] text-gray-800 placeholder:text-gray-500 shadow-xl shadow-black/10 pr-12 font-normal"
                  rows={1}
                />
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="h-[58px] w-[58px] p-0 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-center text-cyan-300/60 text-xs mt-3 font-medium">
              Mock data mode • Real AI integration ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;