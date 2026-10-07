export class StockMovementDTO {
  id?: number;
  itemId?: number;
  itemUnitId?: number | null;
  assetCode?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  itemName?: string;
  type?: string;
  quantity?: number | null;
  reason?: string | null;
  createdAt?: Date;
  createdBy?: string | null;

  constructor(stockMovement?: Partial<StockMovementDTO>) {
    if (stockMovement != null) {
      this.id = stockMovement.id;
      this.itemId = stockMovement.itemId;
      this.itemUnitId = stockMovement.itemUnitId;
      this.assetCode = stockMovement.assetCode;
      this.previousStatus = stockMovement.previousStatus;
      this.newStatus = stockMovement.newStatus;
      this.itemName = stockMovement.itemName;
      this.type = stockMovement.type;
      this.quantity = stockMovement.quantity;
      this.reason = stockMovement.reason;
      this.createdBy = stockMovement.createdBy;

      if (stockMovement.createdAt != null) {
        this.createdAt = new Date(stockMovement.createdAt);
      }
    }
  }
}
