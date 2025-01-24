import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSocket } from '../../context/SocketContext';
import { messageAPI } from '../../../api/messageRoute';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import debounce from 'lodash/debounce';
import { formatLastSeen } from '../../utils/dateFormatter';

function MessageSpace({ selectedFriend }) {
  const { socket, currentUserId } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const debouncedTyping = useCallback(
    debounce((isTyping) => {
      if (socket && selectedFriend) {
        socket.emit('typing', {
          recipientId: selectedFriend.userId,
          isTyping
        });
      }
    }, 300),
    [socket, selectedFriend]
  );

  const stopTyping = useCallback(() => {
    if (socket && selectedFriend) {
      socket.emit('typing', {
        recipientId: selectedFriend.userId,
        isTyping: false
      });
      setIsTyping(false);
    }
  }, [socket, selectedFriend]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
      debouncedTyping.cancel();
    };
  }, [selectedFriend, stopTyping, debouncedTyping]);

  useEffect(() => {
    if (!selectedFriend) return;

    const fetchMessages = async () => {
      try {
        const response = await messageAPI.getMessagesBetweenUsers(selectedFriend.userId);
        setMessages(response.messages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedFriend]);

  useEffect(() => {
    if (!socket || !selectedFriend) return;

    const handleReceiveMessage = (message) => {
      if (message.sender.userId === selectedFriend.userId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ userId, isTyping }) => {
      if (userId === selectedFriend.userId) {
        setFriendTyping(isTyping);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, selectedFriend]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!isTyping) {
      setIsTyping(true);
      debouncedTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedFriend) return;

    const messageData = {
      content: newMessage,
      messageId: Date.now().toString(),
      sender: {
        userId: currentUserId
      },
      createdAt: new Date().toISOString()
    };

    socket.emit('private_message', {
      recipientId: selectedFriend.userId,
      message: messageData
    });

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
    stopTyping();
    scrollToBottom();
  };

  return (
    <div className="flex flex-col h-full">
      {selectedFriend ? (
        <>
          {/* Chat Header */}
          <div className="h-[60px] px-4 flex items-center border-b border-[#232e3c] bg-[#17212b]">
            <div className="flex items-center">
              <img
                src={selectedFriend.avatarUrl || '/default-avatar.png'}
                alt={selectedFriend.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <h3 className="text-white font-medium">{selectedFriend.username}</h3>
                <p className="text-sm text-gray-400">
                  {selectedFriend.isOnline ? 'online' : formatLastSeen(selectedFriend.lastSeen)}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#0e1621]">
            {messages.map((message) => (
              <MessageBubble
                key={message.messageId}
                message={message}
                isOwnMessage={message.sender.userId === currentUserId}
              />
            ))}
            {friendTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-[#17212b] border-t border-[#232e3c]">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Write a message..."
                className="flex-1 bg-[#242f3d] text-white px-4 py-2 rounded-lg border border-[#232e3c] focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}

MessageSpace.propTypes = {
  selectedFriend: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    isOnline: PropTypes.number,
    lastSeen: PropTypes.string
  })
};

export default MessageSpace;