import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import api from "../api";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your resume assistant. How can I help you with your resume today?",
      sender: "bot",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    const history = messages
      .slice(1)
      .filter((message) => !message.isError)
      .map((message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.text,
      }));
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", { message: currentMessage, history });
      const botMessage = { text: response.data.response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message;
      const fallbackText =
        status === 401
          ? "Please log in to use the chatbot."
          : status === 429
            ? "AI rate limit reached. Please wait about 30 seconds and try again."
            : "Sorry, I'm having trouble connecting. Please try again later.";
      const errorMessage = {
        text: serverMessage || fallbackText,
        sender: "bot",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button (visible only when chat is fully closed) */}
      {(!isOpen || isMinimized) && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 min-h-12 min-w-12 bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label={isMinimized ? "Expand chat" : "Open chat"}
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="fixed inset-x-2 bottom-2 z-50 flex h-[min(36rem,calc(100dvh-1rem))] max-h-[calc(100dvh-1rem)] flex-col rounded-xl border border-gray-200 bg-white shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-96 sm:w-80 sm:rounded-lg">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">Resume Assistant</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="flex min-h-11 min-w-11 items-center justify-center hover:bg-blue-700 rounded transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex min-h-11 min-w-11 items-center justify-center hover:bg-blue-700 rounded transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about resumes..."
                className="min-w-0 min-h-11 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="min-h-11 min-w-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
