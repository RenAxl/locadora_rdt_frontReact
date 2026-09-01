import { Button } from 'primereact/button';
import { PageResponse } from '../../../core/models/page-response';
import { Pagination } from '../../../core/models/Pagination';
import { listingExportService } from '../../services/listing-export.service';
import { CustomizableField } from '../../models/customizable-field';

interface ExcelExportProps<T> {
  title: string;
  fileName: string;
  fields: CustomizableField[];
  pagination: Pagination;
  totalRecords: number;
  loadRecords: (pagination: Pagination) => Promise<PageResponse<T>>;
}

export function ExcelExport<T>(props: ExcelExportProps<T>) {
  return (
    <Button type="button" className="p-button-rounded p-button-text" icon="pi pi-file-excel"
      tooltip="Exportar para Excel" tooltipOptions={{ position: 'left' }}
      onClick={() => listingExportService.confirmAndExport(
        props.title, props.fileName, props.fields, props.pagination, props.totalRecords, props.loadRecords,
      )} />
  );
}
