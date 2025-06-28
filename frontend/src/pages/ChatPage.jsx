import { useState, useEffect } from 'react';
import UserList from '../components/UserList.jsx';
import Chat from '../components/Chat.jsx';

function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        } else {
          console.error("Failed to fetch user:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleBack = () => {
    setSelectedChat(null);
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
      {/* Sidebar: User list */}
      {(!isMobile || !selectedChat) && (
        <div className="w-full md:w-80 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 bg-[#0d1117]">
            <h2 className="text-xl font-semibold text-white">Users</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UserList
              currentUserId={currentUser._id}
              onUserSelect={setSelectedChat}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      {(!isMobile || selectedChat) && (
        <div className="flex-1 flex flex-col h-full">
          {selectedChat ? (
            <Chat
              currentUserId={currentUser._id}
              chat={selectedChat}
              isMobile={isMobile}
              onBack={handleBack}
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
