const TOKEN_KEY = "token";

export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
  getPayload(): {
    exp?: number;
    user_name?: string;
    authorities?: string[];
  } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(payload), (character) =>
        character.charCodeAt(0),
      );
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  },
};
