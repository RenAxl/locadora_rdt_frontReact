import { CustomizableField } from "../../../models/customizable-field";

export interface DataTableColumn extends CustomizableField {
  sortable?: boolean;
}
