import { Outlet, Navigate } from 'react-router-dom';
import { NavBar, BottomNav } from './NavBar';
import { useKäyttäjä } from '../content/käyttänKontentti';

// Main app wrapper with navigation and routing
const Layout = () => {
  const { isAuthenticated, isLoading } = useKäyttäjä();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-layout relative min-h-screen">
      {/* Global dark gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/25 via-[rgba(26,26,46,0.6)] via-40% to-[rgba(26,26,46,0.97)] pointer-events-none" />
      <NavBar />
      <main className="main-content relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

// Protected route wrapper for authenticated pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useKäyttäjä();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper (redirects to home if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useKäyttäjä();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default Layout;
export { ProtectedRoute, PublicRoute };
