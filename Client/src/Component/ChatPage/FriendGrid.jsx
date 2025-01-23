import { useState, useEffect } from 'react'
import { friendAPI } from '../../../api/friendRoute'
import FriendCard from './FriendCard'

function FriendGrid() {
  const [friends, setFriends] = useState([])

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        console.log('Fetching friends list')
        const response = await friendAPI.getFriendsList()
        console.log('Friends list:', response.friends)
        setFriends(response.friends)
      } catch (error) {
        console.error('Error fetching friends:', error)
      }
    }

    fetchFriends()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {friends.map(friend => (
        <FriendCard key={friend.userId} friend={friend} />
      ))}
    </div>
  )
}

export default FriendGrid