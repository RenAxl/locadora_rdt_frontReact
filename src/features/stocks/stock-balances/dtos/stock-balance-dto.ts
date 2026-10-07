export class StockBalanceDTO {
  id?: number;
  version?: number;

  itemId?: number;
  itemName?: string;

  totalQuantity?: number;
  unavailableQuantity?: number;
  availableQuantity?: number;
  maintenanceQuantity?: number;
  damagedQuantity?: number;
  lostQuantity?: number;
  minimumQuantity?: number;

  lowStock?: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  constructor(stockBalance?: Partial<StockBalanceDTO>) {
    if (stockBalance != null) {
      this.id = stockBalance.id;
      this.version = stockBalance.version;
      this.itemId = stockBalance.itemId;
      this.itemName = stockBalance.itemName;
      this.totalQuantity = stockBalance.totalQuantity;
      this.unavailableQuantity = stockBalance.unavailableQuantity;
      this.availableQuantity = stockBalance.availableQuantity;
      this.maintenanceQuantity = stockBalance.maintenanceQuantity;
      this.damagedQuantity = stockBalance.damagedQuantity;
      this.lostQuantity = stockBalance.lostQuantity;
      this.minimumQuantity = stockBalance.minimumQuantity;
      this.lowStock = stockBalance.lowStock;
      this.createdBy = stockBalance.createdBy;
      this.updatedBy = stockBalance.updatedBy;

      if (stockBalance.createdAt != null) {
        this.createdAt = new Date(stockBalance.createdAt);
      }

      if (stockBalance.updatedAt != null) {
        this.updatedAt = new Date(stockBalance.updatedAt);
      }
    }
  }
}
