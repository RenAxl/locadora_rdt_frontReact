import { AddressDTO } from "./address-dto";

export class SystemSettingDTO {
  id?: number;
  companyName?: string;
  icon?: string;
  address?: AddressDTO;

  constructor(systemSetting?: Partial<SystemSettingDTO>) {
    Object.assign(this, systemSetting);
  }
}
