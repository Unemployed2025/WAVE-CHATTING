import { useState } from 'react';
import PropTypes from 'prop-types';
import { useFriends } from '../../context/FriendContext';
import { messageAPI } from '../../../api/messageRoute';

function CreateGroupModal({ onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const { friends } = useFriends();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedFriends.length === 0) return;

    setIsCreating(true);
    try {
      const response = await messageAPI.createGroup({
        groupName: groupName.trim(),
        memberIds: selectedFriends
      });

      if (response.success) {
        onGroupCreated(response.groupId);
        onClose();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#17212b] rounded-lg w-full max-w-md p-4 m-4">
        <h2 className="text-xl text-white font-semibold mb-4">Create New Group</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full bg-[#242f3d] text-white px-4 py-2 rounded-lg mb-4"
          />
          
          <div className="max-h-60 overflow-y-auto mb-4">
            {friends.map(friend => (
              <div 
                key={friend.userId}
                onClick={() => toggleFriendSelection(friend.userId)}
                className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg ${
                  selectedFriends.includes(friend.userId) 
                    ? 'bg-blue-500/20' 
                    : 'hover:bg-[#242f3d]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend.userId)}
                  onChange={() => {}}
                  className="w-4 h-4 rounded"
                />
                <img
                  src={friend.avatarUrl || '/default-avatar.png'}
                  alt={friend.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-white">{friend.username}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || selectedFriends.length === 0 || isCreating}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateGroupModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onGroupCreated: PropTypes.func.isRequired
};

export default CreateGroupModal;