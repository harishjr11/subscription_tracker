import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from './pages/Register.jsx';
import Subscriptions from "./components/Subscriptions.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Chat from "./components/Chat.jsx";
import UsersList from "./components/UserList.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token") // ✅ Persist login state on refresh
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <MainLayout isAuthenticated={isAuthenticated}>
        <Routes>
          {/* Redirect authenticated users away from login */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/subscriptions" /> : <Login onLogin={handleLogin} />}
          />
          <Route path="/register"  element={isAuthenticated ? <Navigate to="/subscriptions" /> : <Register/>}
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </MainLayout>
    </Router>
    
  );
}

// ✅ Wrapper to conditionally render Navbar
function MainLayout({ isAuthenticated, children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";
  const isChatPage = location.pathname === "/chat";

  return (
    <div className={`flex flex-col ${isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {!hideNavbar && <Navbar />}
      <div className={`flex-1 bg-white dark:bg-gray-900 ${isChatPage ? 'overflow-hidden' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default App;
