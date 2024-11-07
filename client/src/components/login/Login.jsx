
import React from 'react';
import './Login.css'
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Kindly Login</h1>
        <p className="login-subtitle">to continue</p>
        
        <form>
          <div className="input-container">
            <input type="email" placeholder="Email " required />
            <input type="password" placeholder="Password " required />
          </div>
          {/* <div className="forgot-link">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/emailrecovery'); }}>Forgot email?</a>
          </div>
          <div className="guest-mode-info">
            <p>
              Not your computer? Use Guest mode to sign in privately.
              <br />
              <a href="#">Learn more</a>
            </p>
          </div> */}
          <button type="submit" className="login-button">login</button>
        </form>
        
        <div className="create-account">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Create account</a>
        </div>
      </div>
    </div>
  );
}

export default Login;