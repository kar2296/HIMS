import React, { useState } from 'react';

interface LoginPageProps {
  onLogin?: (username: string, password: string) => void;
  onResetPassword?: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onResetPassword,
  isLoading = false,
  errorMessage = ''
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin && username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      // Using a modern hospital corridor as a blurred background, simulating the mockup
      backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'var(--font-modern)',
      position: 'relative'
    }}>
      {/* Dark overlay to make the glass card pop */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(3px)'
      }}></div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '48px 40px',
        borderRadius: '16px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.5)',
        width: '100%',
        maxWidth: '440px',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}>

        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ color: '#ebb200', fontSize: '32px' }}>
            <i className="fa-solid fa-house-medical"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#00005c', fontWeight: 800, fontSize: '24px', lineHeight: '1.2' }}>
              MediCare
            </span>
            <span style={{ color: '#00005c', fontSize: '11px', letterSpacing: '0.5px' }}>
              Securing Global Health
            </span>
          </div>
        </div>

        {/* Title Area */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            color: '#00005c',
            fontWeight: 700,
            fontSize: '24px',
            margin: '0 0 8px 0'
          }}>
            Welcome Back to MediCare
          </h2>
          <p style={{ color: '#333', fontSize: '14px', margin: 0, fontWeight: 500 }}>
            Securely sign in to your enterprise account.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(255, 239, 240, 0.9)',
            color: '#d32f2f',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid rgba(255, 205, 210, 0.5)'
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
            {errorMessage === 'ACCOUNT_LOCKED' ? 'Your account has been locked due to too many failed login attempts.' : errorMessage}
            
            {errorMessage === 'ACCOUNT_LOCKED' && (
               <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={onResetPassword}
                    style={{
                      backgroundColor: '#d32f2f',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Reset Password
                  </button>
               </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#00005c' }}>User Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '16px',
                transform: 'translateY(-50%)',
                color: '#555',
                pointerEvents: 'none'
              }}>
                <i className="fa-regular fa-envelope"></i>
              </div>
              <input
                type="text"
                placeholder="user@hospital.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '15px',
                  color: '#333',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.8)';
                  e.target.style.borderColor = '#00005c';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                  e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#00005c' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '16px',
                transform: 'translateY(-50%)',
                color: '#555',
                pointerEvents: 'none'
              }}>
                <i className="fa-solid fa-lock"></i>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 44px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '15px',
                  color: '#333',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.8)';
                  e.target.style.borderColor = '#00005c';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                  e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '16px',
                  transform: 'translateY(-50%)',
                  color: '#555',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
              >
                <i className={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}></i>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '4px' }}>
              <a href="#" style={{ color: '#b38600', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            style={{
              backgroundColor: '#00005c',
              color: '#fff',
              border: '2px solid #ebb200',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: (isLoading || !username || !password) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || !username || !password) ? 0.7 : 1,
              transition: 'all 0.3s ease',
              marginTop: '10px',
              boxShadow: '0 0 15px rgba(235, 178, 0, 0.4)'
            }}
            onMouseOver={(e) => {
              if (!isLoading && username && password) {
                e.currentTarget.style.backgroundColor = '#000040';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(235, 178, 0, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#00005c';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(235, 178, 0, 0.4)';
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', opacity: 0.5 }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#000' }}></div>
          <span style={{ padding: '0 10px', color: '#000', fontSize: '14px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#000' }}></div>
        </div>

        {/* Extra Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <input
            type="checkbox"
            id="keepSignedIn"
            checked={keepSignedIn}
            onChange={(e) => setKeepSignedIn(e.target.checked)}
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
          <label htmlFor="keepSignedIn" style={{ fontSize: '14px', color: '#000', cursor: 'pointer' }}>
            Keep me signed in
          </label>
        </div>

        <button
          type="button"
          style={{
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.3)',
            color: '#b38600',
            border: '2px solid #ebb200',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '24px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
          }}
        >
          Sign in with S.S.O.
        </button>

        <div style={{ textAlign: 'center', color: '#000', fontSize: '14px' }}>
          Don't have an account? <a href="#" style={{ color: '#000', fontWeight: 600, textDecoration: 'none' }}>Contact Admin.</a>
        </div>

      </div>
    </div>
  );
};
