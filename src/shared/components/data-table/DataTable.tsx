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
  selectedRecords?: T[];
  showSelection?: boolean;
  paginator?: boolean;
  rowSelectable?: (record: T) => boolean;
  totalRecords?: number;
  rows?: number;
  loading: boolean;
  emptyMessage?: string;
  columnTemplates?: Record<string, (record: T) => React.ReactNode>;
  actionsTemplate?: (record: T) => React.ReactNode;
  showColumnsButton?: boolean;
  showExportButton?: boolean;
  exportTitle?: string;
  exportFileName?: string;
  exportPagination?: Pagination;
  exportLoadRecords?: (pagination: Pagination) => Promise<PageResponse<any>>;
  onLazyLoad?: (event: LazyLoadEvent) => void;
  onSelectedRecordsChange?: (records: T[]) => void;
  onColumnsButtonClick?: () => void;
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
    return <span className="table-cell-value">{getFieldValue(record, column.field)}</span>;
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
          {props.showExportButton && props.exportLoadRecords && (
            <ExcelExport
              title={props.exportTitle || ""}
              fileName={props.exportFileName || ""}
              fields={props.columns}
              pagination={props.exportPagination || new Pagination()}
              totalRecords={props.totalRecords || 0}
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
        paginator={props.paginator !== false}
        selectionMode="multiple"
        isDataSelectable={(event) =>
          props.showSelection !== false &&
          (!props.rowSelectable || props.rowSelectable(event.data as T))
        }
        responsiveLayout="stack"
        breakpoint="991px"
        first={(props.exportPagination?.page || 0) * (props.rows || 5)}
        rows={props.rows || 5}
        totalRecords={props.totalRecords || 0}
        loading={props.loading}
        selection={props.selectedRecords || []}
        emptyMessage={props.emptyMessage}
        rowClassName={(record) =>
          record.active === false ? "row-inactive" : ""
        }
        onSelectionChange={(event) =>
          props.onSelectedRecordsChange?.(
            (event.value as unknown as T[]).filter(
              (record) => !props.rowSelectable || props.rowSelectable(record),
            ),
          )
        }
        onPage={(event) => props.onLazyLoad?.(event)}
        onSort={(event) => props.onLazyLoad?.(event)}
      >
        {props.showSelection !== false && (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "48px" }}
            className="selection-column"
          />
        )}
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
