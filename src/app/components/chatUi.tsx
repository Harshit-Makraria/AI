"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function ChatUI() {
  // const [tokenUsage, setTokenUsage] = useState<{
  //   promptTokens: number;
  //   responseTokens: number;
  //   totalTokens: number;
  // } | null>(null);

  const [typingMessage, setTypingMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: "/api/chut",
    onResponse: async (res) => {
      const reader = res.body?.getReader();
      if (!reader) return;
    
      const decoder = new TextDecoder();
      let fullResponse = "";
    
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
    
        fullResponse += decoder.decode(value);
      }
    
      // Attempt to extract the relevant message dynamically
      let extractedMessage = "";
      const lines = fullResponse.split("\n");
    
      for (const line of lines) {
        const match = line.match(/0:"(.*?)"/); // Extract text inside 0:"..."
        if (match) {
          extractedMessage += match[1]; // Append the matched text
        }
      }
    
      extractedMessage = extractedMessage.replace(/\\n/g, "").trim(); // Remove extra spaces
    
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: extractedMessage || fullResponse.trim() },
      ]);
    
      setTypingMessage(""); // Clear typing animation
    },
    
      // ✅ Ensure JSON parsing only when response is valid JSON
      
    
}); 
  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, typingMessage]);

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-2xl mx-auto bg-gray-900 text-white">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4 text-center">🤖 AI Chat Assistant</h1>

      {/* Chat Container */}
      <div ref={chatContainerRef} className="w-full h-[500px] overflow-y-auto bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 space-y-3">
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <span className={`inline-block px-3 py-2 max-w-xs text-sm rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-200"}`}>
              {msg.content}
            </span>
          </motion.div>
        ))}

        {/* Typing Effect */}
        {typingMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            className="flex justify-start"
          >
            <span className="inline-block px-3 py-2 max-w-xs text-sm bg-gray-700 text-gray-200 rounded-lg">
              {typingMessage}
            </span>
          </motion.div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="w-full mt-4 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          className="flex-1 p-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask me anything..."
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Send
        </button>
      </form>
    </div>
  );
}
