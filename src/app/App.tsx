import { AuthGuard } from "../core/auth/guards/AuthGuard";
import { AuthLayout } from "../shell/auth/AuthLayout";
import { LoginForm } from "../features/identity/login/pages/login-form/LoginForm";
import { ActivateAccount } from "../features/identity/activate-account/pages/activate-account/ActivateAccount";
import { RequestPasswordReset } from "../features/identity/password-recovery/pages/request-password-reset/RequestPasswordReset";
import { PasswordReset } from "../features/identity/password-recovery/pages/password-reset/PasswordReset";
import { UserProfileForm } from "../features/identity/users/pages/user-profile-form/UserProfileForm";
import { SystemSettingForm } from "../features/settings/system-settings/pages/system-setting-form/SystemSettingForm";
import { useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { notificationService } from "../core/error/services/notification.service";
import { PageNotFound } from "../core/pages/page-not-found/PageNotFound";
import { Home } from "../features/home/pages/Home";
import { UserForm } from "../features/identity/users/pages/user-form/UserForm";
import { UserList } from "../features/identity/users/pages/user-list/UserList";
import { RoleForm } from "../features/identity/roles/pages/role-form/RoleForm";
import { RoleList } from "../features/identity/roles/pages/role-list/RoleList";
import { MainLayout } from "../shell/main/MainLayout";

export function App() {
  const toast = useRef<Toast>(null);

  useEffect(() => {
    notificationService.register((message) => toast.current?.show(message));
  }, []);

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        header="Confirmação"
        icon="pi pi-question-circle"
        acceptLabel="Sim"
        rejectLabel="Não"
      />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="activate" element={<ActivateAccount />} />
          <Route path="password-recovery" element={<RequestPasswordReset />} />
          <Route
            path="password-recovery/password-reset"
            element={<PasswordReset />}
          />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/profile" element={<UserProfileForm />} />
          <Route
            path="system-settings"
            element={
              <AuthGuard authorities={["SYSTEM_SETTING_READ"]}>
                <SystemSettingForm />
              </AuthGuard>
            }
          />
          <Route path="users/create" element={<UserForm />} />
          <Route path="users/:userId/edit" element={<UserForm />} />
          <Route path="roles" element={<RoleList />} />
          <Route path="roles/create" element={<RoleForm />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </>
  );
}
