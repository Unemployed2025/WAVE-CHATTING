import { useState, useEffect } from 'react'
import { friendAPI } from '../../../api/friendRoute'

function PendingRequest() {
  const [requests, setRequests] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isAccepting, setIsAccepting] = useState({})

  const fetchPendingRequests = async () => {
    try {
      console.log('Fetching pending requests')
      const response = await friendAPI.getPendingRequests()
      console.log('Pending requests:', response.pendingRequests)
      setRequests(response.pendingRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const handleAcceptRequest = async (requestId) => {
    try {
      setIsAccepting(prev => ({ ...prev, [requestId]: true }))
      await friendAPI.acceptFriendRequest(requestId)
      // Remove accepted request from the list
      setRequests(prev => prev.filter(req => req.requestId !== requestId))
    } catch (error) {
      console.error('Error accepting request:', error)
    } finally {
      setIsAccepting(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const toggleDropdown = () => setShowDropdown(!showDropdown)

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm rounded-full hover:opacity-90 transition-opacity"
      >
        <span>Requests</span>
        {requests.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {requests.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold">Friend Requests</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No pending requests
              </div>
            ) : (
              requests.map(request => (
                <div key={request.requestId} className="p-3 border-b last:border-b-0 flex items-center gap-3">
                  <img
                    src={request.sender.avatarUrl || '/default-avatar.png'}
                    alt={request.sender.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{request.sender.username}</div>
                    <div className="text-sm text-gray-500">{request.sender.fullName}</div>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(request.requestId)}
                    disabled={isAccepting[request.requestId]}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
                  >
                    {isAccepting[request.requestId] ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Accepting...
                      </span>
                    ) : (
                      'Accept'
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingRequest