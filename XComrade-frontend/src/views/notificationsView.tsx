import type { userProfile } from '@xcomrade/types-server';
import { useState, useEffect } from 'react';
import { api } from '../../utilHelpers/FetchingData';

const SettingsView = () => {
  const [userProfile, setUserProfile] = useState<userProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      const user = await api.auth.getCurrentUser();
      setUserProfile(user);
    } catch (err) {
      console.error('Load user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<userProfile>) => {

    if (!userProfile) return;

    try {
      const updated = await api.user.updateProfile(userProfile.id, updates);
      setUserProfile(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="settings-view">
      <h2>Account Settings</h2>

      <section className="profile-settings">
        <h3>Profile Information</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : userProfile ? (
          <div className="settings-form">
            <div className="form-group">
              <label>Username</label>
              <p>@{userProfile.käyttäjäTunnus}</p>
            </div>
            <div className="form-group">
              <label>Username
                <button onClick={() => handleUpdateProfile({
                })}>Change username</button>
              </label>
              <p>{userProfile.etunimi} {userProfile.sukunimi}</p>
            </div>
            <div className="form-group">
              <label>Email
                 <button onClick={() => handleUpdateProfile({
                 })}>Change Email</button>
              </label>
              <p>{userProfile.sahkoposti}</p>
            </div>
            <div className="form-group">
              <label>Location
                 <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit location'}
            </button>
              </label>
              <p>{userProfile.location || 'Not specified'}</p>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <p>{userProfile.bio || 'No bio yet'}</p>
            </div>
            <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        ) : (
          <p>Failed to load profile</p>
        )}
      </section>

      <section className="account-settings">
        <h3>Privacy & Security</h3>
        <button onClick={() => handleUpdateProfile({})}>Change Password</button>
        <button>Privacy Settings</button>
      </section>

      <section className="notification-settings">
        <h3>Notifications</h3>
        <label>
          <input type="checkbox" defaultChecked />
          Email notifications
        </label>
        <label>
          <input type="checkbox" defaultChecked />
          Push notifications
        </label>
      </section>
    </div>
  );
};

export { SettingsView };
