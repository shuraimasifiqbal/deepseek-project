"use client"
import Image from 'next/image'
import React, { useState } from 'react'
import { assets } from "@/assets/assets";
import { useClerk , UserButton } from '@clerk/nextjs';
import { useAppContext } from '@/context/AppContext';
import ChatLabel from '@/components/ChatLabel';

const Sidebar = ({ expand, setExpand }) => {
    const { openSignIn } = useClerk();
    const { user, createNewChat, fetchUserChat, selectedChat } = useAppContext();
    const [openMenu , setOpenMenu] = useState({id: 0 , open : false})

    // Handle new chat click
    const handleNewChat = async () => {
        if (!user) return openSignIn();
        await createNewChat();
        await fetchUserChat(); // ensure the latest chat is selected
    }

    // Rename
    const handleRename = async (chat) => {
      const newName = prompt("Enter new chat name:", chat.name);
      if (!newName || newName.trim() === "") return;

      try {
        const res = await fetch(`/api/chat/${chat._id}/rename`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });

        if (!res.ok) throw new Error("Rename failed");

        await fetchUserChat(); // refresh chat list
      } catch (err) {
        console.error(err);
        alert("Could not rename chat");
      }
    };

    // Delete
    const handleDelete = async (chat) => {
      const confirmed = confirm(`Are you sure you want to delete "${chat.name}"?`);
      if (!confirmed) return;

      try {
        const res = await fetch(`/api/chat/${chat._id}`, { method: "DELETE" });

        if (!res.ok) throw new Error("Delete failed");

        await fetchUserChat(); // refresh chat list
      } catch (err) {
        console.error(err);
        alert("Could not delete chat");
      }
    };

    return (
        <div
          className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50
          max-md:absolute max-md:h-screen
          ${expand ? 'p-4 w-64' : 'md:w-20 w-0 max-md:overflow-hidden'}`}
        >
          {/* TOP SECTION */}
          <div>
            {/* LOGO + TOGGLE */}
            <div className={`flex ${expand ? "flex-row gap-10" : "flex-col items-center gap-8"}`}>
              <Image
                className={expand ? "w-36" : "w-10"}
                src={expand ? assets.logo_text : assets.logo_icon}
                alt=""
              />

              <div
                onClick={() => setExpand(!expand)}
                className="group relative flex items-center justify-center
                hover:bg-gray-500/20 transition-all duration-300
                h-9 w-9 rounded-lg cursor-pointer"
              >
                <Image src={assets.menu_icon} alt="" className="md:hidden" />
                <Image
                  src={expand ? assets.sidebar_close_icon : assets.sidebar_icon}
                  alt=""
                  className="hidden md:block w-7"
                />

                {/* TOOLTIP */}
                <div
                  className={`absolute w-max
                  ${expand ? "left-1/2 -translate-x-1/2 top-12" : "-top-12 left-0"}
                  opacity-0 group-hover:opacity-100 transition
                  bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}
                >
                  {expand ? 'Close Sidebar' : 'Open Sidebar'}
                  <div
                    className={`w-3 h-3 absolute bg-black rotate-45
                    ${expand ? "left-1/2 -top-1.5 -translate-x-1/2" : "left-4 -bottom-1.5"}`}
                  />
                </div>
              </div>
            </div>

            {/* NEW CHAT BUTTON */}
            <button
              onClick={handleNewChat}
              className={`mt-8 flex items-center justify-center cursor-pointer
              ${expand
                ? "bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max"
                : "group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg"
              }`}
            >
              <Image
                className={expand ? "w-6" : "w-7"}
                src={expand ? assets.chat_icon : assets.chat_icon_dull}
                alt=""
              />

              {!expand && (
                <div className="absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition
                bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
                  New Chat
                  <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5" />
                </div>
              )}

              {expand && <p className="text-white font-medium">New Chat</p>}
            </button>

            {/* RECENTS */}
            {expand && (
              <div className="mt-8 text-white/25 text-sm">
                <p className="my-1">Recents</p>
                <ChatLabel openMenu={openMenu} setOpenMenu={setOpenMenu}  onRename={handleRename} // ✅ pass the rename function
      onDelete={handleDelete}/>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION */}
          <div>
            {/* GET APP */}
            <div
              className={`flex items-center cursor-pointer group relative
              ${expand
                ? "gap-2 text-white/80 text-sm p-2.5 border border-primary rounded-lg hover:bg-white/10"
                : "h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg justify-center"
              }`}
            >
              <Image
                className={expand ? "w-5" : "w-6"}
                src={expand ? assets.phone_icon : assets.phone_icon_dull}
                alt=""
              />

              <div
                className={`absolute -top-60 pb-8 ${!expand && "-right-40"}
                opacity-0 group-hover:opacity-100 hidden group-hover:block transition-all`}
              >
                <div className="relative w-max bg-black text-white text-sm p-3 rounded-lg shadow-lg">
                  <Image src={assets.qrcode} alt="" className="w-44" />
                  <p className="text-center mt-2">Scan to get app</p>
                  <div
                    className={`w-3 h-3 absolute bg-black rotate-45
                    ${expand ? "right-1/2" : "left-4"} -bottom-1.5`}
                  />
                </div>
              </div>

              {expand && (
                <>
                  <span>Get App</span>
                  <Image alt="" src={assets.new_icon} />
                </>
              )}
            </div>

            {/* MY PROFILE */}
            <div
              onClick={user ? null : openSignIn}
              className={`flex items-center cursor-pointer text-white/60 text-sm p-2 mt-2
              ${expand
                ? "gap-3 hover:bg-white/10 rounded-lg"
                : "h-10 w-10 mx-auto justify-center hover:bg-gray-500/30 rounded-lg"
              }`}
            >
                {user ? <UserButton /> : <Image src={assets.profile_icon} alt="" className="w-7" />}
                {expand && <span>My Profile</span>}
            </div>
          </div>
        </div>
    )
}

export default Sidebar
