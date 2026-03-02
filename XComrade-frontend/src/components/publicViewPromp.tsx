import { CiLock } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';

interface PublicViewPromptProps {
  message?: string;
}

const PublicViewPrompt = ({ message }: PublicViewPromptProps) => {
  const navigate = useNavigate();

  return (
    <div className="login-prompt-overlay">
      <div className="login-prompt-card">
        <h3><CiLock /> Want to see more?</h3>
        <p>{message || 'Sign in to unlock all content and features on XplorerComrade!'}</p>
        <div className="login-prompt-actions">
          <button className="login-prompt-btn primary" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="login-prompt-btn secondary" onClick={() => navigate('/register')}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicViewPrompt;
