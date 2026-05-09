import React, { useState } from 'react';

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
      backgroundColor: '#ffffff',
      boxShadow: 'var(--shadow-sm)',
      padding: '0 20px',
      fontFamily: 'var(--font-modern)',
      position: 'relative',
      zIndex: 1000
    }}>
      {/* Left side: Brand / Facility / Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '18px',
            color: 'var(--premium-blue)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(33, 0, 141, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <div style={{ 
          fontWeight: 600, 
          fontSize: '18px', 
          color: 'var(--premium-text-main)',
          borderLeft: '1px solid #eee',
          paddingLeft: '20px'
        }}>
          {facilityName}
        </div>
      </div>

      {/* Right side: User Profile & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Language Selector (Placeholder for future extension) */}
        <div style={{ 
          fontSize: '13px', 
          color: 'var(--premium-text-muted)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          English <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i>
        </div>

        <div style={{ height: '30px', width: '1px', backgroundColor: '#eee' }}></div>

        {/* User Dropdown */}
        <div 
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '4px 8px',
            borderRadius: '8px',
            backgroundColor: isDropdownOpen ? 'var(--premium-bg-light)' : 'transparent',
            transition: 'background 0.2s'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--premium-gold)',
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
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--premium-text-main)', lineHeight: '1' }}>
                {userName}
              </span>
              <span style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                Online
              </span>
            </div>
            
            <i className={`fa-solid fa-chevron-${isDropdownOpen ? 'up' : 'down'}`} 
               style={{ fontSize: '10px', color: '#888', marginLeft: '4px' }}></i>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="premium-glass-panel" style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '200px',
              padding: '8px 0',
              animation: 'fadeIn 0.2s ease-out',
              zIndex: 1001
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
                    color: var(--premium-text-muted);
                    fontSize: 13px;
                    transition: background 0.2s;
                  }
                  .dropdown-item:hover {
                    background-color: var(--premium-bg-light);
                    color: var(--premium-blue);
                  }
                `}
              </style>
              
              <div className="dropdown-item">
                <i className="fa-solid fa-user" style={{ width: '16px' }}></i> My Profile
              </div>
              <div className="dropdown-item">
                <i className="fa-solid fa-lock" style={{ width: '16px' }}></i> Change Password
              </div>
              <div style={{ height: '1px', backgroundColor: '#eee', margin: '8px 0' }}></div>
              <div 
                className="dropdown-item" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onLogout) onLogout();
                }}
                style={{ color: 'var(--premium-danger)' }}
              >
                <i className="fa-solid fa-sign-out-alt" style={{ width: '16px' }}></i> Logout
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Forced Password Change Modal */}
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
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#dc3545', marginTop: 0, marginBottom: '15px' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: '10px' }}></i>
              Mandatory Password Change
            </h3>
            <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '20px' }}>
              For security reasons, you are required to change your password before continuing.
            </p>
            
            {passwordError && (
              <div style={{
                padding: '10px',
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                color: '#d32f2f',
                borderRadius: '6px',
                marginBottom: '15px',
                fontSize: '13px'
              }}>
                {passwordError}
              </div>
            )}
            
            <form onSubmit={handleForcePasswordChange}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                style={{
                  width: '100%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: (isChangingPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                  opacity: (isChangingPassword || !newPassword || !confirmPassword) ? 0.7 : 1
                }}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
