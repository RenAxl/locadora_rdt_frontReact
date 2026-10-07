export class StockReportFilterDTO {
  search?: string;
  categoryId?: number | null;
  itemId?: number | null;
  active?: boolean | null;
  status?: string;
  conditionStatus?: string;
  movementType?: string;
  startDate?: string | null;
  endDate?: string | null;
}
