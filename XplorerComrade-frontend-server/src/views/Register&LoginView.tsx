const RegisterView = () => {
  return (
    <>
      <h2>Register View</h2>
      <p>Please register to create a new account.
        (Content coming here:
        {/* --> New user registration (registeringInfo) */}
        )
      </p>
    </>
  );
};

const LoginView = () => {
  return (
    <>
      <h2>Login View</h2>
      <p>Please log in to access your account.
        (Content coming here:
        {/*User authentication (loginInfo)*/}
        )
      </p>
    </>
  );
} ;

export {RegisterView, LoginView };
