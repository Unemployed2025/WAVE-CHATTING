import { useState, useEffect, useCallback } from 'react'
import { userAPI } from '../../../api/userRoute'
import { friendAPI } from '../../../api/friendRoute'
import debounce from 'lodash/debounce'

function SearchFriendForm() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sendingRequest, setSendingRequest] = useState({})

  const handleSendRequest = async (userId) => {
    try {
      setSendingRequest(prev => ({ ...prev, [userId]: true }))
      console.log('Sending friend request to:', userId)
      await friendAPI.sendFriendRequest(userId)

      // Update the user's status in search results
      setSearchResults(prev =>
        prev.map(user =>
          user.userId === userId
            ? { ...user, requestSent: true }
            : user
        )
      )
    } catch (error) {
      console.error('Error sending request:', error)
      setError('Failed to send friend request')
    } finally {
      setSendingRequest(prev => ({ ...prev, [userId]: false }))
    }
  }

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await userAPI.searchUsers(searchQuery)
        console.log('Search results:', response.users)
        setSearchResults(response.users)
      } catch (error) {
        console.error('Search error:', error)
        setError('Failed to search users')
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
    return () => debouncedSearch.cancel()
  }, [query, debouncedSearch])

  return (
    <div className="w-full relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search friends..."
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {query.length >= 2 && (searchResults.length > 0 || isLoading || error) && (
        <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border max-h-60 overflow-y-auto z-50">
          {error && (
            <div className="p-3 text-red-500 text-sm">{error}</div>
          )}
          {searchResults.map(user => (
            <div
              key={user.userId}
              className="p-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
            >
              <img
                src={user.avatarUrl || '/default-avatar.png'}
                alt={user.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-gray-500">{user.fullName}</div>
              </div>
              {user.isFriend ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Friend
                </span>
              ) : user.requestSent ? (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Request Sent
                </span>
              ) : (
                <button
                  onClick={() => handleSendRequest(user.userId)}
                  disabled={sendingRequest[user.userId]}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                >
                  {sendingRequest[user.userId] ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : (
                    'Add Friend'
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchFriendForm