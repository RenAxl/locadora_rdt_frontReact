import { API } from "../../config/api.config";
import { httpClient } from "../../http/interceptors/http-client";
import { environment } from "../../../environments/environment";
import { OAuthTokenResponse } from "../models/OAuthTokenResponse";
import { tokenService } from "./token.service";

export const authService = {
  async login(email: string, password: string): Promise<OAuthTokenResponse> {
    const body = new URLSearchParams({
      username: email,
      password,
      grant_type: "password",
    });
    const response = await httpClient.post<OAuthTokenResponse>(
      API.AUTH.TOKEN,
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: environment.oauthBasicAuth,
        },
      },
    );
    if (response.data.access_token)
      tokenService.setToken(response.data.access_token);
    return response.data;
  },
  logout(): void {
    tokenService.clearToken();
  },
  isAccessTokenInvalid(): boolean {
    const payload = tokenService.getPayload();
    if (!payload) return true;
    return payload.exp != null && payload.exp * 1000 <= Date.now();
  },
  hasAuthority(authority: string): boolean {
    const authorities = tokenService.getPayload()?.authorities;
    if (!authority || !Array.isArray(authorities)) return false;
    return authorities.some(
      (item) => typeof item === "string" && item.trim() === authority.trim(),
    );
  },
  hasAnyAuthority(authorities: string[]): boolean {
    return (
      authorities.length === 0 ||
      authorities.some((authority) => this.hasAuthority(authority))
    );
  },
  hasAllAuthorities(authorities: string[]): boolean {
    return authorities.every((authority) => this.hasAuthority(authority));
  },
  getUsernameFromToken(): string | null {
    return tokenService.getPayload()?.user_name || null;
  },
};
