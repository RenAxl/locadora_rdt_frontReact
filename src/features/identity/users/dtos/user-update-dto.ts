import { AddressDTO } from "./address-dto";

export class UserUpdateDTO {
  id?: number;
  name = "";
  email = "";
  active = true;
  telephone = "";
  address = new AddressDTO();
  roleIds: number[] = [];

  constructor(user?: Partial<UserUpdateDTO>) {
    if (user != null) Object.assign(this, user);
  }
}
