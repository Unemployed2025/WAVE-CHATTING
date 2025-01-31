import PropTypes from 'prop-types';
import { formatLastSeen } from '../../utils/dateFormatter';

function FriendCard({ friend, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(friend)}
      className={`flex items-center px-4 py-3 cursor-pointer hover:bg-[#202b36] transition-colors
        ${isSelected ? 'bg-[#2b5278]' : ''}`}
    >
      <div className="relative">
        <img
          src={friend.avatarUrl || '/default-avatar.png'}
          alt={friend.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        {friend.isOnline == 1 ? (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-teal-400 border-2 border-[#17212b]" />
        ) :
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-gray-400 border-2 border-[#17212b]" />
        }
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="font-medium text-white truncate">{friend.username}</h3>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {friend.isOnline ? 'online' : formatLastSeen(friend.lastSeen)}
          </span>
        </div>
        <p className="text-sm text-gray-400 truncate mt-0.5">
          {friend.lastMessage || 'No messages yet'}
        </p>
      </div>
    </div>
  );
}

FriendCard.propTypes = {
  friend: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    fullName: PropTypes.string,
    avatarUrl: PropTypes.string,
    isOnline: PropTypes.bool,
    lastSeen: PropTypes.string,
    lastMessage: PropTypes.string
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool
}

export default FriendCard