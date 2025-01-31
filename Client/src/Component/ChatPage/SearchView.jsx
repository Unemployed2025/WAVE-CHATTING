import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { userAPI } from '../../../api/userRoute';
import { friendAPI } from '../../../api/friendRoute';
import debounce from 'lodash/debounce';

function SearchView({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState({});
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await userAPI.searchUsers(query);
        if (response.success && Array.isArray(response.users)) {
          console.log(response);
          setSearchResults(response.users);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleSendRequest = async (userId) => {
    try {
      setPendingActions(prev => ({ ...prev, [userId]: true }));
      await friendAPI.sendFriendRequest(userId);
      setSearchResults(prev =>
        prev.map(user =>
          user.userId === userId
            ? { ...user, isFriend: true }
            : user
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setPendingActions(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    handleSearch(searchQuery);
    return () => handleSearch.cancel();
  }, [searchQuery, handleSearch]);

  return (
    <div className="flex flex-col h-full bg-[#17212b]">
      <div className="flex items-center gap-2 p-2">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-[#232e3c] transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-[#242f3d] text-white pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg 
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y divide-[#232e3c]">
            {searchResults.map(user => (
              <div 
                key={user.userId} 
                className="flex items-center px-4 py-3 hover:bg-[#202b36] transition-colors"
              >
                <img
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-sm font-medium">{user.username}</h3>
                      <p className="text-gray-400 text-xs">{user.fullName}</p>
                    </div>
                    {user.isFriend ? (
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Friends</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user.userId)}
                        disabled={pendingActions[user.userId]}
                        className="text-blue-400 hover:text-blue-300 disabled:text-gray-500"
                      >
                        {pendingActions[user.userId] ? (
                          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.length >= 2 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg className="w-16 h-16 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-sm">Enter at least 2 characters to search</p>
          </div>
        )}
      </div>
    </div>
  );
}

SearchView.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default SearchView;