export class StockMovement {
  id?: number;
  itemId?: number;
  itemUnitId?: number | null;
  assetCode?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  status?: string | null;
  itemName: string = "";
  type: string = "ENTRY";
  quantity?: number | null;
  reason?: string | null;
  createdAt?: Date;
  createdBy?: string | null;

  constructor(stockMovement?: Partial<StockMovement>) {
    if (stockMovement != null) {
      if (stockMovement.id !== undefined) this.id = stockMovement.id;
      if (stockMovement.itemId !== undefined)
        this.itemId = stockMovement.itemId;
      if (stockMovement.itemUnitId !== undefined)
        this.itemUnitId = stockMovement.itemUnitId;
      if (stockMovement.assetCode !== undefined)
        this.assetCode = stockMovement.assetCode;
      if (stockMovement.previousStatus !== undefined)
        this.previousStatus = stockMovement.previousStatus;
      if (stockMovement.newStatus !== undefined)
        this.newStatus = stockMovement.newStatus;
      if (stockMovement.status !== undefined)
        this.status = stockMovement.status;
      if (stockMovement.itemName !== undefined)
        this.itemName = stockMovement.itemName;
      if (stockMovement.type !== undefined) this.type = stockMovement.type;
      if (stockMovement.quantity !== undefined)
        this.quantity = stockMovement.quantity;
      if (stockMovement.reason !== undefined)
        this.reason = stockMovement.reason;
      if (stockMovement.createdBy !== undefined)
        this.createdBy = stockMovement.createdBy;

      if (stockMovement.createdAt != null) {
        this.createdAt = new Date(stockMovement.createdAt);
      }
    }
  }
}
