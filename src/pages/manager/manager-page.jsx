import React from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from '../../components/manager/Layout/ManagerSidebar';
import ManagerHeader from '../../components/manager/Layout/ManagerHeader';

const ManagerLayout = () => {
  return (
    <div className="d-flex">
      <ManagerSidebar />
      <div className="flex-grow-1">
        <ManagerHeader />
        <Outlet />
      </div>
    </div>
  );
};

export default ManagerLayout;
