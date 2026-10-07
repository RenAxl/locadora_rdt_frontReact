export class StockReportFilter {
  search: string = "";
  categoryId: number | null = null;
  itemId: number | null = null;
  active: boolean | null = true;
  status: string = "ALL";
  conditionStatus: string = "ALL";
  movementType: string = "ALL";
  startDate: string | null = null;
  endDate: string | null = null;
}
