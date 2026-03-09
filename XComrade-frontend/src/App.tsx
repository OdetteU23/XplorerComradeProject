import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PääKäyttäjäProvider } from './content/käyttänKontentti';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { SettingsView } from './views/notificationsView';
import { MessagesView, NotificationsView } from './views/MessagesView';
import { ProfileView, FollowingView, MyTripsView } from './views/ProfileView';
import { RegisterView, LoginView } from './views/Register&LoginView';
import { TravelPlansView, TravelPlanDetailView } from './views/TravelPlansView';
import Layout, { ProtectedRoute, PublicRoute } from './components/Layout';
import './App.css';
import {UploadView} from './views/UploadView';
import SingleView from './views/singleView';

const App = () => {
  return (
    <BrowserRouter basename="/XplorerComrade">
      <PääKäyttäjäProvider>
        <Routes>
          {/* Public routes (with gradient overlay) */}
          <Route path="/login" element={
            <PublicRoute>
              <div className="relative min-h-screen">
                <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/25 via-[rgba(26,26,46,0.6)] via-40% to-[rgba(26,26,46,0.97)] pointer-events-none" />
                <div className="relative z-10">
                  <LoginView />
                </div>
              </div>
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <div className="relative min-h-screen">
                <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/25 via-[rgba(26,26,46,0.6)] via-40% to-[rgba(26,26,46,0.97)] pointer-events-none" />
                <div className="relative z-10">
                  <RegisterView />
                </div>
              </div>
            </PublicRoute>
          } />

          {/* Main layout with all routes */}
          <Route element={<Layout />}>
            {/* Public home route */}
            <Route path="/" element={<HomeView />} />
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchView />
              </ProtectedRoute>
            } />

            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesView />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsView />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileView />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProfileView />
            } />
            <Route path="/following" element={
              <ProtectedRoute>
                <FollowingView />
              </ProtectedRoute>
            } />
            <Route path="/buddy-requests" element={
              <Navigate to="/notifications" replace />
            } />
            <Route path="/my-trips" element={
              <ProtectedRoute>
                <MyTripsView />
              </ProtectedRoute>
            } />
            <Route path="/travel-plans" element={
              <ProtectedRoute>
                <TravelPlansView />
              </ProtectedRoute>
            } />
            <Route path="/travel-plans/:id" element={
              <ProtectedRoute>
                <TravelPlanDetailView />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadView />
              </ProtectedRoute>
            } />

            <Route path="/post/:id" element={
              <SingleView />
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsView />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </PääKäyttäjäProvider>
    </BrowserRouter>
  );
};

export default App;

/*export default App;

      <footer className="app-footer">
        <p>&copy; 2026 XplorerComrade - Find your travel companion 🌍</p>
        <nav className="footer-nav">
          <a href="#about">About</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
        </nav>
      </footer>
    </div>
  );
};
*/


