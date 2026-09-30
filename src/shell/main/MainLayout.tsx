import { useState } from "react";
import { SessionProvider } from "../../shared/services/SessionContext";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../shared/components/navbar/Navbar";
import { Sidebar } from "../../shared/components/sidebar/Sidebar";
import "./MainLayout.css";

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <SessionProvider>
      <div className={`layout${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="main-area">
          <Navbar sidebarCollapsed={sidebarCollapsed} onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
