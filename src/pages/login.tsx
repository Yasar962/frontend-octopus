import "../components/login.css";

const Login = () => {
  return (
    <div className="page">
        <div className="imageparentcontainer">
            <div className="textcontainer">
                <h1>OCTOPUS</h1>
            </div>
            <div className="imagecontainer">
            </div>
        </div> 
        
    <div className="login-container">
        <div className="topbanner">
            <h6>New to Octopus?</h6>
            <button className="register">Register</button>
        </div>
      <h2>Welcome Back</h2>
      <h4>Enter your e-mail and password to continue</h4>

      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <h5>Forgot Password?</h5>
      

      <button>Login</button>
    </div>

    </div>
  );
};

export default Login;
