import { useState,useEffect } from "react";
import axios from "axios";

function UsersList({ currentUserId, onUserSelect, chats, typingMap }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('http://localhost:5500/api/v1/users');
      const filtered = res.data.data.filter(user => user._id !== currentUserId);
      setUsers(filtered);
    };
    fetchUsers();
  }, [currentUserId]);


const getChatForUser = (userId) => {
  return chats?.find(chat =>
    chat?.members?.some(member =>
      (typeof member === 'object' ? member._id : member)?.toString() === userId.toString()
    )
  );
};


// const chat = getChatForUser(users._id);
// const latest = chat?.latestMessage;


// console.log("👀 Sidebar Chat Preview:", {
//   user: users.name,
//   latest,
//   unseen: chat?.unseenCount,
// });



const getLatestForUser = (userId) => {
  const chat = getChatForUser(userId);
  return chat?.latestMessage;
};
  

  const handleUserClick = async (user) => {
    const res = await axios.post(
      'http://localhost:5500/api/v1/chats',
      { userId: user._id },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    onUserSelect(res.data);
  };

  useEffect(() => {
  console.log("👀 UserList chats updated:", chats);
}, [chats]);


  return (
    <div className="bg-[#161b22] h-full overflow-y-auto">
      <ul className="space-y-2 p-4">
      {users.map(user => {
        const chat = getChatForUser(user._id);

        const latest = chat?.latestMessage;
        const isTyping = chat && typingMap[chat._id];
        const isMine = latest?.sender?._id?.toString() === currentUserId.toString();

        return (
          <li
            key={user._id}
            onClick={() => handleUserClick(user)}
            className="cursor-pointer px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
          >
            <div className="flex justify-between">
              <div>
                {user.name} <span className="text-gray-400 text-sm">({user.email})</span>
                <div className="text-sm mt-1 text-gray-300">
                  {isTyping ? (
                    <span className="text-blue-400 italic">typing...</span>
                  ) : latest ? (
                    <>
                      {isMine && 'You: '}
                      {latest.type === 'image' ? '[📷 Image]' : latest.content}
                    </>
                  ) : (
                    <i className="text-gray-500">No messages yet</i>
                  )}
                </div>
                {chat?.unseenCount > 0 && !isMine && (
                  <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full inline-block mt-1">
                    {chat.unseenCount}
                  </span>
                )}
              </div>

              {isMine && latest?.isSeen && (
                <span className="text-xs text-green-400 self-end">✓ Seen</span>
              )}
            </div>
          </li>
        );
      })}

      </ul>
    </div>
  );
}
 export default UsersList;
