import { Address } from "./Address";

export class User {
  id?: number;
  name = "";
  email = "";
  password?: string;
  active = true;
  telephone = "";
  address = new Address();
  roleIds: number[] = [];
  roles: string[] = [];
  photo?: unknown;
  photoContentType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(user?: Partial<User>) {
    if (user == null) return;
    Object.assign(this, user);
    if (user.address != null) this.address = new Address(user.address);
    if (user.createdAt != null) this.createdAt = new Date(user.createdAt);
    if (user.updatedAt != null) this.updatedAt = new Date(user.updatedAt);
  }
}
