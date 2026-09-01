import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export function Sidebar() {
  return (
    <aside id="sidebarOffcanvas" className="sidebar offcanvas-md offcanvas-start d-flex flex-column"
      tabIndex={-1} aria-labelledby="sidebarOffcanvasLabel">
      <div className="sidebar-header">
        <div className="d-flex align-items-center w-100">
          <div className="system-icon me-2"><i className="fa-solid fa-gamepad" /></div>
          <div className="system-name" id="sidebarOffcanvasLabel">RDT Games</div>
        </div>
      </div>

      <nav className="sidebar-nav flex-grow-1">
        <ul className="sidebar-menu list-unstyled mb-0">
          <li className="header"><span className="header-chip">MENU NAVEGAÇÃO</span></li>
          <li className="treeview">
            <NavLink to="/home" className="d-flex align-items-center nav-link px-3">
              <i className="fa-solid fa-house me-2" /><span>Home</span>
            </NavLink>
          </li>
          <li className="treeview">
            <a className="d-flex align-items-center justify-content-between nav-link px-3 collapsed"
              data-bs-toggle="collapse" data-bs-target="#submenuAdministracaoDesktop" href="#administracao">
              <span className="d-flex align-items-center">
                <i className="fa-solid fa-user-shield me-2" /><span>Administração</span>
              </span>
              <span>
                <i className="fa-solid fa-caret-right submenu-toggle-icon closed" />
                <i className="fa-solid fa-caret-down submenu-toggle-icon open" />
              </span>
            </a>
            <ul className="treeview-menu collapse list-unstyled mb-0" id="submenuAdministracaoDesktop">
              <li>
                <NavLink to="/users" className="d-flex align-items-center nav-link px-4">
                  <i className="fa-solid fa-user me-2" /><span>Usuários</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/roles" className="d-flex align-items-center nav-link px-4">
                  <i className="fa-solid fa-user-shield me-2" /><span>Perfis</span>
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
