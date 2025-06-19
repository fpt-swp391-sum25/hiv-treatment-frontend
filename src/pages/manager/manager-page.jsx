import React from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from '../../components/manager/Layout/ManagerSidebar';
import ManagerHeader from '../../components/manager/Layout/ManagerHeader';

const ManagerLayout = () => {
  return (
    <div className="d-flex flex-column vh-100">
      <div className="header-container">
        <ManagerHeader />
      </div>
      
      <div className="d-flex flex-grow-1">
        <div className="sidebar-container" style={{ width: '230px', flexShrink: 0 }}>
          <ManagerSidebar />
        </div>
        <div className="content-container p-3 flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ManagerLayout;
