import { FinancialReportDTO } from "../dtos/financial-report-dto";
import { FinancialReportFilterDTO } from "../dtos/financial-report-filter-dto";
import { FinancialReport } from "../models/FinancialReport";
import { FinancialReportFilter } from "../models/FinancialReportFilter";
import { FinancialReportMonth } from "../models/FinancialReportMonth";

export class FinancialReportMapper {
  static toModel(dto: FinancialReportDTO): FinancialReport {
    const months: FinancialReportMonth[] = [];

    if (dto.months != null) {
      for (const month of dto.months) {
        months.push(
          new FinancialReportMonth({
            month: month.month || 0,
            label: month.label || "",
            receivableTotal: month.receivableTotal || 0,
            payableTotal: month.payableTotal || 0,
          }),
        );
      }
    }

    return new FinancialReport({
      receivableTotal: dto.receivableTotal || 0,

      payableTotal: dto.payableTotal || 0,

      balance: dto.balance || 0,

      receivableCount: dto.receivableCount || 0,

      payableCount: dto.payableCount || 0,

      year: dto.year || new Date().getFullYear(),

      months: months,
    });
  }

  static toFilterDTO(filter: FinancialReportFilter): FinancialReportFilterDTO {
    const search = filter.search.trim();

    return new FinancialReportFilterDTO({
      search: search || undefined,

      startDate: filter.startDate || null,

      endDate: filter.endDate || null,

      status: filter.status || "ALL",

      periodType: filter.periodType || "DUE_DATE",

      customerId: filter.customerId || null,

      supplierId: filter.supplierId || null,

      employeeId: filter.employeeId || null,

      paymentMethodId: filter.paymentMethodId || null,

      minimumAmount: filter.minimumAmount ?? null,

      maximumAmount: filter.maximumAmount ?? null,

      year: filter.year || null,
    });
  }
}
