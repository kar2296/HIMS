import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { colors, spacing, typography, radii } from '../components/ui/tokens';

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
        padding: `${spacing.xl} ${spacing.lg}`,
        boxSizing: 'border-box',
        backgroundImage:
          'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: typography.fontFamily,
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
      <Card
        padding={spacing.xxl}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: radii.xl,
          border: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
          width: '100%',
          maxWidth: '430px',
          zIndex: 1,
        }}
      >
        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: radii.md,
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
            <span style={{ color: colors.primary, fontWeight: 800, fontSize: '22px', lineHeight: '1.2', letterSpacing: '-0.3px' }}>
              MediCare
            </span>
            <span style={{ ...typography.caption, color: colors.textMuted, letterSpacing: '0.4px', fontFamily: typography.fontFamily }}>
              Securing Global Health
            </span>
          </div>
        </div>

        {/* Title Area */}
        <div style={{ marginBottom: spacing.xl }}>
          <h2
            style={{
              ...typography.sectionHeading,
              color: colors.textMain,
              fontSize: '20px',
              margin: '0 0 4px 0',
              letterSpacing: '-0.2px',
              fontFamily: typography.fontFamily,
            }}
          >
            Welcome Back to MediCare
          </h2>
          <p style={{ ...typography.body, color: colors.textMuted, margin: 0, fontFamily: typography.fontFamily }}>
            Securely sign in to your enterprise account.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{ marginBottom: spacing.lg }}>
            <Alert tone="danger">
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
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
            </Alert>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          {/* Username Input Group */}
          <Input
            label="User Name"
            required
            type="text"
            placeholder="user@hospital.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            leftIcon="fa-regular fa-envelope"
          />

          {/* Password Input Group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
            <label style={{ ...typography.label, color: colors.textMain, fontFamily: typography.fontFamily }}>
              Password
            </label>
            {/* Input doesn't expose a trailing/right-icon slot, so the show/hide
                toggle is layered on top of it in a position:relative wrapper --
                same toggle element and click behavior as before, just restyled. */}
            <div style={{ position: 'relative' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                leftIcon="fa-solid fa-lock"
                style={{ paddingRight: '38px' }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: spacing.sm,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  fontSize: '14px',
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
              marginTop: spacing.xs,
            }}
          >
            <Checkbox
              id="keepSignedIn"
              label="Keep me signed in"
              checked={keepSignedIn}
              onChange={(checked) => setKeepSignedIn(checked)}
            />

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onResetPassword) onResetPassword();
              }}
              style={{
                color: '#d97706',
                fontSize: typography.helper.fontSize,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Sign In Button -- Button's own loading/loadingText affordance
              drives the in-progress spinner, replacing the hand-rolled
              <i class="fa-spin"/> markup; isLoading still governs it exactly
              as before. */}
          <Button
            type="submit"
            disabled={isLoading || !username || !password}
            loading={isLoading}
            loadingText="Signing In..."
            fullWidth
            size="md"
            variant="primary"
            style={{ marginTop: spacing.xs }}
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: `${spacing.lg} 0`,
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
          <span style={{ padding: `0 ${spacing.md}`, color: colors.textSubtle, fontSize: '12px', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }}></div>
        </div>

        {/* S.S.O Button */}
        <Button
          type="button"
          variant="outline"
          icon="fa-solid fa-key"
          fullWidth
          size="md"
          style={{
            color: '#b45309',
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(254, 243, 199, 0.4)',
            marginBottom: spacing.lg,
          }}
        >
          Sign in with S.S.O.
        </Button>

        {/* Footer Admin Link */}
        <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: typography.body.fontSize }}>
          Don't have an account?{' '}
          <a
            href="#"
            style={{
              color: colors.primary,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Contact Admin.
          </a>
        </div>
      </Card>
    </div>
  );
};
