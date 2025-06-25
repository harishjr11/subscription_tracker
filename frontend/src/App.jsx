import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Subscriptions from "./components/Subscriptions.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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

          {/* Protected Routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/" element={<Subscriptions />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

// ✅ Wrapper to conditionally render Navbar
function MainLayout({ isAuthenticated, children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login"; // Hide on login page

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="bg-white dark:bg-gray-900 pt-22 min-h-screen">{children}</div>
    </>
  );
}

export default App;
