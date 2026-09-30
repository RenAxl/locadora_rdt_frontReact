export class AddressDTO {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  constructor(address?: Partial<AddressDTO>) {
    if (address != null) {
      this.street = address.street;
      this.number = address.number;
      this.complement = address.complement;
      this.neighborhood = address.neighborhood;
      this.city = address.city;
      this.state = address.state;
      this.zipCode = address.zipCode;
    }
  }
}
