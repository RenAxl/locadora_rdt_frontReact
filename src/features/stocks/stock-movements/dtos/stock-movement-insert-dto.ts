export class StockMovementInsertDTO {
  itemId: number | null = null;

  type: string = "ENTRY";

  quantity: number | null = null;

  reason?: string | null;

  itemUnitId?: number | null;

  status?: string | null;

  constructor(stockMovement?: Partial<StockMovementInsertDTO>) {
    if (stockMovement != null) {
      if (stockMovement.itemId != null) {
        this.itemId = stockMovement.itemId;
      }

      if (stockMovement.type != null) {
        this.type = stockMovement.type;
      }

      if (stockMovement.quantity != null) {
        this.quantity = stockMovement.quantity;
      }

      this.reason = stockMovement.reason;
      this.itemUnitId = stockMovement.itemUnitId;
      this.status = stockMovement.status;
    }
  }
}
