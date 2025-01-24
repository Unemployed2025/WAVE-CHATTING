import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { friendAPI } from '../../../api/friendRoute'
import FriendCard from './FriendCard'
import { useFriends } from '../../context/FriendContext'

function FriendGrid({ onFriendSelect, selectedFriend }) {
  const { friends, updateFriends } = useFriends();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await friendAPI.getFriendsList();
        updateFriends(response.friends);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, [updateFriends]);

  return (
    <div className="space-y-2">
      {friends.map(friend => (
        <FriendCard 
          key={friend.userId} 
          friend={friend}
          onSelect={onFriendSelect}
          isSelected={selectedFriend?.userId === friend.userId}
        />
      ))}
    </div>
  );
}

FriendGrid.propTypes = {
  onFriendSelect: PropTypes.func.isRequired,
  selectedFriend: PropTypes.object
}

export default FriendGrid