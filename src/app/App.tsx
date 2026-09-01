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
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="users" element={<UserList />} />
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
