// src/hooks/useTypingIndicator.js
import { useEffect } from 'react';
import socket from '../socket';

export default function useTypingIndicator(chatId, setTyping) {
  useEffect(() => {
    if (!chatId) return;

    const handleShow = ({ chatId: incomingChatId }) => {
      if (incomingChatId === chatId) {
        setTyping(true);
        if (window.typingTimeout) clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => setTyping(false), 1000);
      }
    };

    const handleHide = () => setTyping(false);

    socket.on('show_typing', handleShow);
    socket.on('hide_typing', handleHide);

    return () => {
      socket.off('show_typing', handleShow);
      socket.off('hide_typing', handleHide);
    };
  }, [chatId, setTyping]);
}
