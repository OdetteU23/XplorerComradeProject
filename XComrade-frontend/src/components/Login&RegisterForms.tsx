import { useState } from 'react';
import type { loginInfo, registeringInfo } from '@xplorercomrade/types-server';
import { useAuthentication } from '../hooks/mainHook';
import { useNavigate } from 'react-router-dom';

// Login Component
export const LoginComp = () => {
  const navigate = useNavigate();
  const { handleLogin, isLoading, error } = useAuthentication();

  const [credentials, setCredentials] = useState<loginInfo>({
    käyttäjäTunnus: '',
    salasana: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleLogin(credentials);
    if (result.success) {
      navigate('/'); // Navigate to home on success
    }
  };

  return (
    <div className="login-form-container">
      <h2>🌍 Welcome Back to XplorerComrade!</h2>
      <p>Sign in to continue your journey</p>

      {error && (
        <div className="error-alert">
          <p>⚠️ {error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={credentials.käyttäjäTunnus}
            onChange={(e) => setCredentials({ ...credentials, käyttäjäTunnus: e.target.value })}
            placeholder="Enter your username"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={credentials.salasana}
            onChange={(e) => setCredentials({ ...credentials, salasana: e.target.value })}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="link-btn">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

// Register Component
export const RegisterComp = () => {
  const navigate = useNavigate();
  const { handleRegister, isLoading, error } = useAuthentication();

  const [formData, setFormData] = useState<registeringInfo>({
    käyttäjäTunnus: '',
    salasana: '',
    etunimi: '',
    sukunimi: '',
    sahkoposti: '',
    bio: '',
    location: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleRegister(formData);
    if (result.success) {
      alert('Registration successful! Please log in.');
      navigate('/login'); // Navigate to login after successful registration
    }
  };

  return (
    <div className="register-form-container">
      <h2>🌍 Join XplorerComrade!</h2>
      <p>Create your account and start exploring</p>

      {error && (
        <div className="error-alert">
          <p>⚠️ {error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="auth-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={formData.etunimi}
              onChange={(e) => setFormData({ ...formData, etunimi: e.target.value })}
              placeholder="John"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={formData.sukunimi}
              onChange={(e) => setFormData({ ...formData, sukunimi: e.target.value })}
              placeholder="Doe"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            id="username"
            type="text"
            value={formData.käyttäjäTunnus}
            onChange={(e) => setFormData({ ...formData, käyttäjäTunnus: e.target.value })}
            placeholder="johndoe"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            value={formData.sahkoposti}
            onChange={(e) => setFormData({ ...formData, sahkoposti: e.target.value })}
            placeholder="john@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            value={formData.salasana}
            onChange={(e) => setFormData({ ...formData, salasana: e.target.value })}
            placeholder="Enter a strong password"
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, Country"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about your travel interests..."
            rows={4}
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="link-btn">
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginComp;
