import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { friendAPI } from "../../../api/friendRoute";
import FriendCard from "./FriendCard";
import { useFriends } from "../../context/FriendContext";
import CreateGroupModal from "./CreateGroupModel";
function FriendGrid({ onFriendSelect, selectedFriend }) {
  const { friends, updateFriends } = useFriends();
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await friendAPI.getFriendsList();
        updateFriends(response.friends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [updateFriends]);

  const handleGroupCreated = (groupId) => {
    // You might want to refresh the groups list or navigate to the new group
    console.log("Group created:", groupId);
  };

  return (
    <div>
      <div className="px-4 py-2">
        <button
          onClick={() => setShowCreateGroup(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Group
        </button>
      </div>

      <div className="space-y-2">
        {friends.map((friend) => (
          <FriendCard
            key={friend.userId}
            friend={friend}
            onSelect={onFriendSelect}
            isSelected={selectedFriend?.userId === friend.userId}
          />
        ))}
      </div>
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}

FriendGrid.propTypes = {
  onFriendSelect: PropTypes.func.isRequired,
  selectedFriend: PropTypes.object,
};

export default FriendGrid;
