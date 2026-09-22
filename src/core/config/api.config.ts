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
