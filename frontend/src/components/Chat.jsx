// -------------------- Chat Component - FIXED VERSION --------------------
import { useEffect, useState, useRef } from 'react';
import socket from '../socket';
import './Chat.css';
import useTypingIndicator from '../hooks/useTypingIndicator.js';

function Chat({ currentUserId, chat, onBack, isMobile, setChats }) {
  const chatId = chat?._id;
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [username, setUsername] = useState('');
  const chatBoxRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    socket.on('typing', ({ senderId }) => {
      if (senderId !== currentUserId) {
        setTypingUsers(prev => [...new Set([...prev, senderId])]);
      }
    });

    socket.on('stop_typing', ({ senderId }) => {
      setTypingUsers(prev => prev.filter(id => id !== senderId));
    });

    return () => {
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, []);

    const handleInputChange = (e) => {
    setMessages(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit('typing', { chatId: chat._id, senderId: currentUserId });
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stop_typing', { chatId: chat._id, senderId: currentUserId });
      setTyping(false);
    }, 1500);
  };


  // -------------------- Auto Scroll Logic --------------------
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // -------------------- Fetch Previous Messages --------------------
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/messages/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: 'include'
        });

        const data = await res.json();

        const normalized = data.map((msg) => ({
          _id: msg._id,
          from: msg.sender?._id || msg.sender,
          text: msg.content,
          timestamp: msg.timestamp,
          isSeen: msg.isSeen || false, // This will be true now from backend
          type: msg.type || 'text',
          metadata: msg.metadata || null,
          subscriptionData: msg.subscriptionData || null,
        }));

        setMessages(normalized);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    if (chatId) fetchMessages();
  }, [chatId]);

  // -------------------- Mark Messages as Seen When Chat Opens --------------------
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    // Emit socket event to mark messages as seen
    socket.emit('mark_seen', { chatId, userId: currentUserId });
  }, [chatId, currentUserId]);

  // -------------------- Typing Indicator Logic --------------------
  const handleTyping = () => {
    socket.emit('typing', { chatId, senderId: currentUserId });
    if (window.typingTimeout) clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit('stop_typing', { chatId, senderId: currentUserId });
    }, 2000);
  };

  useTypingIndicator(chatId, setTyping);

  // -------------------- Socket Handling Logic --------------------
  useEffect(() => {
    if (chatId) socket.emit('join', chatId);

    // Handle when messages are marked as seen
    socket.on("messages_seen", ({ chatId: seenChatId, seenBy }) => {
      if (seenChatId !== chatId) return;
      
      // Update messages sent by current user to show as seen
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.from === currentUserId && !msg.isSeen) { 
            return {...msg, isSeen: true}; 
          } 
          return msg;
        })
      );

        setChats(prev =>
          prev.map(chat =>
            chat._id === seenChatId
              ? { ...chat, unseenCount: 0 }
              : chat
          )
        );
    });

    // Handle receiving new messages
    socket.on('receive_message', (data) => {
      const senderId = data.sender?._id || data.sender || data.from;
      if (senderId === currentUserId) return;

      const normalizedMessage = {
        _id: data._id,
        from: senderId,
        timestamp: data.timestamp,
        isSeen: false, // New incoming messages start as unseen
        type: data.type || 'text',
        metadata: data.metadata || null,
        subscriptionData: data.subscriptionData || null,
        ...(data.type === 'image'
          ? { content: data.content, text: data.content }
          : { text: data.content })
      };

      setMessages(prev => [...prev, normalizedMessage]);
      
      // Immediately mark this new message as seen since user is viewing the chat
      setTimeout(() => {
        socket.emit('mark_seen', { chatId, userId: currentUserId });
      }, 100);
    });

    socket.on("typing", ({ chatId: incomingChatId }) => {
      if (incomingChatId === chatId) {
        setTyping(true);
        if (window.typingTimeout) clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.off('messages_seen');
      socket.off('receive_message');
      socket.off('typing');
      socket.emit('leave', chatId);
    };
  }, [chatId, currentUserId]);

  // -------------------- Send Message Logic --------------------
  const sendMessage = ({ type = 'text', content, metadata = null, subscriptionData = null }) => {
    if (!content || content.trim() === '') return;

    const tempId = Date.now().toString();

    const message = {
      _id: tempId,
      sender: currentUserId,
      from: currentUserId,
      chatId,
      type,
      content,
      metadata,
      subscriptionData,
      timestamp: new Date()
    };

    socket.emit('send_message', message);

    const normalizedMessage = {
      _id: tempId,
      from: currentUserId,
      timestamp: message.timestamp,
      isSeen: false,
      type: message.type,
      metadata: message.metadata,
      subscriptionData: message.subscriptionData,
      ...(message.type === 'image'
        ? { content: message.content, text: message.content }
        : { text: message.content })
    };

    setMessages(prev => [...prev, normalizedMessage]);

    if (type === 'text') setText('');
  };

  // -------------------- Fetch Other User's Name --------------------
  useEffect(() => {
    const fetchUsername = async () => {
      if (!chat || !currentUserId) return;
      const otherUserId = chat.members.find(id => id !== currentUserId);
      if (!otherUserId) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });

        const data = await res.json();
        setUsername(data.username || 'Unknown User');
      } catch (err) {
        console.error("Failed to fetch username", err);
      }
    };

    fetchUsername();
  }, [chat, currentUserId]);

  // -------------------- Message Render Logic --------------------
  const renderMessage = (msg) => {
    const isMine = msg.from === currentUserId;

    if (msg.type === 'subscription' && msg.subscriptionData) {
      const subData = msg.subscriptionData;
      return (
        <div className={`subscription-card ${isMine ? 'my-subscription' : 'their-subscription'}`}>
          <div className="subscription-header">
            <div className="service-icon">{subData?.name?.charAt(0) || 'S'}</div>
            <div className="service-info">
              <h3>{subData?.name || 'Subscription'}</h3>
              <p>{subData?.date || 'No date'}</p>
            </div>
          </div>
          <div className="subscription-footer">
            <span className="price">${subData?.price || '0.00'}</span>
            <span className={`status ${subData?.status?.toLowerCase() || 'active'}`}>
              {subData?.status || 'Active'}
            </span>
          </div>
        </div>
      );
    }

    if (msg.type === 'image' || msg.text?.startsWith("data:image/")) {
      return (
        <div>
          <img
            src={msg.text || msg.content}
            alt="shared"
            className="shared-image"
            style={{ maxWidth: '200px', borderRadius: '8px' }}
          />
          {msg.metadata?.name && (
            <div className="image-metadata">
              {msg.metadata.name} - ${msg.metadata.price}
            </div>
          )}
        </div>
      );
    }

    return <div className="message-text">{msg.text || msg.content || 'Empty message'}</div>;
  };

  // -------------------- Final JSX --------------------
  return (
    <div className="chat-container" style={{ height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {isMobile && (
        <div className="mobile-header" style={{ flexShrink: 0 }}>
          <button onClick={onBack} className="back-button">← Back</button>
          <h2 className="chat-title">{username}</h2>
        </div>
      )}

      <div
        ref={chatBoxRef}
        className="chat-box"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          paddingBottom: '2rem',
          backgroundColor: '#0d1117',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        {[...messages]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .map((msg, idx, arr) => {
            const isMine = msg.from === currentUserId;
            const lastSeenMyMsgIndex = arr.map((m, i) => (m.from === currentUserId && m.isSeen ? i : -1)).filter(i => i !== -1).pop();
            const isLastMyMsg = isMine && idx === lastSeenMyMsgIndex;

            return (
              <div
                key={msg._id || idx}
                className={`message ${isMine ? 'my-msg' : 'their-msg'}`}
                style={{ marginBottom: idx === arr.length - 1 ? '1.5rem' : '0' }}
              >
                {renderMessage(msg)}

                {isLastMyMsg && msg.isSeen && (
                  <span className="seen-indicator">✓ Seen</span>
                )}
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-400 px-4 py-2 italic">
              Someone is typing...
            </div>
          )}


        {typing && (
          <div className="typing-indicator" style={{
            fontStyle: 'italic',
            color: '#aaa',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            maxWidth: '60%',
            backgroundColor: '#21262d',
            alignSelf: 'flex-start',
          }}>
            Typing...
          </div>
        )}

        <div style={{ height: '20px', flexShrink: 0 }}></div>
      </div>

      <div className="input-area" style={{
        display: 'flex',
        padding: '1rem',
        gap: '0.75rem',
        backgroundColor: '#161b22',
        borderTop: '1px solid #30363d',
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 5
      }}>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage({ content: text });
            }
          }}
          placeholder="Type a message..."
          className="message-input"
          style={{
            flex: 1,
            backgroundColor: '#21262d',
            color: '#e6edf3',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        <button
          onClick={() => sendMessage({ content: text })}
          disabled={!text.trim()}
          className="send-button"
          style={{
            backgroundColor: text.trim() ? '#238636' : '#30363d',
            color: text.trim() ? 'white' : '#7d8590',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: '600',
            cursor: text.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;