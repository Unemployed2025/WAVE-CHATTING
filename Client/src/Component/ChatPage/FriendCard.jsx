import PropTypes from 'prop-types'

function FriendCard({ friend }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
      <div className="relative">
        <img
          src={friend.avatarUrl || '/default-avatar.png'}
          alt={friend.username}
          className="w-12 h-12 rounded-full border-2 border-gray-200"
        />
        <span 
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
            friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{friend.username}</h3>
        <p className="text-sm text-gray-500 truncate">
          {friend.fullName || 'No status'}
        </p>
      </div>
    </div>
  )
}

FriendCard.propTypes = {
  friend: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    fullName: PropTypes.string,
    avatarUrl: PropTypes.string,
    isOnline: PropTypes.number
  }).isRequired
}

export default FriendCard