export class Address {
  street = "";
  number = "";
  complement?: string;
  neighborhood = "";
  city = "";
  state = "";
  zipCode = "";

  constructor(address?: Partial<Address>) {
    if (address != null) Object.assign(this, address);
  }
}
