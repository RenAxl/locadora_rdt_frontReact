export class Address {
  street: string = "";
  number: string = "";
  complement?: string;
  neighborhood: string = "";
  city: string = "";
  state: string = "";
  zipCode: string = "";

  constructor(address?: Partial<Address>) {
    Object.assign(this, address);
  }
}
