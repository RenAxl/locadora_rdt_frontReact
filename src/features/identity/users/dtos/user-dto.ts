import { AddressDTO } from "./address-dto";

export class UserDTO {
  id?: number;
  name?: string;
  email?: string;
  active?: boolean;
  telephone?: string;
  photoContentType?: string;
  address?: AddressDTO;

  constructor(user?: Partial<UserDTO>) {
    if (user != null) Object.assign(this, user);
  }
}
