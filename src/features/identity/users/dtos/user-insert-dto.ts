import { AddressDTO } from "./address-dto";

export class UserInsertDTO {
  name = "";
  email = "";
  telephone = "";
  address?: AddressDTO;
  roleIds: number[] = [];

  constructor(user?: Partial<UserInsertDTO>) {
    if (user != null) Object.assign(this, user);
  }
}
