export class ReceivableFilters {
  search: string = "";
  description: string = "";
  startDate: string | null = null;
  endDate: string | null = null;
  status: string = "ALL";
  periodType: string = "DUE_DATE";
  dateType: string = "due";
  customerId: number | null = null;
  paymentMethodId: number | null = null;
  paymentFrequencyId: number | null = null;
  minimumAmount: number | null = null;
  maximumAmount: number | null = null;
  orderBy: string = "dueDate";
  direction: string = "ASC";
}
