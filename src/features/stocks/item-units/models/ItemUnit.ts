import { Item } from "../../items/models/Item";

export class ItemUnit {
  id?: number;
  version?: number;
  item?: Item;
  assetCode: string = "";
  status: string = "AVAILABLE";
  conditionStatus: string = "GOOD";
  purchaseDate?: string | null;
  notes: string = "";
  active: boolean = true;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(unit?: Partial<ItemUnit>) {
    if (unit != null) {
      if (unit.id !== undefined) this.id = unit.id;
      if (unit.version !== undefined) this.version = unit.version;
      if (unit.assetCode !== undefined) this.assetCode = unit.assetCode;
      if (unit.status !== undefined) this.status = unit.status;
      if (unit.conditionStatus !== undefined)
        this.conditionStatus = unit.conditionStatus;
      if (unit.purchaseDate !== undefined)
        this.purchaseDate = unit.purchaseDate;
      if (unit.notes !== undefined) this.notes = unit.notes;
      if (unit.active !== undefined) this.active = unit.active;
      if (unit.createdBy !== undefined) this.createdBy = unit.createdBy;
      if (unit.updatedBy !== undefined) this.updatedBy = unit.updatedBy;

      if (unit.item != null) {
        this.item = new Item(unit.item);
      }

      if (unit.createdAt != null) {
        this.createdAt = new Date(unit.createdAt);
      }

      if (unit.updatedAt != null) {
        this.updatedAt = new Date(unit.updatedAt);
      }
    }
  }
}
