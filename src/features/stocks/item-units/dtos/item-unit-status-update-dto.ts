export class ItemUnitStatusUpdateDTO {
  status: string = "AVAILABLE";
  reason?: string | null;

  constructor(dto?: Partial<ItemUnitStatusUpdateDTO>) {
    if (dto != null) {
      if (dto.status != null) {
        this.status = dto.status;
      }

      this.reason = dto.reason;
    }
  }
}
