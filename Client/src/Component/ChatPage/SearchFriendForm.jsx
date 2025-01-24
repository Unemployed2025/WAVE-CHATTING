import { useState } from 'react';
import PropTypes from 'prop-types';
import SearchView from './SearchView';
import { friendAPI } from '../../../api/friendRoute';

function SearchFriendForm({onSearchStateChange}) {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchClick = () => {
    setIsSearching(true);
    onSearchStateChange(true);
  };

  const handleBack = () => {
    setIsSearching(false);
    onSearchStateChange(false);
  };


  const handleUserSelect = async (user) => {
    if (!user.isFriend) {
      try {
        await friendAPI.sendFriendRequest(user.userId);
      } catch (error) {
        console.error('Error sending friend request:', error);
      }
    }
    setIsSearching(false);
    onSearchStateChange(false);
  };


  return (
    <div className="px-2 py-2">
      {isSearching ? (
        <SearchView onBack={handleBack} onUserSelect={handleUserSelect} />
      ) : (
        <div 
          onClick={handleSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#242f3d] rounded-lg cursor-pointer hover:bg-[#2b3645] transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-400 text-sm">Search</span>
        </div>
      )}
    </div>
  );
}
SearchFriendForm.propTypes = {
  onSearchStateChange: PropTypes.func.isRequired
};

export default SearchFriendForm;
