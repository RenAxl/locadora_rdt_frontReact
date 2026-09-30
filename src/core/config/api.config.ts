import { environment } from "../../environments/environment";

const BASE_URL = environment.apiUrl;

export const API = {
  BASE: BASE_URL,
  RECOVERY_PASSWORD: {
    REQUEST_PASSWORD_RESET: `${BASE_URL}/auth/request-password-reset`,
    PASSWORD_RESET: `${BASE_URL}/auth/password-reset`,
  },
  ACTIVATE_ACCOUNT: {
    ACTIVATE: `${BASE_URL}/auth/activate`,
  },
  SYSTEM_SETTINGS: {
    ROOT: `${BASE_URL}/system-settings`,
  },
  USER_PROFILE: {
    ME: `${BASE_URL}/user-profile/me`,
    PASSWORD: `${BASE_URL}/user-profile/me/password`,
    PHOTO: `${BASE_URL}/user-profile/me/photo`,
  },
  AUTH: {
    TOKEN: `${BASE_URL}/oauth/token`,
  },
  LISTING_EXPORTS: {
    EXCEL: `${BASE_URL}/listing-exports/excel`,
  },
  CUSTOMER_ACCOUNT: {
    REGISTER: `${BASE_URL}/customer-accounts`,
    CREATE_PASSWORD: `${BASE_URL}/customer-accounts/create-password`,
    RESEND_ACTIVATION: `${BASE_URL}/customer-accounts/resend-activation`,
  },
  CUSTOMERS: {
    ROOT: `${BASE_URL}/customers`,
    BY_ID: (id: number | string) => `${BASE_URL}/customers/${id}`,
    DELETE_ALL: `${BASE_URL}/customers/all`,
    CHANGE_ACTIVE: (id: number | string) =>
      `${BASE_URL}/customers/${id}/active`,
    PHOTO: (id: number) => `${BASE_URL}/customers/${id}/photo`,
    FILES: {
      ROOT: (customerId: number) => `${BASE_URL}/customers/${customerId}/files`,
      BY_ID: (customerId: number, fileId: number) =>
        `${BASE_URL}/customers/${customerId}/files/${fileId}`,
      VIEW: (customerId: number, fileId: number) =>
        `${BASE_URL}/customers/${customerId}/files/${fileId}/view`,
      DOWNLOAD: (customerId: number, fileId: number) =>
        `${BASE_URL}/customers/${customerId}/files/${fileId}/download`,
    },
  },
  POSITIONS: {
    ROOT: `${BASE_URL}/positions`,
    BY_ID: (id: number | string) => `${BASE_URL}/positions/${id}`,
  },
  DEPARTMENTS: {
    ROOT: `${BASE_URL}/departments`,
    BY_ID: (id: number | string) => `${BASE_URL}/departments/${id}`,
  },
  EMPLOYEES: {
    ROOT: `${BASE_URL}/employees`,
    BY_ID: (id: number | string) => `${BASE_URL}/employees/${id}`,
    DELETE_ALL: `${BASE_URL}/employees/all`,
    CHANGE_ACTIVE: (id: number | string) => `${BASE_URL}/employees/${id}/active`,
    PHOTO: (id: number) => `${BASE_URL}/employees/${id}/photo`,
    FILES: {
      ROOT: (employeeId: number) => `${BASE_URL}/employees/${employeeId}/files`,
      BY_ID: (employeeId: number, fileId: number) => `${BASE_URL}/employees/${employeeId}/files/${fileId}`,
      VIEW: (employeeId: number, fileId: number) => `${BASE_URL}/employees/${employeeId}/files/${fileId}/view`,
      DOWNLOAD: (employeeId: number, fileId: number) => `${BASE_URL}/employees/${employeeId}/files/${fileId}/download`,
    },
  },
  SUPPLIERS: {
    ROOT: `${BASE_URL}/suppliers`,
    BY_ID: (id: number | string) => `${BASE_URL}/suppliers/${id}`,
    IMAGE: (id: number) => `${BASE_URL}/suppliers/${id}/image`,
    FILES: {
      ROOT: (supplierId: number) => `${BASE_URL}/suppliers/${supplierId}/files`,
      BY_ID: (supplierId: number, fileId: number) => `${BASE_URL}/suppliers/${supplierId}/files/${fileId}`,
      VIEW: (supplierId: number, fileId: number) => `${BASE_URL}/suppliers/${supplierId}/files/${fileId}/view`,
      DOWNLOAD: (supplierId: number, fileId: number) => `${BASE_URL}/suppliers/${supplierId}/files/${fileId}/download`,
    },
  },
  USERS: {
    ROOT: `${BASE_URL}/users`,
    BY_ID: (id: number | string) => `${BASE_URL}/users/${id}`,
    DELETE_ALL: `${BASE_URL}/users/all`,
    CHANGE_ACTIVE: (id: number | string) => `${BASE_URL}/users/${id}/active`,
    ACTIVATE: `${BASE_URL}/auth/activate`,
    PHOTO: (id: number) => `${BASE_URL}/users/${id}/photo`,
  },
  ROLES: {
    ROOT: `${BASE_URL}/roles`,
    BY_ID: (id: number | string) => `${BASE_URL}/roles/${id}`,
    PERMISSIONS: (id: number | string) => `${BASE_URL}/roles/${id}/permissions`,
  },
  PERMISSIONS: {
    ROOT: `${BASE_URL}/permissions`,
    GROUPS: `${BASE_URL}/permissions/groups`,
  },
} as const;
