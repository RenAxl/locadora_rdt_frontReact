export class FinancialReportOption {
  value: string = "";
  label: string = "";
  fileName: string = "";

  constructor(option?: FinancialReportOption) {
    if (option != null) {
      this.value = option.value;
      this.label = option.label;
      this.fileName = option.fileName;
    }
  }
}
