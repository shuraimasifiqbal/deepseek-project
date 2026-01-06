"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const ChatComponent = ({ isLoading, setIsLoading }) => {
  const { user, chats, setChats, selectedChat, setSelectedChat } = useAppContext();
  const [prompt, setPrompt] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages, typing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const sendPrompt = async () => {
    if (!user) return toast.error("Login to send message");
    if (!selectedChat) return toast.error("Please select a chat first");
    if (isLoading) return toast.error("Wait for previous response");

    const chatId = selectedChat._id;
    const promptCopy = prompt;
    setIsLoading(true);
    setTyping(true);
    setPrompt("");

    const userMessage = { role: "user", content: promptCopy, timestamp: Date.now() };

    // Update UI immediately
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId
          ? { ...chat, messages: [...(chat.messages || []), userMessage] }
          : chat
      )
    );
    setSelectedChat((prev) => ({
      ...prev,
      messages: prev?.messages ? [...prev.messages, userMessage] : [userMessage],
    }));

    // Save user message to DB
    try {
      await axios.post("http://localhost:3000/api/chat/message", {
        chatId,
        message: userMessage,
      });
    } catch (err) {
      toast.error("Failed to save message: " + (err.message || ""));
    }

    // Call AI
    try {
      const { data } = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model: "openai/gpt-3.5-turbo", messages: [{ role: "user", content: promptCopy }] },
        { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}` } }
      );

      const assistantContent = data.choices[0].message.content;
      const assistantMessage = { role: "assistant", content: assistantContent, timestamp: Date.now() };

      // Update UI with AI message
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? { ...chat, messages: [...(chat.messages || []), assistantMessage] }
            : chat
        )
      );
      setSelectedChat((prev) => ({
        ...prev,
        messages: prev?.messages ? [...prev.messages, assistantMessage] : [assistantMessage],
      }));

      // Save AI message to DB
      await axios.post("http://localhost:3000/api/chat/message", {
        chatId,
        message: assistantMessage,
      });
    } catch (err) {
      toast.error("AI Error: " + (err.response?.data?.message || err.message));
    }

    setTyping(false);
    setIsLoading(false);
  };

  // Default input box if no chat selected or selected chat has no messages
  if (!selectedChat || chats.length === 0 || !selectedChat.messages?.length) {
    return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt();
            }}
            className="w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all"
          >
            <textarea
              onKeyDown={handleKeyDown}
              className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white"
              rows={2}
              placeholder="Message Deepseek"
              required
              onChange={(e) => setPrompt(e.target.value)}
              value={prompt}
            />
            <div className="flex items-center justify-between text-sm mt-2">
              <div className="flex items-center gap-2">
                <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
                  <Image className="h-5" src={assets.deepthink_icon} alt="" />
                  DeepThink (R1)
                </p>
                <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
                  <Image className="h-5" src={assets.search_icon} alt="" />
                  Search
                </p>
              </div>
              <button
                type="submit"
                className={`${prompt ? "bg-primary" : "bg-[71717a]"} rounded-full p-2 cursor-pointer`}
              >
                <Image
                  className="w-3.5 aspect-square"
                  src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
                  alt=""
                />
              </button>
            </div>
          </form>
    );
  }

  // Full-screen chat with messages
  return (
    <div className="h-screen w-full flex flex-col bg-[#1c1c1f] rounded-3xl overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {selectedChat.messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl break-words ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
            >
              {msg.content}
              <div className="text-xs text-gray-400 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="max-w-[30%] px-4 py-2 bg-gray-600 rounded-2xl text-white animate-pulse">
              DeepThink is typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendPrompt();
        }}
        className="p-4 bg-[#404045] flex flex-col gap-2"
      >
        <textarea
          onKeyDown={handleKeyDown}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="Message Deepseek"
          className="outline-none w-full resize-none bg-transparent text-white px-3 py-2 rounded-xl"
          required
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
              <Image className="h-5" src={assets.deepthink_icon} alt="" />
              DeepThink (R1)
            </p>
            <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
              <Image className="h-5" src={assets.search_icon} alt="" />
              Search
            </p>
          </div>
          <button type="submit" className={`${prompt ? "bg-primary" : "bg-[71717a]"} rounded-full p-2`}>
            <Image className="w-3.5 aspect-square" src={prompt ? assets.arrow_icon : assets.arrow_icon_dull} alt="" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
