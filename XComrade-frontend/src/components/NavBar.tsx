
import { Link, useNavigate } from 'react-router-dom';
import { useKäyttäjä } from '../content/käyttänKontentti';
import { useState } from 'react';

// Main navigation bar
const NavBar = () => {
  const { user, isAuthenticated, logout } = useKäyttäjä();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <h1>🌍 XplorerComrade</h1>
          </Link>
        </div>

        {isAuthenticated && (
          <>
            <div className="navbar-links">
              <Link to="/" className="nav-link">
                <span>🏠</span> Home
              </Link>
              <Link to="/upload" className="nav-link">
                <span>📸</span> Upload
              </Link>
              <Link to="/search" className="nav-link">
                <span>🔍</span> Search
              </Link>
              <Link to="/explore" className="nav-link">
                <span>🧭</span> Explore
              </Link>
              <Link to="/travel-plans" className="nav-link">
                <span>✈️</span> Plans
              </Link>
              <Link to="/messages" className="nav-link">
                <span>💬</span> Messages
              </Link>
              <Link to="/notifications" className="nav-link">
                <span>🔔</span> Notifications
              </Link>
           </div>

            <div className="navbar-user">
              <button
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">
                  {user?.profile_picture_url ? (
                    <img src={user.profile_picture_url} alt="Profile" />
                  ) : (
                    <span>👤</span>
                  )}
                </span>
                <span className="user-name">
                  {user?.etunimi || 'User'}
                </span>
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                    👤 My Profile
                  </Link>
                  <Link to="/my-trips" onClick={() => setShowUserMenu(false)}>
                    🧭 My Trips
                  </Link>
                  <Link to="/buddy-requests" onClick={() => setShowUserMenu(false)}>
                    🤝 Buddy Requests
                  </Link>
                  <Link to="/settings" onClick={() => setShowUserMenu(false)}>
                    ⚙️ Settings
                  </Link>
                  <hr />
                  <button onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div className="navbar-auth">
            <Link to="/login" className="auth-link">
              Login
            </Link>
            <Link to="/register" className="auth-link register">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// Bottom navigation for mobile
const BottomNav = () => {
  const { isAuthenticated } = useKäyttäjä();

  if (!isAuthenticated) return null;

  return (
    <nav className="bottom-nav">
      <Link to="/" className="bottom-nav-link">
        <span>🏠</span>
        <span>Home</span>
      </Link>
      <Link to="/search" className="bottom-nav-link">
        <span>🔍</span>
        <span>Search</span>
      </Link>
      <Link to="/upload" className="bottom-nav-link">
        <span>➕</span>
        <span>Upload</span>
      </Link>
      <Link to="/travel-plans" className="bottom-nav-link">
        <span>✈️</span>
        <span>Plans</span>
      </Link>
      <Link to="/profile" className="bottom-nav-link">
        <span>👤</span>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export { NavBar, BottomNav };
