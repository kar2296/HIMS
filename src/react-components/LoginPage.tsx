import React, { useState, useRef } from 'react';
import { colors, radii, spacing, shadows, transitions, typography } from '../components/ui/tokens';

// ─────────────────────────────────────────────────────────────
// Types (original props shape preserved)
// ─────────────────────────────────────────────────────────────
export interface LoginPageProps {
  isLoading?: boolean;
  errorMessage?: string;
  isAccountLocked?: boolean;
  onLogin?: (username: string, password: string, rememberMe: boolean) => void;
  onResetPassword?: () => void;
  onSSOLogin?: () => void;
  facilityName?: string;
  logoUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// Feature highlights shown on the left panel
// ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: 'fa-user-plus', label: 'Patient Registration', desc: 'OP & IP registration with complete demographic capture' },
  { icon: 'fa-file-invoice', label: 'Integrated Billing', desc: 'OP, IP, pharmacy & lab billing in one unified system' },
  { icon: 'fa-chart-line', label: 'Live Analytics', desc: 'Real-time dashboards for all departments' },
  { icon: 'fa-shield-halved', label: 'Role-Based Access', desc: 'Granular permissions for every clinical and admin role' },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  isLoading = false,
  errorMessage,
  isAccountLocked = false,
  onLogin,
  onResetPassword,
  onSSOLogin,
  facilityName = 'HIMS',
  logoUrl,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!username.trim() || !password.trim()) return;
    if (onLogin) onLogin(username.trim(), password, rememberMe);
  };

  const usernameError = touched.username && !username.trim() ? 'Username is required' : '';
  const passwordError = touched.password && !password.trim() ? 'Password is required' : '';

  const inputStyle = (focused: boolean, hasError: boolean): React.CSSProperties => ({
    width: '100%',
    height: '44px',
    border: `1.5px solid ${hasError ? colors.danger : focused ? colors.primary : colors.border}`,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    fontSize: '14px',
    fontFamily: typography.fontFamily,
    color: colors.textMain,
    paddingLeft: '42px',
    paddingRight: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: transitions.fast,
    boxShadow: focused ? (hasError ? `0 0 0 3px rgba(239,68,68,0.15)` : `0 0 0 3px rgba(37,99,235,0.15)`) : shadows.xs,
  });

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: typography.fontFamily,
      backgroundColor: colors.surfaceMuted,
    }}>
      {/* ── Left panel (brand / features) ── */}
      <div style={{
        flex: '0 0 45%',
        background: `linear-gradient(145deg, #0a0f1d 0%, #1e2d5a 60%, #1e293b 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(37,99,235,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(79,70,229,0.10)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(14,165,233,0.06)', pointerEvents: 'none' }} />

        {/* Logo + Brand */}
        <div style={{ marginBottom: '48px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: radii.lg,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)', flexShrink: 0,
            }}>
              <i className="fa-solid fa-house-medical" style={{ fontSize: '22px', color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                {facilityName}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Hospital Management System
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <h2 style={{
          margin: '0 0 12px 0', fontSize: '28px', fontWeight: 800, color: '#fff',
          lineHeight: 1.2, letterSpacing: '-0.5px',
        }}>
          Modern Healthcare,<br />
          <span style={{ color: '#60a5fa' }}>Simplified.</span>
        </h2>
        <p style={{ margin: '0 0 40px 0', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
          An enterprise-grade platform for hospitals to manage patients, billing, pharmacy, lab, and more — all in one integrated system.
        </p>

        {/* Feature highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: radii.md, flexShrink: 0,
                background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#60a5fa', fontSize: '15px',
              }}>
                <i className={`fa-solid ${f.icon}`} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{f.label}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom version note */}
        <div style={{ marginTop: '48px', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px' }}>
          HIMS v2.0 · Enterprise Edition
        </div>
      </div>

      {/* ── Right panel (login form) ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        backgroundColor: colors.surfaceMuted,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
        }}>
          {/* Form card */}
          <div style={{
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows['2xl'],
            padding: '40px',
          }}>
            {/* Form header */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800, color: colors.textMain, letterSpacing: '-0.3px' }}>
                Sign in
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: colors.textSubtle }}>
                Enter your credentials to access {facilityName}
              </p>
            </div>

            {/* Error / Locked state */}
            {(errorMessage || isAccountLocked) && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '12px 14px',
                backgroundColor: isAccountLocked ? colors.warningBg : colors.dangerBg,
                border: `1px solid ${isAccountLocked ? colors.warningBorder : colors.dangerBorder}`,
                borderRadius: radii.md, marginBottom: '20px',
              }}>
                <i
                  className={`fa-solid ${isAccountLocked ? 'fa-lock' : 'fa-circle-exclamation'}`}
                  style={{ fontSize: '15px', color: isAccountLocked ? colors.warning : colors.danger, flexShrink: 0, marginTop: '1px' }}
                />
                <div>
                  {isAccountLocked && (
                    <div style={{ fontSize: '13px', fontWeight: 700, color: colors.warningText, marginBottom: '2px' }}>Account Locked</div>
                  )}
                  <div style={{ fontSize: '13px', color: isAccountLocked ? colors.warningText : colors.dangerText }}>
                    {errorMessage || 'Your account has been temporarily locked. Please contact an administrator.'}
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textMuted, marginBottom: '6px', letterSpacing: '0.1px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <i
                    className="fa-solid fa-user"
                    style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '13px', color: userFocused ? colors.primary : colors.textSubtle,
                      transition: transitions.fast, pointerEvents: 'none',
                    }}
                  />
                  <input
                    ref={usernameRef}
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setUserFocused(true)}
                    onBlur={() => { setUserFocused(false); setTouched((p) => ({ ...p, username: true })); }}
                    placeholder="Enter your username"
                    style={inputStyle(userFocused, !!usernameError)}
                    disabled={isLoading || isAccountLocked}
                  />
                </div>
                {usernameError && (
                  <div style={{ fontSize: '11px', color: colors.danger, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '10px' }} />
                    {usernameError}
                  </div>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.textMuted, marginBottom: '6px', letterSpacing: '0.1px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <i
                    className="fa-solid fa-lock"
                    style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '13px', color: passFocused ? colors.primary : colors.textSubtle,
                      transition: transitions.fast, pointerEvents: 'none',
                    }}
                  />
                  <input
                    ref={passwordRef}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => { setPassFocused(false); setTouched((p) => ({ ...p, password: true })); }}
                    placeholder="Enter your password"
                    style={{ ...inputStyle(passFocused, !!passwordError), paddingRight: '44px' }}
                    disabled={isLoading || isAccountLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      color: colors.textSubtle, fontSize: '14px', transition: transitions.fast,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = colors.textSubtle)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
                {passwordError && (
                  <div style={{ fontSize: '11px', color: colors.danger, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '10px' }} />
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Remember + Forgot */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    id="login-remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: colors.primary, width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: colors.textMuted, fontFamily: typography.fontFamily }}>
                    Keep me signed in
                  </span>
                </label>
                {onResetPassword && (
                  <button
                    type="button"
                    onClick={onResetPassword}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      fontSize: '13px', color: colors.primary, fontWeight: 600,
                      fontFamily: typography.fontFamily, transition: transitions.fast,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.primaryHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = colors.primary)}
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Sign In button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading || isAccountLocked}
                style={{
                  width: '100%', height: '44px',
                  backgroundColor: isLoading || isAccountLocked ? colors.textDisabled : colors.primary,
                  color: '#fff', border: 'none', borderRadius: radii.md,
                  fontSize: '14px', fontWeight: 700, fontFamily: typography.fontFamily,
                  cursor: isLoading || isAccountLocked ? 'not-allowed' : 'pointer',
                  transition: transitions.base,
                  boxShadow: isLoading || isAccountLocked ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isAccountLocked) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.primaryHover;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !isAccountLocked) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.primary;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '14px' }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket" style={{ fontSize: '14px' }} />
                    Sign in
                  </>
                )}
              </button>
            </form>

            {/* SSO divider */}
            {onSSOLogin && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
                  <span style={{ fontSize: '12px', color: colors.textSubtle, fontWeight: 500 }}>or</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
                </div>

                <button
                  type="button"
                  onClick={onSSOLogin}
                  disabled={isLoading}
                  style={{
                    width: '100%', height: '44px',
                    backgroundColor: colors.surface, color: colors.textBody,
                    border: `1.5px solid ${colors.border}`, borderRadius: radii.md,
                    fontSize: '13px', fontWeight: 600, fontFamily: typography.fontFamily,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: transitions.base,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: shadows.xs,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.surfaceMuted; (e.currentTarget as HTMLButtonElement).style.borderColor = colors.borderStrong; }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.surface; (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border; }
                  }}
                >
                  <i className="fa-solid fa-key" style={{ color: colors.primary }} />
                  Continue with SSO
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '12px', color: colors.textSubtle, margin: 0 }}>
              © {new Date().getFullYear()} {facilityName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
