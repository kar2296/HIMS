import React, { useState } from 'react';

interface LoginPageProps {
  onLogin?: (username: string, password: string) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  isLoading = false, 
  errorMessage = '' 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      backgroundColor: '#f5f6ff',
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: '"Poppins", sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        
        {/* Logo Area */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            color: '#21008d', 
            fontWeight: 700, 
            fontSize: '28px',
            margin: 0,
            letterSpacing: '1px'
          }}>
            Welcome Back
          </h2>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
            Please enter your details to sign in.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#ffeff0',
            color: '#d32f2f',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid #ffcdd2'
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Username Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '16px',
              transform: 'translateY(-50%)',
              color: '#21008d',
              pointerEvents: 'none'
            }}>
              <i className="fa-regular fa-user"></i>
            </div>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 16px 16px 44px',
                borderRadius: '12px',
                border: '2px solid transparent',
                backgroundColor: '#f0f2f5',
                fontSize: '15px',
                color: '#333',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#21008d'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
            />
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '16px',
              transform: 'translateY(-50%)',
              color: '#21008d',
              pointerEvents: 'none'
            }}>
              <i className="fa-solid fa-lock"></i>
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 44px 16px 44px',
                borderRadius: '12px',
                border: '2px solid transparent',
                backgroundColor: '#f0f2f5',
                fontSize: '15px',
                color: '#333',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#21008d'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                top: '50%',
                right: '16px',
                transform: 'translateY(-50%)',
                color: showPassword ? '#ebb200' : '#888',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              <i className={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"}></i>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || !username || !password}
            style={{
              backgroundColor: '#ebb200',
              color: '#fff',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: (isLoading || !username || !password) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || !username || !password) ? 0.7 : 1,
              transition: 'all 0.3s ease',
              marginTop: '10px',
              boxShadow: '0 4px 12px rgba(235, 178, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!isLoading && username && password) {
                e.currentTarget.style.backgroundColor = '#21008d';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 0, 141, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ebb200';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(235, 178, 0, 0.3)';
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

      </div>
    </div>
  );
};
