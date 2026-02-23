import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PääKäyttäjäProvider } from './content/käyttänKontentti';
import { HomeView, SearchView, ExploreView, SettingsView } from './views/HomeView';
import { MessagesView, NotificationsView } from './views/MessagesView';
import { ProfileView, FollowingView, BuddyRequestsView, MyTripsView } from './views/ProfileView';
import { RegisterView, LoginView } from './views/Register&LoginView';
import { UploadView, PostDetailView } from './views/UploadView';
import { TravelPlansView, TravelPlanDetailView } from './views/TravelPlansView';
import Layout, { ProtectedRoute, PublicRoute } from './components/Layout';
import './App.css';

const App = () => {
  return (
    <BrowserRouter basename="/XplorerComrade">
      <PääKäyttäjäProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginView />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterView />
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
            <Route path="/explore" element={<ExploreView />} />
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
            <Route path="/following" element={
              <ProtectedRoute>
                <FollowingView />
              </ProtectedRoute>
            } />
            <Route path="/buddy-requests" element={
              <ProtectedRoute>
                <BuddyRequestsView />
              </ProtectedRoute>
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
              <ProtectedRoute>
                <PostDetailView />
              </ProtectedRoute>
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


