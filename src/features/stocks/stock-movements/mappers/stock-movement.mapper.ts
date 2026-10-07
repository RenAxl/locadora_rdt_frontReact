import { StockMovementDTO } from "../dtos/stock-movement-dto";
import { StockMovementInsertDTO } from "../dtos/stock-movement-insert-dto";
import { StockMovement } from "../models/StockMovement";

export class StockMovementMapper {
  static toModel(dto: StockMovementDTO): StockMovement {
    return new StockMovement({
      id: dto.id,

      itemId: dto.itemId,

      itemName: dto.itemName || "",

      itemUnitId: dto.itemUnitId,

      assetCode: dto.assetCode,

      previousStatus: dto.previousStatus,

      newStatus: dto.newStatus,

      type: dto.type || "ENTRY",

      quantity: dto.quantity,

      reason: dto.reason,

      createdAt: dto.createdAt,

      createdBy: dto.createdBy,
    });
  }

  static toInsertDTO(stockMovement: StockMovement): StockMovementInsertDTO {
    return new StockMovementInsertDTO({
      itemId: stockMovement.itemId ?? null,

      type: stockMovement.type,

      quantity: stockMovement.quantity ?? null,

      reason: stockMovement.reason ?? null,

      itemUnitId: stockMovement.itemUnitId ?? null,

      status: stockMovement.status ?? null,
    });
  }
}
