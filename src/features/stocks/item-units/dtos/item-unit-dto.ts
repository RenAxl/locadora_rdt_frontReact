import { ItemDTO } from "../../items/dtos/item-dto";

export class ItemUnitDTO {
  id?: number;
  version?: number;
  item?: ItemDTO;
  assetCode?: string;
  status?: string;
  conditionStatus?: string;
  purchaseDate?: string | null;
  notes?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(unit?: Partial<ItemUnitDTO>) {
    if (unit != null) {
      this.id = unit.id;
      this.version = unit.version;
      this.item = unit.item;
      this.assetCode = unit.assetCode;
      this.status = unit.status;
      this.conditionStatus = unit.conditionStatus;
      this.purchaseDate = unit.purchaseDate;
      this.notes = unit.notes;
      this.active = unit.active;
      this.createdBy = unit.createdBy;
      this.updatedBy = unit.updatedBy;

      if (unit.createdAt != null) {
        this.createdAt = new Date(unit.createdAt);
      }

      if (unit.updatedAt != null) {
        this.updatedAt = new Date(unit.updatedAt);
      }
    }
  }
}
