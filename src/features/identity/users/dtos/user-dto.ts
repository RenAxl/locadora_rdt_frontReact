import { AddressDTO } from "./address-dto";

export class UserDTO {
  roles?: string[];
  id?: number;
  name?: string;
  email?: string;
  active?: boolean;
  telephone?: string;
  photoContentType?: string;
  address?: AddressDTO;

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  roleIds: number[] = [];

  constructor(user?: Partial<UserDTO>) {
    if (user != null) {
      this.id = user.id;
      this.name = user.name;
      this.email = user.email;
      this.active = user.active;
      this.telephone = user.telephone;
      this.photoContentType = user.photoContentType;
      this.address = user.address;
      this.roles = user.roles || [];
      this.roleIds = user.roleIds || [];
      this.createdBy = user.createdBy;
      this.updatedBy = user.updatedBy;
      if (user.createdAt != null) this.createdAt = new Date(user.createdAt);
      if (user.updatedAt != null) this.updatedAt = new Date(user.updatedAt);
    }
  }
}
