
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useKäyttäjä } from '../content/käyttänKontentti';
import { useState } from 'react';
import { FaHome, FaCamera, FaSearch } from "react-icons/fa";
import { MdExplore, MdOutlineNotificationsNone  } from "react-icons/md";
import { GiCommercialAirplane, GiWorld } from "react-icons/gi";
import { FaHeart, FaMessage } from "react-icons/fa6";
import { IoPerson } from "react-icons/io5";
import { IoIosLogOut, IoMdSettings } from 'react-icons/io';
//import { GiWorld } from "react-icons/gi";

// Main navigation bar
const NavBar = () => {
  const { user, isAuthenticated, logout } = useKäyttäjä();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '';
    return location.pathname.startsWith(path);
  };

  const navLinkStyle = (path: string) => ({
    borderBottom: isActive(path) ? '2px solid #3b82f6' : '2px solid transparent',
    color: isActive(path) ? '#3b82f6' : undefined,
    fontWeight: isActive(path) ? 600 : undefined,
    transition: 'all 0.2s ease',
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GiWorld className='map' size={24} />
            <h1 style={{ margin: 0 }}>XplorerComrade</h1>
          </Link>
        </div>

        {isAuthenticated && (
          <>
            <div className="navbar-links">
              <Link to="/" className="nav-link" style={navLinkStyle('/')}>
                <span><FaHome /></span> Home
              </Link>
              <Link to="/upload" className="nav-link" style={navLinkStyle('/upload')}>
                <span><FaCamera /></span> Upload
              </Link>
              <Link to="/search" className="nav-link" style={navLinkStyle('/search')}>
                <span><FaSearch /></span> Search
              </Link>

              <Link to="/travel-plans" className="nav-link" style={navLinkStyle('/travel-plans')}>
                <span><GiCommercialAirplane /></span> Plans
              </Link>
              <Link to="/messages" className="nav-link" style={navLinkStyle('/messages')}>
                <span><FaMessage /></span> Messages
              </Link>
              <Link to="/notifications" className="nav-link" style={navLinkStyle('/notifications')}>
                <span><MdOutlineNotificationsNone /></span> Notifications
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
                    <span><IoPerson /></span>
                  )}
                </span>
                <span className="user-name">
                  {user?.etunimi || 'User'}
                </span>
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                    <IoPerson /> My Profile
                  </Link>
                  <Link to="/my-trips" onClick={() => setShowUserMenu(false)}>
                    <MdExplore /> My Trips
                  </Link>
                  <Link to="/buddy-requests" onClick={() => setShowUserMenu(false)}>
                    <FaHeart /> Buddy Requests
                  </Link>
                  <Link to="/settings" onClick={() => setShowUserMenu(false)}>
                    <IoMdSettings /> Settings
                  </Link>
                  <hr />
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', width: '100%', color: 'inherit', fontSize: 'inherit' }}>
                    <IoIosLogOut /> Logout
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
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '';
    return location.pathname.startsWith(path);
  };

  const bottomNavStyle = (path: string) => ({
    color: isActive(path) ? '#3b82f6' : undefined,
    fontWeight: isActive(path) ? 600 : undefined,
  });

  if (!isAuthenticated) return null;

  return (
    <nav className="bottom-nav">
      <Link to="/" className="bottom-nav-link" style={bottomNavStyle('/')}>
        <span><FaHome /></span>
        <span>Home</span>
      </Link>
      <Link to="/search" className="bottom-nav-link" style={bottomNavStyle('/search')}>
        <span><FaSearch /></span>
        <span>Search</span>
      </Link>
      <Link to="/upload" className="bottom-nav-link" style={bottomNavStyle('/upload')}>
        <span><FaCamera /></span>
        <span>Upload</span>
      </Link>
      <Link to="/travel-plans" className="bottom-nav-link" style={bottomNavStyle('/travel-plans')}>
        <span><GiCommercialAirplane /></span>
        <span>Plans</span>
      </Link>
      <Link to="/profile" className="bottom-nav-link" style={bottomNavStyle('/profile')}>
        <span><IoPerson /></span>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export { NavBar, BottomNav };
