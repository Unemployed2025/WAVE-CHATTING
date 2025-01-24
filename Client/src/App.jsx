import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import ChatPage from './Pages/ChatPage';
import ProtectedRoute from './Component/ProtectedRoutes';
import PublicRoute from './Component/PublicRoute';
import { SocketProvider } from './context/SocketContext';
import { FriendProvider } from './context/FriendContext';

function App() {
  return (
    <FriendProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </SocketProvider>
    </FriendProvider>
  );
}

export default App;