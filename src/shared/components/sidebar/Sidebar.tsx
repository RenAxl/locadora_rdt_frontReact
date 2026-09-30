import { authService } from "../../../core/auth/services/auth.service";
import { useContext } from "react";
import { SessionContext } from "../../services/SessionContext";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { setting } = useContext(SessionContext);
  const iconType =
    setting.icon === "fa-playstation" || setting.icon === "fa-xbox"
      ? "fa-brands"
      : "fa-solid";
  return (
    <aside
      id="sidebarOffcanvas"
      className={`sidebar offcanvas-md offcanvas-start d-flex flex-column${collapsed ? " sidebar-collapsed" : ""}`}
      tabIndex={-1}
      aria-labelledby="sidebarOffcanvasLabel"
    >
      <div className="sidebar-header">
        <div className="d-flex align-items-center w-100">
          <div className="system-icon me-2">
            <i className={`${iconType} ${setting.icon}`} />
          </div>
          <div className="system-name" id="sidebarOffcanvasLabel">
            {setting.companyName.trim() ? setting.companyName : "RDT Games"}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav flex-grow-1">
        <ul className="sidebar-menu list-unstyled mb-0">
          <li className="header">
            <span className="header-chip">MENU NAVEGAÇÃO</span>
          </li>
          <li className="treeview">
            <NavLink
              to="/home"
              className="d-flex align-items-center nav-link px-3"
            >
              <i className="fa-solid fa-house me-2" />
              <span>Home</span>
            </NavLink>
          </li>
          {authService.hasAnyAuthority(["USER_READ", "ROLE_READ"]) && (
            <li className="treeview">
              <a
                className="d-flex align-items-center justify-content-between nav-link px-3 collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#submenuAdministracaoDesktop"
                href="#administracao"
              >
                <span className="d-flex align-items-center">
                  <i className="fa-solid fa-user-shield me-2" />
                  <span>Administração</span>
                </span>
                <span>
                  <i className="fa-solid fa-caret-right submenu-toggle-icon closed" />
                  <i className="fa-solid fa-caret-down submenu-toggle-icon open" />
                </span>
              </a>
              <ul
                className="treeview-menu collapse list-unstyled mb-0"
                id="submenuAdministracaoDesktop"
              >
                <li>
                  <NavLink
                    to="/users"
                    className="d-flex align-items-center nav-link px-4"
                  >
                    <i className="fa-solid fa-user me-2" />
                    <span>Usuários</span>
                  </NavLink>
                </li>
                {authService.hasAuthority("ROLE_READ") && (
                  <li>
                    <NavLink
                      to="/roles"
                      className="d-flex align-items-center nav-link px-4"
                    >
                      <i className="fa-solid fa-user-shield me-2" />
                      <span>Perfis</span>
                    </NavLink>
                  </li>
                )}
              </ul>
            </li>
          )}
          {authService.hasAnyAuthority(["CUSTOMER_READ", "DEPARTMENT_READ", "EMPLOYEE_READ"]) && (
            <li className="treeview">
              <a
                className="d-flex align-items-center justify-content-between nav-link px-3 collapsed"
                data-bs-toggle="collapse"
                data-bs-target="#submenuOrganizationDesktop"
                href="#organizacao"
              >
                <span className="d-flex align-items-center">
                  <i className="fa-solid fa-building me-2" />
                  <span>Organização</span>
                </span>
                <span>
                  <i className="fa-solid fa-caret-right submenu-toggle-icon closed" />
                  <i className="fa-solid fa-caret-down submenu-toggle-icon open" />
                </span>
              </a>
              <ul
                className="treeview-menu collapse list-unstyled mb-0"
                id="submenuOrganizationDesktop"
              >
                {authService.hasAuthority("CUSTOMER_READ") && (
                  <li><NavLink to="/customers" className="d-flex align-items-center nav-link px-4"><i className="fa-solid fa-user-shield me-2" /><span>Clientes</span></NavLink></li>
                )}
                {authService.hasAuthority("EMPLOYEE_READ") && (
                  <li><NavLink to="/employees" className="d-flex align-items-center nav-link px-4"><i className="fa-solid fa-user-group me-2" /><span>Funcionários</span></NavLink></li>
                )}
                {authService.hasAuthority("DEPARTMENT_READ") && (
                  <li><NavLink to="/departments" className="d-flex align-items-center nav-link px-4"><i className="fa-solid fa-building-user me-2" /><span>Departamentos</span></NavLink></li>
                )}
                {authService.hasAuthority("POSITION_READ") && (
                  <li><NavLink to="/positions" className="d-flex align-items-center nav-link px-4"><i className="fa-solid fa-id-badge me-2" /><span>Cargos</span></NavLink></li>
                )}
                {authService.hasAuthority("SUPPLIER_READ") && (
                  <li><NavLink to="/suppliers" className="d-flex align-items-center nav-link px-4"><i className="fa-solid fa-truck-field me-2" /><span>Fornecedores</span></NavLink></li>
                )}
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
