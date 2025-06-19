import React from 'react';
import './ManagerHeader.css';
import appLogo from '../../../assets/appLogo.png';

const ManagerHeader = ({ user }) => {
  return (
    <div className="manager-header">
      <div className="header-left">
        <div className="logo-container">
          <img src={appLogo} alt="Logo" className="app-logo" />
        </div>
      </div>

      <div className="header-center">
        Chào mừng Quản lí
      </div>

      <div className="header-right">
        <div className="user-avatar-container">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User avatar" className="user-avatar" />
          ) : (
            <img 
              src="https://secure.gravatar.com/avatar/default?s=200&d=mp" 
              alt="Default avatar" 
              className="user-avatar"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerHeader;
