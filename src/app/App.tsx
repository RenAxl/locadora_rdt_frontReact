import { CategoryList } from "../features/stocks/categories/pages/category-list/CategoryList";
import { CategoryForm } from "../features/stocks/categories/pages/category-form/CategoryForm";
import { ItemList } from "../features/stocks/items/pages/item-list/ItemList";
import { ItemForm } from "../features/stocks/items/pages/item-form/ItemForm";
import { ItemUnitList } from "../features/stocks/item-units/pages/item-unit-list/ItemUnitList";
import { ItemUnitForm } from "../features/stocks/item-units/pages/item-unit-form/ItemUnitForm";
import { StockBalanceList } from "../features/stocks/stock-balances/pages/stock-balance-list/StockBalanceList";
import { StockMovementList } from "../features/stocks/stock-movements/pages/stock-movement-list/StockMovementList";
import { StockMovementForm } from "../features/stocks/stock-movements/pages/stock-movement-form/StockMovementForm";
import { StockReportList } from "../features/reports/stock-reports/pages/stock-report-list/StockReportList";
import { Contact } from "../features/contact/pages/Contact";
import { PayableList } from "../features/financial/payables/pages/payable-list/PayableList";
import { PayableForm } from "../features/financial/payables/pages/payable-form/PayableForm";
import { ReceivableList } from "../features/financial/receivables/pages/receivable-list/ReceivableList";
import { ReceivableForm } from "../features/financial/receivables/pages/receivable-form/ReceivableForm";
import { PaymentMethodList } from "../features/financial/payment-methods/pages/payment-method-list/PaymentMethodList";
import { PaymentMethodForm } from "../features/financial/payment-methods/pages/payment-method-form/PaymentMethodForm";
import { PaymentFrequencyList } from "../features/financial/payment-frequencies/pages/payment-frequency-list/PaymentFrequencyList";
import { PaymentFrequencyForm } from "../features/financial/payment-frequencies/pages/payment-frequency-form/PaymentFrequencyForm";
import { FinancialSettingForm } from "../features/settings/financial-settings/pages/financial-setting-form/FinancialSettingForm";
import { FinancialReportList } from "../features/reports/financial-reports/pages/financial-report-list/FinancialReportList";
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
          <Route path="contact" element={<AuthGuard><Contact /></AuthGuard>} />
          <Route path="categories" element={<AuthGuard authorities={["CATEGORY_READ"]}><CategoryList /></AuthGuard>} />
          <Route path="categories/create" element={<AuthGuard authorities={["CATEGORY_WRITE"]}><CategoryForm /></AuthGuard>} />
          <Route path="categories/:categoryId/edit" element={<AuthGuard authorities={["CATEGORY_WRITE"]}><CategoryForm /></AuthGuard>} />
          <Route path="items" element={<AuthGuard authorities={["ITEM_READ"]}><ItemList /></AuthGuard>} />
          <Route path="items/create" element={<AuthGuard authorities={["ITEM_WRITE"]}><ItemForm /></AuthGuard>} />
          <Route path="items/:itemId/edit" element={<AuthGuard authorities={["ITEM_WRITE"]}><ItemForm /></AuthGuard>} />
          <Route path="item-units" element={<AuthGuard authorities={["ITEM_UNIT_READ"]}><ItemUnitList /></AuthGuard>} />
          <Route path="item-units/create" element={<AuthGuard authorities={["ITEM_UNIT_WRITE"]}><ItemUnitForm /></AuthGuard>} />
          <Route path="item-units/:itemUnitId/edit" element={<AuthGuard authorities={["ITEM_UNIT_WRITE"]}><ItemUnitForm /></AuthGuard>} />
          <Route path="stock-balances" element={<AuthGuard authorities={["STOCK_BALANCES_READ"]}><StockBalanceList /></AuthGuard>} />
          <Route path="stock-movements" element={<AuthGuard authorities={["STOCK_MOVEMENTS_READ"]}><StockMovementList /></AuthGuard>} />
          <Route path="stock-movements/create" element={<AuthGuard authorities={["STOCK_MOVEMENTS_WRITE"]}><StockMovementForm /></AuthGuard>} />
          <Route path="reports/stock-reports" element={<AuthGuard authorities={["STOCK_REPORTS_READ"]}><StockReportList /></AuthGuard>} />
          <Route path="stock-balances/:itemId/units" element={<AuthGuard authorities={["STOCK_BALANCES_READ"]}><AuthGuard authorities={["ITEM_UNIT_READ"]}><ItemUnitList /></AuthGuard></AuthGuard>} />
          <Route path="stock-balances/:itemId/units/create" element={<AuthGuard authorities={["STOCK_BALANCES_READ"]}><AuthGuard authorities={["ITEM_UNIT_WRITE"]}><ItemUnitForm /></AuthGuard></AuthGuard>} />
          <Route path="stock-balances/:itemId/units/:itemUnitId/edit" element={<AuthGuard authorities={["STOCK_BALANCES_READ"]}><AuthGuard authorities={["ITEM_UNIT_WRITE"]}><ItemUnitForm /></AuthGuard></AuthGuard>} />

          <Route path="payables" element={<AuthGuard authorities={["PAYABLE_READ"]}><PayableList /></AuthGuard>} />
          <Route path="payables/create" element={<AuthGuard authorities={["PAYABLE_WRITE"]}><PayableForm /></AuthGuard>} />
          <Route path="payables/:payableId/edit" element={<AuthGuard authorities={["PAYABLE_WRITE"]}><PayableForm /></AuthGuard>} />
          <Route path="receivables" element={<AuthGuard authorities={["RECEIVABLE_READ"]}><ReceivableList /></AuthGuard>} />
          <Route path="receivables/create" element={<AuthGuard authorities={["RECEIVABLE_WRITE"]}><ReceivableForm /></AuthGuard>} />
          <Route path="receivables/:receivableId/edit" element={<AuthGuard authorities={["RECEIVABLE_WRITE"]}><ReceivableForm /></AuthGuard>} />
          <Route path="payment-methods" element={<AuthGuard authorities={["METHODS_READ"]}><PaymentMethodList /></AuthGuard>} />
          <Route path="payment-methods/create" element={<AuthGuard authorities={["METHODS_WRITE"]}><PaymentMethodForm /></AuthGuard>} />
          <Route path="payment-methods/:paymentMethodId/edit" element={<AuthGuard authorities={["METHODS_WRITE"]}><PaymentMethodForm /></AuthGuard>} />
          <Route path="payment-frequencies" element={<AuthGuard authorities={["FREQUENCY_READ"]}><PaymentFrequencyList /></AuthGuard>} />
          <Route path="payment-frequencies/create" element={<AuthGuard authorities={["FREQUENCY_WRITE"]}><PaymentFrequencyForm /></AuthGuard>} />
          <Route path="payment-frequencies/:paymentFrequencyId/edit" element={<AuthGuard authorities={["FREQUENCY_WRITE"]}><PaymentFrequencyForm /></AuthGuard>} />
          <Route path="financial-settings" element={<AuthGuard authorities={["FINANCIAL_SETTINGS_READ"]}><FinancialSettingForm /></AuthGuard>} />
          <Route path="reports" element={<Navigate to="/reports/financial-reports" replace />} />
          <Route path="reports/financial-reports" element={<AuthGuard authorities={["FINANCIAL_REPORTS_READ"]}><FinancialReportList /></AuthGuard>} />

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
