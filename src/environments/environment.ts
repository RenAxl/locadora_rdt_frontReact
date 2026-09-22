export const environment = {
  oauthBasicAuth:
    import.meta.env.VITE_OAUTH_BASIC_AUTH ||
    "Basic bG9jYWRvcmFyZHQ6bG9jYWRvcmFyZHQxMjM=",
  production: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8080",
};
