import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { userAPI } from "../../api/userRoute"
import SearchFriendForm from "../Component/ChatPage/SearchFriendForm"
import PendingRequest from "../Component/ChatPage/PendingRequest"
import FriendGrid from "../Component/ChatPage/FriendGrid"
import MessageSpace from "../Component/ChatPage/MessageSpace"
import gsap from "gsap"

function ChatPage() {
  const pageRef = useRef(null)
  const navigate = useNavigate()
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSearching, setIsSearching] = useState(false);

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend)
  }
  const handleSearchStateChange = (searching) => {
    setIsSearching(searching);
  };
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await userAPI.logout()
      localStorage.removeItem('token')

      // Animate out
      gsap.to(pageRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => navigate('/login')
      })
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div ref={pageRef} className="h-screen flex flex-col bg-[#17212b]">
      <div className="flex h-full">
        {/* Left Sidebar - Menu */}
        <div className="w-[72px] bg-[#0e1621] flex flex-col items-center py-4 border-r border-[#232e3c]">
          <div className="mb-6">
            <h1 className="text-blue-400 text-2xl font-bold">W</h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-auto p-3 rounded-full hover:bg-[#232e3c] transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Chat List Sidebar */}
        <div className="w-[320px] bg-[#17212b] border-r border-[#232e3c]">
          <div className="p-3">
            <SearchFriendForm onSearchStateChange={handleSearchStateChange} />
          </div>
          <div className="px-2">
            <PendingRequest />
          </div>
          {!isSearching && (
            <div className="overflow-y-auto">
              <FriendGrid
                onFriendSelect={handleFriendSelect}
                selectedFriend={selectedFriend}
              />
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-[#0e1621]">
          <MessageSpace selectedFriend={selectedFriend} />
        </div>
      </div>
    </div>
  )
}

export default ChatPage