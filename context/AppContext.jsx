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
         const token = await getToken()
        const {data} =  await axios.get('/api/chat/get', {headers: {
                Authorization: `Bearer ${token}`
            }})

            if(data.success){
                console.log(data.data)
                setChats(data.data)

                // no chats create one
                if(data.data.lenght === 0){
                    await createNewChat();  
                    return fetchUserChat()
                } else {
                    // sort the chats
                    data.data.sort((a , b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    
                    setSelectedChat(data.data[0]);
                    console.log(data.data[0]);
                }
            } else {
                toast.error(data.message)
            }
       } catch (error) {
            toast.error(error.message)
                
       }
    } 
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
