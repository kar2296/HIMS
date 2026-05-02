import React, { useState } from 'react';

interface TopNavbarComponentProps {
  facilityName?: string;
  userName?: string;
  userPhoto?: string; // base64
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export const TopNavbarComponent: React.FC<TopNavbarComponentProps> = ({
  facilityName = 'Hospital System',
  userName = 'User',
  userPhoto,
  onLogout,
  onToggleSidebar
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      padding: '0 20px',
      fontFamily: '"Poppins", sans-serif',
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
            color: '#21008d',
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
          color: '#333',
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
          color: '#666', 
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
            backgroundColor: isDropdownOpen ? '#f5f6ff' : 'transparent',
            transition: 'background 0.2s'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ebb200',
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
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#333', lineHeight: '1' }}>
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
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '200px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              padding: '8px 0',
              animation: 'fadeIn 0.2s ease-out'
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
                    color: #444;
                    fontSize: 13px;
                    transition: background 0.2s;
                  }
                  .dropdown-item:hover {
                    background-color: #f5f6ff;
                    color: #21008d;
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
                style={{ color: '#d32f2f' }}
              >
                <i className="fa-solid fa-sign-out-alt" style={{ width: '16px' }}></i> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
