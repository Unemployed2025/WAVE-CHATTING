import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSocket } from '../../context/SocketContext';
import { messageAPI } from '../../../api/messageRoute';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import debounce from 'lodash/debounce';
import { formatLastSeen } from '../../utils/dateFormatter';

function MessageSpace({ selectedFriend, selectedGroup }) {
  const { socket, currentUserId } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages when selected friend or group changes
  useEffect(() => {
    if (!selectedFriend && !selectedGroup) return;

    const fetchMessages = async () => {
      try {
        let response;
        if (selectedGroup) {
          response = await messageAPI.getGroupMessages(selectedGroup.groupId);
        } else {
          response = await messageAPI.getMessagesBetweenUsers(selectedFriend.userId);
        }
        setMessages(response.messages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Join group chat room if group is selected
    if (selectedGroup && socket) {
      socket.emit('join_group', selectedGroup.groupId);
      return () => socket.emit('leave_group', selectedGroup.groupId);
    }
  }, [selectedFriend, selectedGroup, socket]);

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    try {
      if (selectedGroup) {
        // Send group message
        const response = await messageAPI.sendGroupMessage(selectedGroup.groupId, {
          content: newMessage
        });
        
        socket.emit('group_message', {
          groupId: selectedGroup.groupId,
          message: {
            content: newMessage,
            messageId: response.messageId,
            sender: {
              userId: currentUserId
            }
          }
        });
      } else {
        // Send private message
        socket.emit('private_message', {
          recipientId: selectedFriend.userId,
          message: {
            content: newMessage,
            messageId: Date.now().toString(),
            sender: {
              userId: currentUserId
            }
          }
        });
      }

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Return header based on selected chat type
  const renderHeader = () => {
    if (selectedGroup) {
      return (
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-[#232e3c] bg-[#17212b]">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20">
              <span className="text-blue-400 font-medium">
                {selectedGroup.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-white font-medium">{selectedGroup.name}</h3>
              <p className="text-sm text-gray-400">{selectedGroup.memberCount} members</p>
            </div>
          </div>
        </div>
      );
    }

    return selectedFriend ? (
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
    ) : null;
  };

  return (
    <div className="flex flex-col h-full">
      {(selectedFriend || selectedGroup) ? (
        <>
          {renderHeader()}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#0e1621]">
            {messages.map((message) => (
              <MessageBubble
                key={message.messageId}
                message={message}
                isOwnMessage={message.sender.userId === currentUserId}
              />
            ))}
            {friendTyping && !selectedGroup && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[#17212b] border-t border-[#232e3c]">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${selectedGroup ? selectedGroup.name : selectedFriend.username}...`}
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
    userId: PropTypes.string,
    username: PropTypes.string,
    avatarUrl: PropTypes.string,
    isOnline: PropTypes.bool,
    lastSeen: PropTypes.string
  }),
  selectedGroup: PropTypes.shape({
    groupId: PropTypes.string,
    name: PropTypes.string,
    memberCount: PropTypes.number
  })
};

export default MessageSpace;