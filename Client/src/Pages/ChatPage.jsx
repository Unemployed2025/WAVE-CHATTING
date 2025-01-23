import { useRef, useEffect } from "react"
import SearchFriendForm from "../Component/ChatPage/SearchFriendForm"
import PendingRequest from "../Component/ChatPage/PendingRequest"
import FriendGrid from "../Component/ChatPage/FriendGrid"
import gsap from "gsap"

function ChatPage() {
  const pageRef = useRef(null)

  useEffect(() => {
    // Set initial opacity to 1
    gsap.set(pageRef.current, { opacity: 1 });
    
    // Animate from bottom instead of using opacity
    gsap.from(pageRef.current, {
      y: 20,
      duration: 0.5,
      ease: "power2.out"
    })
  }, [])

  return (
    <div 
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 opacity-100" // Add opacity-100
    >
      {/* Header - Add backdrop blur */}
      <div className="bg-white/80 border-b shadow-sm backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Wave
          </h1>
        </div>
      </div>

      {/* Main Content - Add proper stacking context */}
      <div className="max-w-6xl mx-auto p-4 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Friends</h2>
                <PendingRequest />
              </div>
            </div>
              <SearchFriendForm />
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4">
              <FriendGrid />
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 h-[80vh]">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
              </div>
              <div className="p-4 text-center text-gray-500">
                Select a friend to start chatting
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add a fixed background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 -z-10" />
    </div>
  )
}

export default ChatPage