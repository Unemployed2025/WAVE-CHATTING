import { useState, useEffect } from 'react'
import { friendAPI } from '../../../api/friendRoute'
import { useFriends } from '../../context/FriendContext'

function PendingRequest() {
  const [requests, setRequests] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isAccepting, setIsAccepting] = useState({})
  const { addFriend } = useFriends();

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

  const handleAcceptRequest = async (requestId, senderData) => {
    try {
      setIsAccepting(prev => ({ ...prev, [requestId]: true }));
      await friendAPI.acceptFriendRequest(requestId);
      
      // Add the new friend to the friends list
      addFriend({
        userId: senderData.userId,
        username: senderData.username,
        fullName: senderData.fullName,
        avatarUrl: senderData.avatarUrl,
        isOnline: false,
        lastSeen: new Date().toISOString()
      });

      // Remove from requests
      setRequests(prev => prev.filter(req => req.requestId !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setIsAccepting(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown)

  if (requests.length === 0) return null;

  return (
    <div className="relative mb-2">
      <div className="px-3 py-2 hover:bg-[#202b36] cursor-pointer transition-colors" onClick={toggleDropdown}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white text-sm font-medium">Friend Requests</h3>
              <p className="text-gray-400 text-xs">{requests.length} pending</p>
            </div>
          </div>
          <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {requests.length}
          </div>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 mx-2 bg-[#1f2936] border border-[#2a3441] rounded-lg shadow-lg">
          <div className="max-h-[300px] overflow-y-auto">
            {requests.map(request => (
              <div key={request.requestId} className="p-3 hover:bg-[#242f3d] border-b border-[#2a3441] last:border-0">
                <div className="flex items-center gap-3">
                  <img
                    src={request.sender.avatarUrl || '/default-avatar.png'}
                    alt={request.sender.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-white text-sm font-medium truncate">
                        {request.sender.username}
                      </p>
                      <button
                        onClick={() => handleAcceptRequest(request.requestId, request.sender)}
                        disabled={isAccepting[request.requestId]}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-colors"
                      >
                        {isAccepting[request.requestId] ? (
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Accept
                          </span>
                        ) : (
                          'Accept'
                        )}
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs truncate mt-0.5">
                      {request.sender.fullName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingRequest;