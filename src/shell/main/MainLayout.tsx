import { SessionProvider } from "../../shared/services/SessionContext";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../shared/components/navbar/Navbar";
import { Sidebar } from "../../shared/components/sidebar/Sidebar";
import "./MainLayout.css";

export function MainLayout() {
  return (
    <SessionProvider>
      <div className="layout">
        <Sidebar />
        <div className="main-area">
          <Navbar />
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
