import React, { useState } from 'react';
import { Button } from './Button';

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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: '24px 16px',
        boxSizing: 'border-box',
        backgroundImage:
          'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: "'Poppins', 'Montserrat', -apple-system, sans-serif",
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      {/* Subtle Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      ></div>

      {/* Login Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '32px 36px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
          width: '100%',
          maxWidth: '430px',
          zIndex: 1,
          boxSizing: 'border-box',
          margin: 'auto',
        }}
      >
        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <i className="fa-solid fa-house-medical"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#00005c', fontWeight: 800, fontSize: '22px', lineHeight: '1.2', letterSpacing: '-0.3px' }}>
              MediCare
            </span>
            <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 500, letterSpacing: '0.4px' }}>
              Securing Global Health
            </span>
          </div>
        </div>

        {/* Title Area */}
        <div style={{ marginBottom: '22px' }}>
          <h2
            style={{
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '20px',
              margin: '0 0 4px 0',
              letterSpacing: '-0.2px',
            }}
          >
            Welcome Back to MediCare
          </h2>
          <p style={{ color: '#475569', fontSize: '13px', margin: 0, fontWeight: 400 }}>
            Securely sign in to your enterprise account.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12.5px',
              fontWeight: 500,
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fa-solid fa-circle-exclamation" style={{ color: '#dc2626' }}></i>
            <div style={{ flex: 1 }}>
              {errorMessage === 'ACCOUNT_LOCKED'
                ? 'Your account has been locked due to too many failed login attempts.'
                : errorMessage}
            </div>

            {errorMessage === 'ACCOUNT_LOCKED' && (
              <Button variant="danger" size="xs" onClick={onResetPassword}>
                Reset
              </Button>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Username Input Group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
              User Name
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00005c';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 0, 92, 0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div
                style={{
                  width: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '15px',
                  flexShrink: 0,
                }}
              >
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
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '11px 12px 11px 0',
                  fontSize: '14px',
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password Input Group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00005c';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 0, 92, 0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div
                style={{
                  width: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '15px',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-lock"></i>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '11px 8px 11px 0',
                  fontSize: '14px',
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  width: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flexShrink: 0,
                  transition: 'color 0.2s',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '2px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#475569',
                cursor: 'pointer',
                userSelect: 'none',
                margin: 0,
              }}
            >
              <input
                type="checkbox"
                id="keepSignedIn"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                style={{
                  cursor: 'pointer',
                  width: '15px',
                  height: '15px',
                  accentColor: '#00005c',
                  margin: 0,
                }}
              />
              <span>Keep me signed in</span>
            </label>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onResetPassword) onResetPassword();
              }}
              style={{
                color: '#d97706',
                fontSize: '12.5px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading || !username || !password}
            fullWidth
            size="md"
            variant="primary"
            style={{
              background: 'linear-gradient(135deg, #00005c 0%, #1a0070 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 600,
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 92, 0.3)',
              cursor: isLoading || !username || !password ? 'not-allowed' : 'pointer',
              marginTop: '4px',
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
          </Button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '18px 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span style={{ padding: '0 12px', color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        {/* S.S.O Button */}
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="md"
          style={{
            color: '#b45309',
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(254, 243, 199, 0.4)',
            fontWeight: 600,
            fontSize: '13.5px',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '18px',
          }}
        >
          <i className="fa-solid fa-key" style={{ marginRight: '6px' }}></i> Sign in with S.S.O.
        </Button>

        {/* Footer Admin Link */}
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          Don't have an account?{' '}
          <a
            href="#"
            style={{
              color: '#00005c',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Contact Admin.
          </a>
        </div>
      </div>
    </div>
  );
};
