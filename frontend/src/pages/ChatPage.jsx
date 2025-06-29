import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import UserList from '../components/UserList.jsx';
import Chat from '../components/Chat.jsx';

const socket = io('http://localhost:5500'); // make sure this is consistent with your backend

function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chats, setChats] = useState([]);
  const [typingMap, setTypingMap] = useState({});

  useEffect(() => {
    socket.on('typing', ({ chatId }) => {
      setTypingMap(prev => ({ ...prev, [chatId]: true }));
    });

    socket.on('stop_typing', ({ chatId }) => {
      setTypingMap(prev => ({ ...prev, [chatId]: false }));
    });

    return () => {
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, []);

  // ✅ Add this useEffect here to listen to new_message and update sidebar
  useEffect(() => {
    console.log("👀 Socket listener setup triggered. currentUser:", currentUser);
    if (!currentUser) return;
    
    socket.on('new_message', ({ updatedChat, unseenCount, forUser }) => {
      console.log("🔥 new_message received:", updatedChat);
      console.log("📊 Unseen Count:", unseenCount);

      if (forUser && forUser !== currentUser._id.toString()) return; // Only update if this is for *me*

      setChats((prevChats) => {
        const updatedIndex = prevChats.findIndex(chat => chat._id === updatedChat._id);
        
        if (updatedIndex === -1) {
          // Chat not found, add it
          return [{ ...updatedChat, unseenCount }, ...prevChats];
        }

        const updatedChats = [...prevChats];
        const oldChat = updatedChats[updatedIndex];
        console.log("🔁 Updating chat preview for:", updatedChat._id);

        updatedChats[updatedIndex] = {
          ...oldChat,
          latestMessage: updatedChat.latestMessage,
          unseenCount: typeof unseenCount === 'number' ? unseenCount : oldChat.unseenCount ?? 0,
          updatedAt: updatedChat.updatedAt, // force re-render
        };
        console.log("✅ updated sidebar chats:", updatedChats[updatedIndex]);
        return updatedChats;
      });

      // Join room if not joined already
      if (updatedChat?._id) {
        socket.emit('join', updatedChat._id);
        console.log("✅ Joined socket room:", updatedChat._id);
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, [currentUser?._id]);

  const joinedRooms = new Set();

  useEffect(() => {
    chats.forEach(chat => {
      if (!joinedRooms.has(chat._id)) {
        socket.emit('join', chat._id);
        joinedRooms.add(chat._id);
        console.log("✅ Joined socket room:", chat._id);
      }
    });
  }, [chats]);

  // ✅ Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch user and connect to socket
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:5500/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
          // ✅ ADDED: Identify user to socket after login
          socket.emit('user_connected', data.user._id);
          console.log("✅ User connected to socket:", data.user._id);
        } else {
          console.error("Failed to fetch user:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // ✅ Fetch chats on load
  useEffect(() => {
    const fetchChats = async () => {
      const res = await axios.get('http://localhost:5500/api/v1/chats', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setChats(res.data);
    };
    fetchChats();
  }, []);

  const handleBack = async () => {
  setSelectedChat(null);
  
  // ✅ ADDED: Force refresh chats when going back to sidebar in mobile
  if (isMobile) {
    try {
      const res = await axios.get('http://localhost:5500/api/v1/chats', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setChats(res.data);
      console.log("🔄 Refreshed chats on mobile back:", res.data);
    } catch (error) {
      console.error("Error refreshing chats:", error);
    }
  }
};

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center text-white h-screen bg-[#0d1117]">
        Loading user...
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 bg-[#0d1117] text-white">
      {(!isMobile || !selectedChat) && (
        <div className="w-full md:w-80 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 bg-[#0d1117]">
            <h2 className="text-xl font-semibold text-white">Users</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UserList
              currentUserId={currentUser._id}
              onUserSelect={setSelectedChat}
              chats={chats}
              typingMap={typingMap}
            />
          </div>
        </div>
      )}

      {(!isMobile || selectedChat) && (
        <div className="flex-1 flex flex-col h-full">
          {selectedChat ? (
            <Chat
              currentUserId={currentUser._id}
              chat={selectedChat}
              isMobile={isMobile}
              onBack={handleBack}
              socket={socket}
              setChats={setChats}
            />
          ) : (
            !isMobile && (
              <p className="flex-1 flex items-center justify-center text-gray-400">
                Select a user to start chatting
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default ChatPage;