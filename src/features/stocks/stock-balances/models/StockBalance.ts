export class StockBalance {
  id?: number;
  version?: number;
  itemId?: number;
  itemName: string = "";
  totalQuantity: number = 0;
  unavailableQuantity: number = 0;
  availableQuantity: number = 0;
  maintenanceQuantity: number = 0;
  damagedQuantity: number = 0;
  lostQuantity: number = 0;
  minimumQuantity: number = 0;
  lowStock: boolean = false;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(stockBalance?: Partial<StockBalance>) {
    if (stockBalance != null) {
      if (stockBalance.id !== undefined) this.id = stockBalance.id;
      if (stockBalance.version !== undefined)
        this.version = stockBalance.version;
      if (stockBalance.itemId !== undefined) this.itemId = stockBalance.itemId;
      if (stockBalance.itemName !== undefined)
        this.itemName = stockBalance.itemName;
      if (stockBalance.totalQuantity !== undefined)
        this.totalQuantity = stockBalance.totalQuantity;
      if (stockBalance.unavailableQuantity !== undefined)
        this.unavailableQuantity = stockBalance.unavailableQuantity;
      if (stockBalance.availableQuantity !== undefined)
        this.availableQuantity = stockBalance.availableQuantity;
      if (stockBalance.maintenanceQuantity !== undefined)
        this.maintenanceQuantity = stockBalance.maintenanceQuantity;
      if (stockBalance.damagedQuantity !== undefined)
        this.damagedQuantity = stockBalance.damagedQuantity;
      if (stockBalance.lostQuantity !== undefined)
        this.lostQuantity = stockBalance.lostQuantity;
      if (stockBalance.minimumQuantity !== undefined)
        this.minimumQuantity = stockBalance.minimumQuantity;
      if (stockBalance.lowStock !== undefined)
        this.lowStock = stockBalance.lowStock;
      if (stockBalance.createdBy !== undefined)
        this.createdBy = stockBalance.createdBy;
      if (stockBalance.updatedBy !== undefined)
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
