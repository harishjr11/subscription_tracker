// src/components/Chat.jsx - Fixed message rendering
import { useEffect, useState, useRef } from 'react';
import socket from '../socket';
import './Chat.css';
import { getUser } from '../../../backend/controllers/user.controller.js';

function Chat({ currentUserId, chat, onBack, isMobile }) {
  const chatId = chat?._id;
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as seen
  useEffect(() => {
    if (!chatId) return;
    socket.emit('mark_seen', { chatId, userId: currentUserId });
  }, [chatId]);

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5500/api/v1/messages/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        
        const normalized = data.map((msg) => ({
          from: msg.sender?._id || msg.sender,
          text: msg.content,
          timestamp: msg.timestamp,
          seen: msg.seen || false,
          type: msg.type || 'text',
          metadata: msg.metadata || null,
          subscriptionData: msg.subscriptionData || null,
        }));
        
        setMessages(normalized);
        console.log("Messages in state:", normalized);

        const unseenMessageIds = data
          .filter(msg => msg.sender !== currentUserId && msg.seen === false)
          .map(msg => msg._id);

        if (unseenMessageIds.length > 0) {
          try {
            await fetch('http://localhost:5500/api/v1/messages/mark-seen', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ messageIds: unseenMessageIds }),
            });
          } catch (err) {
            console.error("Error marking messages as seen:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    if (chatId) fetchMessages();
  }, [chatId, currentUserId]);

  // Handle typing
  const handleTyping = () => {
    socket.emit('typing', { chatId, senderId: currentUserId });

    if (window.typingTimeout) clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit('stop_typing', { chatId, senderId: currentUserId });
    }, 2000);
  };

  // Socket event listeners
  useEffect(() => {
    socket.on('show_typing', () => {
      console.log('🔵 Received show_typing');
      setTyping(true);
    });
    socket.on('hide_typing', () => setTyping(false));

    return () => {
      socket.off('show_typing');
      socket.off('hide_typing');
    };
  }, []);

  // Real-time message handling
  useEffect(() => {
    if (chatId) {
      socket.emit('join', chatId);
    }

    socket.on("messages_seen", ({ chatId: seenChatId, seenBy }) => {
      if (seenChatId !== chatId) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.from === currentUserId ? { ...msg, seen: true } : msg
        )
      );
    });

    socket.on('receive_message', (data) => {
  const senderId = data.sender?._id || data.sender;
  console.log("📩 Received from socket:", data);


  console.log('📥 Socket received:', data);
  console.log('🆔 currentUserId:', currentUserId);
  console.log('🆔 data.sender:', data.sender);

  if (data.sender === currentUserId) {
    console.log('⛔ Ignored own message');
    return;
  }
    
  if (data.sender === currentUserId) return;

  // 💥 Prevent processing your own message again
  if (senderId === currentUserId) return;

  const normalizedMessage = {
    _id: data._id,
    from: senderId,
    timestamp: data.timestamp,
    seen: data.seen || false,
    type: data.type || 'text',
    metadata: data.metadata || null,
    subscriptionData: data.subscriptionData || null,
    ...(data.type === 'image'
      ? { content: data.content }
      : { text: data.content })
  };

  setMessages((prev) => [...prev, normalizedMessage]);
});

    socket.on("typing", ({ chatId: incomingChatId }) => {
      if (incomingChatId === chatId) {
        setTyping(true);
        if (window.typingTimeout) clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => setTyping(false), 1500);
      }
    });

    return () => {
      socket.off('messages_seen');
      socket.off('receive_message');
      socket.off('typing');
      socket.emit('leave', chatId);
    };
  }, [chatId, currentUserId]);

  // Send message function
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
      seen: false,
      type: message.type,
      metadata: message.metadata,
      subscriptionData: message.subscriptionData,
      ...(message.type === 'image'
        ? { content: message.content }
        : { text: message.content })
    };

    setMessages((prev) => [...prev, normalizedMessage]);

    if (type === 'text') setText('');
  };

  // FIXED: Enhanced message rendering function
  const renderMessage = (msg) => {
    const isMine = msg.from === currentUserId;
    


    // Handle subscription card messages - ONLY if type is explicitly 'subscription' AND has subscriptionData
    if (msg.type === 'subscription' && msg.subscriptionData) {
      const subData = msg.subscriptionData;
      return (
        <div className={`subscription-card ${isMine ? 'my-subscription' : 'their-subscription'}`}>
          <div className="subscription-header">
            <div className="service-icon">
              {subData?.name?.charAt(0) || 'S'}
            </div>
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

    // Handle image messages
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

    // Handle regular text messages - THIS IS THE DEFAULT CASE
    return (
      <div className="message-text">
        {msg.text || msg.content || 'Empty message'}
      </div>
    );
  };

  const [username, setUsername] = useState('');


  useEffect(() => {
  const fetchUsername = async () => {
    if (!chat || !currentUserId) return;
   

    const otherUserId = chat.members.find(id => id !== currentUserId);
    if (!otherUserId) return;
     console.log(otherUserId)

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5500/api/v1/users/${otherUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Username:", data.username);
      setUsername(data.username || 'Unknown User');
    } catch (err) {
      console.error("Failed to fetch username", err);
    }
  };

    fetchUsername();
}, [chat, currentUserId]);


  return (
    <div className="chat-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Mobile Back Button */}
      {isMobile && (
        <div className="mobile-header" style={{ flexShrink: 0 }}>
          <button onClick={onBack} className="back-button">
            ← Back
          </button>
          <h2 className="chat-title">{username}</h2>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={chatBoxRef} 
        className="chat-box"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1rem',
          paddingBottom: '2rem', // Extra padding at bottom to prevent overlap
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
            const lastMyMsgIndex = arr
              .map((m, i) => (m.from === currentUserId ? i : -1))
              .filter(i => i !== -1)
              .pop();
            const isLastMyMsg = isMine && idx === lastMyMsgIndex;

            return (
              <div
                key={idx}
                className={`message ${isMine ? 'my-msg' : 'their-msg'}`}
                style={{ 
                  marginBottom: idx === arr.length - 1 ? '1.5rem' : '0' // Extra margin for last message
                }}
              >
                {renderMessage(msg)}
                {isLastMyMsg && msg.seen && (
                  <span className="seen-indicator">✓ Seen</span>
                )}
              </div>
            );
          })}
        
        {/* Spacer div to ensure last message is never hidden */}
        <div style={{ height: '20px', flexShrink: 0 }}></div>
      </div>

      {/* Typing Indicator */}
      {typing && (
        <div 
          className="typing-indicator"
        >
          Typing...
        </div>
      )}

      {/* Input Area - FORCE VISIBLE */}
      <div 
        className="input-area" 
        style={{
          display: 'flex',
          padding: '1rem',
          gap: '0.75rem',
          backgroundColor: '#161b22',
          borderTop: '1px solid #30363d',
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          zIndex: 100
        }}
      >
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