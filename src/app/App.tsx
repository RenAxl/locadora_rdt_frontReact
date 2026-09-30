import { DepartmentList } from "../features/organization/departments/pages/department-list/DepartmentList";
import { DepartmentForm } from "../features/organization/departments/pages/department-form/DepartmentForm";
import { PositionList } from "../features/organization/positions/pages/position-list/PositionList";
import { PositionForm } from "../features/organization/positions/pages/position-form/PositionForm";
import { EmployeeList } from "../features/organization/employees/pages/employee-list/EmployeeList";
import { EmployeeForm } from "../features/organization/employees/pages/employee-form/EmployeeForm";
import { SupplierList } from "../features/organization/suppliers/pages/supplier-list/SupplierList";
import { SupplierForm } from "../features/organization/suppliers/pages/supplier-form/SupplierForm";
import { NotAuthorized } from "../core/pages/not-authorized/NotAuthorized";
import { CustomerList } from "../features/organization/customers/pages/customer-list/CustomerList";
import { CustomerForm } from "../features/organization/customers/pages/customer-form/CustomerForm";
import { CustomerAccountRegister } from "../features/identity/customer-account/pages/customer-account-register/CustomerAccountRegister";
import { CustomerAccountCreatePassword } from "../features/identity/customer-account/pages/customer-account-create-password/CustomerAccountCreatePassword";
import { CustomerAccountResend } from "../features/identity/customer-account/pages/customer-account-resend/CustomerAccountResend";
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
          <Route
            path="customer-account"
            element={<Navigate to="/customer-account/register" replace />}
          />
          <Route
            path="customer-account/register"
            element={<CustomerAccountRegister />}
          />
          <Route
            path="customer-account/create-password"
            element={<CustomerAccountCreatePassword />}
          />
          <Route
            path="customer-account/resend"
            element={<CustomerAccountResend />}
          />
          <Route path="login" element={<LoginForm />} />
          <Route path="activate" element={<ActivateAccount />} />
          <Route path="password-recovery" element={<RequestPasswordReset />} />
          <Route
            path="password-recovery/password-reset"
            element={<PasswordReset />}
          />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="departments" element={<AuthGuard authorities={["DEPARTMENT_READ"]}><DepartmentList /></AuthGuard>} />
          <Route path="departments/create" element={<AuthGuard authorities={["DEPARTMENT_WRITE"]}><DepartmentForm /></AuthGuard>} />
          <Route path="departments/:departmentId/edit" element={<AuthGuard authorities={["DEPARTMENT_WRITE"]}><DepartmentForm /></AuthGuard>} />
          <Route path="positions" element={<AuthGuard authorities={["POSITION_READ"]}><PositionList /></AuthGuard>} />
          <Route path="positions/create" element={<AuthGuard authorities={["POSITION_WRITE"]}><PositionForm /></AuthGuard>} />
          <Route path="positions/:positionId/edit" element={<AuthGuard authorities={["POSITION_WRITE"]}><PositionForm /></AuthGuard>} />
          <Route path="employees" element={<AuthGuard authorities={["EMPLOYEE_READ"]}><EmployeeList /></AuthGuard>} />
          <Route path="employees/create" element={<AuthGuard authorities={["EMPLOYEE_WRITE"]}><EmployeeForm /></AuthGuard>} />
          <Route path="employees/:employeeId/edit" element={<AuthGuard authorities={["EMPLOYEE_WRITE"]}><EmployeeForm /></AuthGuard>} />
          <Route path="suppliers" element={<AuthGuard authorities={["SUPPLIER_READ"]}><SupplierList /></AuthGuard>} />
          <Route path="suppliers/create" element={<AuthGuard authorities={["SUPPLIER_WRITE"]}><SupplierForm /></AuthGuard>} />
          <Route path="suppliers/:supplierId/edit" element={<AuthGuard authorities={["SUPPLIER_WRITE"]}><SupplierForm /></AuthGuard>} />

          <Route
            path="customers"
            element={
              <AuthGuard authorities={["CUSTOMER_READ"]}>
                <CustomerList />
              </AuthGuard>
            }
          />
          <Route
            path="customers/create"
            element={
              <AuthGuard authorities={["CUSTOMER_WRITE"]}>
                <CustomerForm />
              </AuthGuard>
            }
          />
          <Route
            path="customers/:customerId/edit"
            element={
              <AuthGuard authorities={["CUSTOMER_WRITE"]}>
                <CustomerForm />
              </AuthGuard>
            }
          />
          <Route path="home" element={<Home />} />
          <Route
            path="users"
            element={
              <AuthGuard authorities={["USER_READ"]}>
                <UserList />
              </AuthGuard>
            }
          />
          <Route
            path="users/profile"
            element={
              <AuthGuard authorities={["USER_PROFILE_READ"]}>
                <UserProfileForm />
              </AuthGuard>
            }
          />
          <Route
            path="system-settings"
            element={
              <AuthGuard authorities={["SYSTEM_SETTING_READ"]}>
                <SystemSettingForm />
              </AuthGuard>
            }
          />
          <Route
            path="users/create"
            element={
              <AuthGuard authorities={["USER_WRITE"]}>
                <UserForm />
              </AuthGuard>
            }
          />
          <Route
            path="users/:userId/edit"
            element={
              <AuthGuard authorities={["USER_WRITE"]}>
                <UserForm />
              </AuthGuard>
            }
          />
          <Route
            path="roles"
            element={
              <AuthGuard authorities={["ROLE_READ"]}>
                <RoleList />
              </AuthGuard>
            }
          />
          <Route
            path="roles/create"
            element={
              <AuthGuard authorities={["ROLE_WRITE"]}>
                <RoleForm />
              </AuthGuard>
            }
          />
        </Route>
        <Route path="not-authorized" element={<NotAuthorized />} />
        <Route path="page-not-found" element={<PageNotFound />} />
        <Route path="*" element={<Navigate to="/page-not-found" replace />} />
      </Routes>
    </>
  );
}
