import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { notificationService } from "../../error/services/notification.service";
import { authService } from "../services/auth.service";

export function AuthGuard({
  children,
  authorities = [],
}: {
  children: ReactNode;
  authorities?: string[];
}) {
  const location = useLocation();
  const invalidToken = authService.isAccessTokenInvalid();
  const denied = !invalidToken && !authService.hasAnyAuthority(authorities);
  useEffect(() => {
    if (denied)
      notificationService.add({
        severity: "warn",
        detail: "Você não tem permissão para acessar esta página.",
      });
  }, [denied]);
  if (invalidToken) {
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  if (denied) return <Navigate to="/not-authorized" replace />;
  return <>{children}</>;
}
