import { ChangePasswordDTO } from "../dtos/change-password-dto";
import { ChangePassword } from "../models/ChangePassword";

export class ChangePasswordMapper {
  static toDTO(password: ChangePassword): ChangePasswordDTO {
    return new ChangePasswordDTO({
      currentPassword: password.currentPassword,
      newPassword: password.newPassword,
    });
  }
}
