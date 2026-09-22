import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable as PrimeDataTable } from "primereact/datatable";
import { PageResponse } from "../../../core/models/page-response";
import { Pagination } from "../../../core/models/Pagination";
import { ExcelExport } from "../excel-export/ExcelExport";
import { DataTableColumn } from "./models/data-table-column";
import "./DataTable.css";

export interface LazyLoadEvent {
  first?: number;
  rows?: number;
  sortField?: string;
  sortOrder?: 1 | 0 | -1 | null;
}

interface DataTableProps<T extends { id?: number; active?: boolean }> {
  records: T[];
  columns: DataTableColumn[];
  selectedRecords: T[];
  totalRecords: number;
  rows: number;
  loading: boolean;
  emptyMessage?: string;
  columnTemplates?: Record<string, (record: T) => React.ReactNode>;
  actionsTemplate?: (record: T) => React.ReactNode;
  showColumnsButton?: boolean;
  showExportButton?: boolean;
  exportTitle: string;
  exportFileName: string;
  exportPagination: Pagination;
  exportLoadRecords: (pagination: Pagination) => Promise<PageResponse<any>>;
  onLazyLoad: (event: LazyLoadEvent) => void;
  onSelectedRecordsChange: (records: T[]) => void;
  onColumnsButtonClick: () => void;
}

export function DataTable<T extends { id?: number; active?: boolean }>(
  props: DataTableProps<T>,
) {
  const getFieldValue = (record: any, field: string): any => {
    let value = record;
    field.split(".").forEach((item) => {
      if (value != null) value = value[item];
    });
    if (value === null || value === undefined || value === "") return "-";
    return value;
  };

  const bodyFor = (column: DataTableColumn) => (record: T) => {
    if (props.columnTemplates?.[column.field])
      return props.columnTemplates[column.field](record);
    return getFieldValue(record, column.field);
  };

  return (
    <div className="global-table-card">
      {(props.showColumnsButton || props.showExportButton) && (
        <div className="table-toolbar">
          {props.showColumnsButton && (
            <Button
              type="button"
              className="p-button-rounded p-button-text"
              icon="pi pi-cog"
              tooltip="Personalizar colunas"
              tooltipOptions={{ position: "left" }}
              onClick={props.onColumnsButtonClick}
            />
          )}
          {props.showExportButton && (
            <ExcelExport
              title={props.exportTitle}
              fileName={props.exportFileName}
              fields={props.columns}
              pagination={props.exportPagination}
              totalRecords={props.totalRecords}
              loadRecords={props.exportLoadRecords}
            />
          )}
        </div>
      )}

      <PrimeDataTable
        value={props.records}
        dataKey="id"
        className="global-table"
        lazy
        paginator
        selectionMode="multiple"
        responsiveLayout="stack"
        breakpoint="991px"
        first={props.exportPagination.page * props.rows}
        rows={props.rows}
        totalRecords={props.totalRecords}
        loading={props.loading}
        selection={props.selectedRecords}
        emptyMessage={props.emptyMessage}
        rowClassName={(record) =>
          record.active === false ? "row-inactive" : ""
        }
        onSelectionChange={(event) =>
          props.onSelectedRecordsChange(event.value as unknown as T[])
        }
        onPage={(event) => props.onLazyLoad(event)}
        onSort={(event) => props.onLazyLoad(event)}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "48px" }}
          className="selection-column"
        />
        {props.columns.map((column) => (
          <Column
            key={column.field}
            field={column.field}
            header={column.label}
            sortable={column.sortable}
            body={bodyFor(column)}
          />
        ))}
        {props.actionsTemplate && (
          <Column
            header="Ações"
            body={props.actionsTemplate}
            className="actions-cell"
            headerClassName="actions-column"
          />
        )}
      </PrimeDataTable>
    </div>
  );
}
