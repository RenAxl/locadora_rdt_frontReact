import { AddressDTO } from "./address-dto";

export class UserDetailsDTO {
  id?: number;
  name?: string;
  email?: string;
  active?: boolean;
  telephone?: string;
  address?: AddressDTO;
  roles: string[] = [];
  roleIds: number[] = [];
  photoContentType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(user?: Partial<UserDetailsDTO>) {
    if (user == null) return;
    Object.assign(this, user);
    if (user.createdAt != null) this.createdAt = new Date(user.createdAt);
    if (user.updatedAt != null) this.updatedAt = new Date(user.updatedAt);
  }
}
