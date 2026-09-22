import { SystemSettingDTO } from "../dtos/system-setting-dto";
import { SystemSettingUpdateDTO } from "../dtos/system-setting-update-dto";
import { Address } from "../models/Address";
import { SystemSetting } from "../models/SystemSetting";

export class SystemSettingMapper {
  static toModel(dto: SystemSettingDTO): SystemSetting {
    return new SystemSetting({
      id: dto.id,

      companyName: dto.companyName || "",
      icon: dto.icon || "fa-gamepad",

      address: new Address({
        street: dto.address?.street || "",
        number: dto.address?.number || "",
        complement: dto.address?.complement,
        neighborhood: dto.address?.neighborhood || "",
        city: dto.address?.city || "",
        state: dto.address?.state || "",
        zipCode: dto.address?.zipCode || "",
      }),
    });
  }

  static toUpdateDTO(systemSetting: SystemSetting): SystemSettingUpdateDTO {
    return new SystemSettingUpdateDTO({
      companyName: systemSetting.companyName,
      icon: systemSetting.icon,

      address: systemSetting.address,
    });
  }
}
