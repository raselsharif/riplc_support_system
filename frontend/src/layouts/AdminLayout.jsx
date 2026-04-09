import { useMenu } from '../contexts/MenuContext';
import Sidebar from '../components/Sidebar';

const AdminLayout = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useMenu();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-64">
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
