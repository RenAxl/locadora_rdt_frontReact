import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/auth.service";

export function AuthGuard({
  children,
  authorities = [],
}: {
  children: ReactNode;
  authorities?: string[];
}) {
  const location = useLocation();
  if (authService.isAccessTokenInvalid()) {
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  if (!authService.hasAnyAuthority(authorities))
    return <Navigate to="/not-authorized" replace />;
  return <>{children}</>;
}
