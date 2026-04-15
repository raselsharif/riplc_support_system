import { useMenu } from '../contexts/MenuContext';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PageWrapper from '../components/PageWrapper';

const AdminLayout = ({ children }) => {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useMenu();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <PageWrapper key={location.pathname}>
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </PageWrapper>
      </div>
    </div>
  );
};

export default AdminLayout;
