import { StockBalanceDTO } from "../dtos/stock-balance-dto";
import { StockBalanceMinimumUpdateDTO } from "../dtos/stock-balance-minimum-update-dto";
import { StockBalance } from "../models/StockBalance";

export class StockBalanceMapper {
  static toModel(dto: StockBalanceDTO): StockBalance {
    return new StockBalance({
      id: dto.id,

      version: dto.version,

      itemId: dto.itemId ?? undefined,

      itemName: dto.itemName || "",

      totalQuantity: dto.totalQuantity ?? 0,

      unavailableQuantity: dto.unavailableQuantity ?? 0,

      availableQuantity: dto.availableQuantity ?? 0,

      maintenanceQuantity: dto.maintenanceQuantity ?? 0,

      damagedQuantity: dto.damagedQuantity ?? 0,

      lostQuantity: dto.lostQuantity ?? 0,

      minimumQuantity: dto.minimumQuantity ?? 0,

      lowStock: dto.lowStock ?? false,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy ?? undefined,

      updatedBy: dto.updatedBy ?? undefined,
    });
  }

  static toMinimumUpdateDTO(
    stockBalance: StockBalance,
  ): StockBalanceMinimumUpdateDTO {
    return new StockBalanceMinimumUpdateDTO({
      id: stockBalance.id,

      minimumQuantity: stockBalance.minimumQuantity,
    });
  }
}
