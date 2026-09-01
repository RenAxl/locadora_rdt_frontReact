import './Navbar.css';

export function Navbar() {
  return (
    <nav className="navbar main-navbar shadow">
      <div className="container-fluid h-100 d-flex align-items-center">
        <button className="btn navbar-hamburger" type="button" aria-label="Menu"
          data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas" aria-controls="sidebarOffcanvas">
          <i className="fa-solid fa-bars" />
        </button>

        <a className="profile-trigger ms-auto d-flex align-items-center h-100" href="#profile"
          aria-haspopup="true" aria-expanded="false" onClick={(event) => event.preventDefault()}>
          <span className="profile-img-wrapper me-2">
            <span className="profile-photo-placeholder" aria-label="Sem foto">
              <span className="profile-photo-icon">👤</span>
            </span>
          </span>
          <span className="user-details text-start"><span className="user-name">Usuário</span></span>
          <i className="fa fa-caret-down ms-2 dropdown-arrow" aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
}
