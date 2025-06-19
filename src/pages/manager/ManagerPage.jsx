import { Outlet } from 'react-router-dom';
import ManagerSidebar from '../../components/manager/Layout/ManagerSidebar';
import ManagerHeader from '../../components/manager/Layout/ManagerHeader';
import '../../styles/manager/ManagerPage.css'; 

const ManagerPage = () => {
  return (
    <div className="manager-layout">
      <header className="manager-layout-header">
        <ManagerHeader />
      </header>
      
      <div className="manager-layout-body">
        <aside className="manager-layout-sidebar">
          <ManagerSidebar />
        </aside>
        <main className="manager-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerPage;
