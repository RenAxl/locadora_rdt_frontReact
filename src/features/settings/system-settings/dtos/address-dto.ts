export class AddressDTO {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  constructor(address?: Partial<AddressDTO>) {
    Object.assign(this, address);
  }
}
