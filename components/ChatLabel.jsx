"use client"
import Image from 'next/image';
import React from 'react';
import { assets } from "@/assets/assets";
import { useAppContext } from '@/context/AppContext';

const ChatLabel = ({ openMenu, setOpenMenu, onRename, onDelete }) => {
  const { chats, selectedChat, setSelectedChat } = useAppContext();

  if (!chats || chats.length === 0)
    return <p className="text-white/50 text-sm mt-2">No chats yet</p>;

  return (
    <div className="flex flex-col gap-2">
      {chats.map(chat => (
        <div
          key={chat._id}
          className={`flex items-center justify-between p-2 text-white/80 rounded-lg text-sm cursor-pointer
            ${selectedChat?._id === chat._id ? 'bg-primary/50' : 'hover:bg-white/10'}
          `}
          onClick={() => setSelectedChat(chat)} // ✅ select chat
        >
          {/* Chat Name */}
          <p className='truncate max-w-[70%]'>{chat.name || "Untitled Chat"}</p>

          {/* Three dots menu */}
          <div className='relative'>
            <div
              className='flex items-center justify-center h-6 w-6 hover:bg-black/80 rounded-lg'
              onClick={(e) => {
                e.stopPropagation(); // Prevent selecting chat
                setOpenMenu(prev => ({
                  chatId: prev.chatId === chat._id && prev.open ? null : chat._id,
                  open: !(prev.chatId === chat._id && prev.open)
                }));
              }}
            >
              <Image
                src={assets.three_dots}
                alt='Menu'
                width={16}
                height={16}
              />
            </div>

            {/* Dropdown menu */}
            {openMenu.chatId === chat._id && openMenu.open && (
              <div className='absolute -right-36 top-6 bg-gray-700 rounded-xl w-max p-2 z-10'>
                <div
                  className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename && onRename(chat);
                  }}
                >
                  <Image src={assets.pencil_icon} alt='Rename' width={16} height={16}/>
                  <p>Rename</p>
                </div>
                <div
                  className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(chat);
                  }}
                >
                  <Image src={assets.delete_icon} alt='Delete' width={16} height={16}/>
                  <p>Delete</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatLabel;
