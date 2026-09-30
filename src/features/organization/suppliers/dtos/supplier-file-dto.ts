export class SupplierFileDTO {
  id?: number;
  name?: string;
  originalFileName?: string;
  storedFileName?: string;
  contentType?: string;
  size?: number;
  supplierId?: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(file?: Partial<SupplierFileDTO>) {
    if (file != null) {
      this.id = file.id;
      this.name = file.name;
      this.originalFileName = file.originalFileName;
      this.storedFileName = file.storedFileName;
      this.contentType = file.contentType;
      this.size = file.size;
      this.supplierId = file.supplierId;
      if (file.createdAt != null) {
        this.createdAt = new Date(file.createdAt);
      }

      if (file.updatedAt != null) {
        this.updatedAt = new Date(file.updatedAt);
      }
    }
  }
}
