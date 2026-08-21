import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from '../components/ui/Input';
import { colors, typography, spacing, radii, shadows, zIndex } from '../components/ui/tokens';

interface TopNavbarComponentProps {
  facilityName?: string;
  userName?: string;
  userPhoto?: string; // base64
  requiresPasswordChange?: boolean;
  onPasswordChanged?: () => void;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export const TopNavbarComponent: React.FC<TopNavbarComponentProps> = ({
  facilityName = 'Hospital System',
  userName = 'User',
  userPhoto,
  requiresPasswordChange = false,
  onPasswordChanged,
  onLogout,
  onToggleSidebar
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setIsChangingPassword(true);
    setPasswordError('');
    try {
      const CryptoJS = (window as any).CryptoJS;
      let pwdToSend = newPassword;
      if (CryptoJS) {
          const strIV = CryptoJS.enc.Base64.parse("3ad77bb40d7a3660a89ecaf32466ef97");
          const base64Key = CryptoJS.enc.Base64.parse("3ad77bb40d7a3660a89ecaf32466ef97");
          const encrypted = CryptoJS.AES.encrypt(newPassword, base64Key, { iv: strIV });
          pwdToSend = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
      }

      const response = await fetch('/api/auth/force-change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newPassword: pwdToSend })
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      const toastr = (window as any).toastr;
      if (toastr) {
        toastr.success('Password updated successfully. Please log in with your new password next time.', 'Success');
      } else {
        alert('Password updated successfully. Please log in with your new password next time.');
      }

      if (onPasswordChanged) onPasswordChanged();
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      setPasswordError(err.message || 'An error occurred while updating the password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      backgroundColor: colors.surface,
      boxShadow: shadows.sm,
      padding: `0 ${spacing.xl}`,
      fontFamily: typography.fontFamily,
      position: 'relative',
      zIndex: zIndex.dropdown
    }}>
      {/* Left side: Brand / Facility / Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl }}>
        <Button
          variant="icon"
          icon="fa-solid fa-bars"
          onClick={onToggleSidebar}
          title="Toggle Navigation"
          size="sm"
          style={{
            fontSize: '16px',
            color: colors.primary,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none'
          }}
        />

        <div style={{
          fontWeight: 600,
          fontSize: '18px',
          color: colors.textMain,
          borderLeft: `1px solid ${colors.border}`,
          paddingLeft: spacing.xl
        }}>
          {facilityName}
        </div>
      </div>

      {/* Right side: User Profile & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl }}>

        {/* Language Selector (Placeholder for future extension) */}
        <div style={{
          fontSize: '13px',
          color: colors.textMuted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          English <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i>
        </div>

        <div style={{ height: '30px', width: '1px', backgroundColor: colors.border }}></div>

        {/* User Dropdown */}
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            padding: `4px ${spacing.sm}`,
            borderRadius: radii.sm,
            backgroundColor: isDropdownOpen ? colors.primaryLight : 'transparent',
            transition: 'background 0.2s'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: radii.full,
              backgroundColor: colors.gold,
              backgroundImage: userPhoto ? `url(data:image/png;base64,${userPhoto})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              overflow: 'hidden'
            }}>
              {!userPhoto && userName.charAt(0).toUpperCase()}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textMain, lineHeight: '1' }}>
                {userName}
              </span>
              <span style={{ fontSize: '11px', color: colors.textMuted, marginTop: spacing.xs }}>
                Online
              </span>
            </div>

            <i className={`fa-solid fa-chevron-${isDropdownOpen ? 'up' : 'down'}`}
               style={{ fontSize: '10px', color: colors.textMuted, marginLeft: spacing.xs }}></i>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '200px',
              padding: `${spacing.sm} 0`,
              backgroundColor: colors.surface,
              borderRadius: radii.sm,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.lg,
              animation: 'fadeIn 0.2s ease-out',
              zIndex: zIndex.dropdown
            }}>
              <style>
                {`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .dropdown-item {
                    padding: 10px 20px;
                    display: flex;
                    alignItems: center;
                    gap: 10px;
                    color: ${colors.textMuted};
                    fontSize: 13px;
                    transition: background 0.2s;
                  }
                  .dropdown-item:hover {
                    background-color: ${colors.primaryLight};
                    color: ${colors.primary};
                  }
                `}
              </style>

              <div className="dropdown-item">
                <i className="fa-solid fa-user" style={{ width: '16px' }}></i> My Profile
              </div>
              <div className="dropdown-item">
                <i className="fa-solid fa-lock" style={{ width: '16px' }}></i> Change Password
              </div>
              <div style={{ height: '1px', backgroundColor: colors.border, margin: `${spacing.sm} 0` }}></div>
              <div
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onLogout) onLogout();
                }}
                style={{ color: colors.danger }}
              >
                <i className="fa-solid fa-sign-out-alt" style={{ width: '16px' }}></i> Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forced Password Change Modal */}
      {/*
        NOTE: intentionally NOT using the design-system `Modal` component here.
        `Modal` always renders a close (X) button and a backdrop-click-to-close
        handler, and this dialog is a mandatory, non-dismissable forced
        password change -- there is no supported way to suppress Modal's close
        affordances, and adding a no-op onClose would visually offer a way out
        of a MANDATORY step (a real behavior regression). So this stays a
        hand-rolled, non-dismissable overlay -- only its colors/spacing are
        retokenized below.
      */}
      {requiresPasswordChange && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: colors.surface,
            padding: spacing.xxl,
            borderRadius: radii.lg,
            width: '100%',
            maxWidth: '400px',
            boxShadow: shadows.lg
          }}>
            <h3 style={{ color: colors.danger, marginTop: 0, marginBottom: spacing.lg }}>
              <i className="fa-solid fa-lock" style={{ marginRight: spacing.md }}></i>
              Mandatory Password Change
            </h3>
            <p style={{ color: colors.textMuted, fontSize: typography.body.fontSize, marginBottom: spacing.xl }}>
              For security reasons, you are required to change your password before continuing.
            </p>

            {passwordError && (
              <div style={{
                padding: spacing.md,
                backgroundColor: colors.dangerBg,
                color: colors.danger,
                borderRadius: radii.sm,
                marginBottom: spacing.lg,
                fontSize: '13px'
              }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleForcePasswordChange}>
              <div style={{ marginBottom: spacing.lg }}>
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: spacing.xl }}>
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={isChangingPassword}
                disabled={!newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
