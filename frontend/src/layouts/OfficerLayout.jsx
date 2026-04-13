import { useMenu } from '../contexts/MenuContext';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

const OfficerLayout = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useMenu();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-64">
        <motion.main 
          className="p-4 md:p-6 lg:p-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default OfficerLayout;
