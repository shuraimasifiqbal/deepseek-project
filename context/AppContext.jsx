"use client"
import { useUser , useAuth } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = ({children}) => {
    const {user} = useUser()
    const {getToken} = useAuth()

    const [chats , setChats] = useState([]);
    const [selectedChat , setSelectedChat] = useState(null);

    const createNewChat = async () => {
        try {
            if(!user)return null;
            
            const token = await getToken()
            await axios.post('/api/chat/create', {}, {headers: {
                Authorization: `Bearer ${token}`
            }})

            fetchUserChat();
        } catch (error) {
            toast.error(error.message)    
        }
    }

    const fetchUserChat = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/chat/get", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          const chatsData = data.data;
          setChats(chatsData);

          if (chatsData.length === 0) {
            await createNewChat();
            return fetchUserChat();
          } else {
            // sort chats by updatedAt descending
            chatsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setSelectedChat(chatsData[0]);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    useEffect(() => {
        if(user){
            fetchUserChat();
        }
    } , [user])
    const value = {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUserChat,
        createNewChat
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
