import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const FriendContext = createContext();

export function FriendProvider({ children }) {
  const [friends, setFriends] = useState([]);

  const updateFriends = useCallback((newFriends) => {
    setFriends(newFriends);
  }, []);

  const addFriend = useCallback((newFriend) => {
    setFriends(prev => [...prev, newFriend]);
  }, []);

  return (
    <FriendContext.Provider value={{ friends, updateFriends, addFriend }}>
      {children}
    </FriendContext.Provider>
  );
}

export const useFriends = () => useContext(FriendContext);

FriendProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
