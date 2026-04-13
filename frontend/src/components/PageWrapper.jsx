import { motion } from "framer-motion";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

export default PageWrapper;