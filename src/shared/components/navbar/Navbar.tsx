import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OverlayPanel } from "primereact/overlaypanel";
import { authService } from "../../../core/auth/services/auth.service";
import { notificationService } from "../../../core/error/services/notification.service";
import { SessionContext } from "../../services/SessionContext";
import "./Navbar.css";

export function Navbar() {
  const { profile, photo } = useContext(SessionContext);
  const [photoUrl, setPhotoUrl] = useState("");
  const userMenu = useRef<OverlayPanel>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!photo || photo.size === 0) {
      setPhotoUrl("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const logout = () => {
    authService.logout();
    notificationService.add({
      severity: "success",
      detail: "Usuário deslogado com sucesso.",
    });
    navigate("/login");
  };

  return (
    <nav className="navbar main-navbar shadow">
      <div className="container-fluid h-100 d-flex align-items-center">
        <button
          className="btn navbar-hamburger"
          type="button"
          aria-label="Menu"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
          aria-controls="sidebarOffcanvas"
        >
          <i className="fa-solid fa-bars" />
        </button>
        <button
          type="button"
          className="btn profile-trigger ms-auto d-flex align-items-center h-100"
          aria-label="Menu do usuário"
          aria-haspopup="true"
          onClick={(event) => userMenu.current?.toggle(event)}
        >
          <span className="profile-img-wrapper me-2">
            {photoUrl ? (
              <img
                className="profile-photo"
                src={photoUrl}
                alt="Foto do perfil"
              />
            ) : (
              <span className="profile-photo-placeholder" aria-label="Sem foto">
                <span className="profile-photo-icon">👤</span>
              </span>
            )}
          </span>
          <span className="user-details text-start">
            <span className="user-name">
              {profile?.name.trim().split(" ")[0]}
            </span>
          </span>
          <i
            className="fa fa-caret-down ms-2 dropdown-arrow"
            aria-hidden="true"
          />
        </button>
        <OverlayPanel
          ref={userMenu}
          className="user-overlay user-overlay-small"
          dismissable
        >
          <nav className="overlay-menu" aria-label="Menu do usuário">
            <Link
              className="overlay-item"
              to="/users/profile"
              onClick={() => userMenu.current?.hide()}
            >
              <i className="fa fa-user" aria-hidden="true" />
              <span>Meu perfil</span>
            </Link>
            {authService.hasAuthority("SYSTEM_SETTING_READ") && (
              <Link
                className="overlay-item"
                to="/system-settings"
                onClick={() => userMenu.current?.hide()}
              >
                <i className="fa fa-cog" aria-hidden="true" />
                <span>Configurações Sistema</span>
              </Link>
            )}
            <button
              type="button"
              className="overlay-item logout"
              onClick={logout}
            >
              <i className="fa fa-sign-out" aria-hidden="true" />
              <span>Sair</span>
            </button>
          </nav>
        </OverlayPanel>
      </div>
    </nav>
  );
}
