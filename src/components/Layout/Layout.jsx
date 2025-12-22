import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
      <div
        className="min-h-screen flex flex-col transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
      >
        <Header />

        <main
          className="flex-1 p-4 md:p-6"
          style={{ background: "var(--bg-primary)" }}
        >
          <Outlet />
        </main>

        {/* Footer */}
        <footer
          className="px-8 py-4 text-center text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          <p>NeuroLearn Companion • Made with 💙 for neurodivergent learners</p>
        </footer>
      </div>
    </div>
  );
}
