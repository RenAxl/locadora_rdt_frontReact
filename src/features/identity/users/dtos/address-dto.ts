export class AddressDTO {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  constructor(address?: Partial<AddressDTO>) {
    if (address != null) Object.assign(this, address);
  }
}
