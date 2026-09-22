import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { UserDTO } from "../dtos/user-dto";
import { UserMeUpdateDTO } from "../dtos/user-me-update-dto";
import { ChangePasswordDTO } from "../dtos/change-password-dto";

export const userProfileService = {
  async getMe(): Promise<UserDTO> {
    const response = await httpClient.get<UserDTO>(API.USER_PROFILE.ME);
    return response.data;
  },
  async updateMe(user: UserMeUpdateDTO): Promise<UserDTO> {
    const response = await httpClient.put<UserDTO>(API.USER_PROFILE.ME, user);
    return response.data;
  },
  async changePassword(password: ChangePasswordDTO): Promise<void> {
    await httpClient.put(API.USER_PROFILE.PASSWORD, password);
  },
  async getMyPhoto(): Promise<Blob> {
    const response = await httpClient.get(API.USER_PROFILE.PHOTO, {
      responseType: "blob",
    });
    return response.data;
  },
  async updateMyPhoto(file: File): Promise<void> {
    const body = new FormData();
    body.append("file", file);
    await httpClient.put(API.USER_PROFILE.PHOTO, body);
  },
};
