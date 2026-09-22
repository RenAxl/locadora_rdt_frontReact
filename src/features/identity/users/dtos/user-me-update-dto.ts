import { AddressDTO } from "./address-dto";

export class UserMeUpdateDTO {
  name: string = "";
  email: string = "";
  telephone: string = "";
  address: AddressDTO = new AddressDTO();

  constructor(user?: Partial<UserMeUpdateDTO>) {
    Object.assign(this, user);
  }
}
