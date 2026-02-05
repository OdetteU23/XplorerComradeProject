import { LoginComp, RegisterComp } from '../components/Login&RegisterForms';

const RegisterView = () => {
  return (
    <div className="register-view">
      <div className="auth-container">
        <RegisterComp />
      </div>
    </div>
  );
};

const LoginView = () => {
  return (
    <div className="login-view">
      <div className="auth-container">
        <LoginComp />
      </div>
    </div>
  );
};

export { RegisterView, LoginView };
