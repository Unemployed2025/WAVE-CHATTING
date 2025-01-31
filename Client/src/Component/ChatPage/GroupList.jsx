import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { messageAPI } from '../../../api/messageRoute';

function GroupsList({ onGroupSelect }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await messageAPI.getGroups();
        setGroups(response.groups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="mb-4">
      <h3 className="px-4 py-2 text-sm font-medium text-gray-400">Groups</h3>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-1">
          {groups.map(group => (
            <div
              key={group.groupId}
              onClick={() => onGroupSelect(group)}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#202b36] transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20">
                <span className="text-blue-400 font-medium">
                  {group.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-white text-sm font-medium">{group.name}</p>
                <p className="text-gray-400 text-xs">{group.memberCount} members</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

GroupsList.propTypes = {
  onGroupSelect: PropTypes.func.isRequired
};

export default GroupsList;