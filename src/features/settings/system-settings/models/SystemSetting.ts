import { Address } from "./Address";

export class SystemSetting {
  id?: number;
  companyName: string = "";
  icon: string = "fa-gamepad";
  address: Address = new Address();

  constructor(systemSetting?: Partial<SystemSetting>) {
    Object.assign(this, systemSetting);
  }
}
