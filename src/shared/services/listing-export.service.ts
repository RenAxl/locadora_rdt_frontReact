import { confirmDialog } from "primereact/confirmdialog";
import { API } from "../../core/config/api.config";
import { notificationService } from "../../core/error/services/notification.service";
import { httpClient } from "../../core/http/interceptors/http-client";
import { PageResponse } from "../../core/models/page-response";
import { Pagination } from "../../core/models/Pagination";
import { CustomizableField } from "../models/customizable-field";

export const listingExportService = {
  confirmAndExport<T>(
    title: string,
    fileName: string,
    fields: CustomizableField[],
    pagination: Pagination,
    totalElements: number,
    load: (pagination: Pagination) => Promise<PageResponse<T>>,
  ): void {
    confirmDialog({
      message: "Deseja exportar a listagem para o Excel?",
      acceptLabel: "Sim",
      rejectLabel: "Não",
      accept: async () => {
        const exportPagination = new Pagination(
          0,
          Math.max(totalElements, 1),
          pagination.direction,
          pagination.orderBy,
        );
        try {
          const page = await load(exportPagination);
          await this.generateFile(title, fileName, fields, page.content);
        } catch {
          this.showError();
        }
      },
    });
  },

  async generateFile<T>(
    title: string,
    fileName: string,
    fields: CustomizableField[],
    items: T[],
  ) {
    const request = {
      title,
      columns: fields.map((field) => field.label),
      rows: items.map((item) => this.createRow(item, fields)),
    };
    const response = await httpClient.post(API.LISTING_EXPORTS.EXCEL, request, {
      responseType: "blob",
    });
    this.download(response.data, fileName);
  },

  createRow<T>(item: T, fields: CustomizableField[]): Record<string, string> {
    const row: Record<string, string> = {};
    fields.forEach((field, index) => {
      row[`column${index}`] = this.formatValue(
        this.getValue(item, field.field),
      );
    });
    return row;
  },

  getValue(item: any, field: string): any {
    let value = item;
    for (const fieldPart of field.split(".")) {
      if (value === null || value === undefined) return "";
      value = value[fieldPart];
    }
    return value;
  },

  formatValue(value: any): string {
    if (value === true) return "Sim";
    if (value === false) return "Não";
    if (value === null || value === undefined) return "";
    if (Array.isArray(value))
      return value.map((item) => this.formatValue(item)).join(", ");
    if (typeof value === "object") return value.name || value.description || "";
    return String(value);
  },

  download(file: Blob, fileName: string): void {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  },

  showError(): void {
    notificationService.add({
      severity: "error",
      detail: "Não foi possível exportar a listagem para o Excel.",
    });
  },
};
