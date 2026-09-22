import { UserMeUpdateDTO } from "../dtos/user-me-update-dto";
import { UserDetailsDTO } from "../dtos/user-details-dto";
import { UserDTO } from "../dtos/user-dto";
import { UserInsertDTO } from "../dtos/user-insert-dto";
import { UserUpdateDTO } from "../dtos/user-update-dto";
import { Address } from "../models/Address";
import { User } from "../models/User";

export class UserMapper {
  static toModel(dto: UserDTO): User {
    return new User({
      id: dto.id,
      name: dto.name || "",
      email: dto.email || "",
      active: dto.active ?? true,
      telephone: dto.telephone || "",
      address: new Address({
        street: dto.address?.street || "",
        number: dto.address?.number || "",
        complement: dto.address?.complement,
        neighborhood: dto.address?.neighborhood || "",
        city: dto.address?.city || "",
        state: dto.address?.state || "",
        zipCode: dto.address?.zipCode || "",
      }),
      photoContentType: dto.photoContentType,
      roleIds: [],
      roles: [],
    });
  }

  static toDetailsModel(dto: UserDetailsDTO): User {
    return new User({
      ...this.toModel(dto),
      roleIds: dto.roleIds || [],
      roles: dto.roles || [],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      createdBy: dto.createdBy,
      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(user: User): UserInsertDTO {
    return new UserInsertDTO({
      name: user.name,
      email: user.email,
      telephone: user.telephone.replace(/\D/g, ""),
      address: {
        ...user.address,
        zipCode: user.address.zipCode.replace(/\D/g, ""),
      },
      roleIds: user.roleIds,
    });
  }

  static toUpdateDTO(user: User): UserUpdateDTO {
    return new UserUpdateDTO({
      id: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      telephone: user.telephone.replace(/\D/g, ""),
      address: {
        ...user.address,
        zipCode: user.address.zipCode.replace(/\D/g, ""),
      },
      roleIds: user.roleIds,
    });
  }

  static toMeUpdateDTO(user: User): UserMeUpdateDTO {
    return new UserMeUpdateDTO({
      name: user.name,
      email: user.email,
      telephone: user.telephone.replace(/\D/g, ""),
      address: {
        ...user.address,
        zipCode: user.address.zipCode.replace(/\D/g, ""),
      },
    });
  }

  static toModelList(dtos: UserDTO[]): User[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
