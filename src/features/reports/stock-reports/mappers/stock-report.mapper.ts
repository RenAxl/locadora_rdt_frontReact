import { StockReportDTO } from "../dtos/stock-report-dto";
import { StockReportFilterDTO } from "../dtos/stock-report-filter-dto";
import { StockReport } from "../models/StockReport";
import { StockReportFilter } from "../models/StockReportFilter";

export class StockReportMapper {
  static toModel(dto: StockReportDTO): StockReport {
    const report = new StockReport();
    report.itemCount = dto.itemCount || 0;
    report.totalQuantity = dto.totalQuantity || 0;
    report.availableQuantity = dto.availableQuantity || 0;
    report.unavailableQuantity = dto.unavailableQuantity || 0;
    report.maintenanceQuantity = dto.maintenanceQuantity || 0;
    report.damagedQuantity = dto.damagedQuantity || 0;
    report.lostQuantity = dto.lostQuantity || 0;
    report.lowStockItemCount = dto.lowStockItemCount || 0;
    return report;
  }

  static toFilterDTO(
    filter: StockReportFilter,
    reportType: string,
  ): StockReportFilterDTO {
    const dto = new StockReportFilterDTO();
    dto.search = filter.search.trim() || undefined;
    dto.categoryId = filter.categoryId;
    dto.itemId = filter.itemId;
    if (reportType === "movements") {
      dto.movementType = filter.movementType;
      dto.startDate = filter.startDate;
      dto.endDate = filter.endDate;
    } else {
      dto.active = filter.active;
    }
    if (reportType === "item-units") {
      dto.status = filter.status;
      dto.conditionStatus = filter.conditionStatus;
    }
    return dto;
  }

  static toSummaryFilterDTO(filter: StockReportFilter): StockReportFilterDTO {
    const dto = new StockReportFilterDTO();
    dto.categoryId = filter.categoryId;
    dto.itemId = filter.itemId;
    return dto;
  }
}
