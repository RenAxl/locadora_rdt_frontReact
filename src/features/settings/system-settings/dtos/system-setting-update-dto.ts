import { AddressDTO } from "./address-dto";

export class SystemSettingUpdateDTO {
  companyName: string = "";
  icon: string = "fa-gamepad";
  address: AddressDTO = new AddressDTO();

  constructor(systemSetting?: Partial<SystemSettingUpdateDTO>) {
    Object.assign(this, systemSetting);
  }
}
