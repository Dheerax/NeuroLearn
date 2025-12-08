import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className="min-h-screen transition-theme"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Sidebar */}
      <Sidebar onCollapse={setSidebarCollapsed} />

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed ? 64 : 240,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="min-h-screen flex flex-col"
      >
        <Header />

        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer
          className="px-8 py-4 text-center text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          <p>NeuroLearn Companion • Made with 💙 for neurodivergent learners</p>
        </footer>
      </motion.div>
    </div>
  );
}
