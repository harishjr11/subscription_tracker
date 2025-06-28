import { useEffect, useState } from 'react';
import axios from 'axios';

function UsersList({ currentUserId, onUserSelect }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('http://localhost:5500/api/v1/users');
      const filtered = res.data.data.filter(user => user._id !== currentUserId);
      setUsers(filtered);
    };
    fetchUsers();
  }, [currentUserId]);

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
    onUserSelect(res.data); // the chat object
  };

  return (
    <div className="bg-[#161b22] h-full overflow-y-auto">
      <ul className="space-y-2 p-4">
        {users.map(user => (
          <li
            key={user._id}
            onClick={() => handleUserClick(user)}
            className="cursor-pointer px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
          >
            {user.name} <span className="text-gray-400 text-sm">({user.email})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersList;