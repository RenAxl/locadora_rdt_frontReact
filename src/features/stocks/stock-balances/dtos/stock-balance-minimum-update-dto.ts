export class StockBalanceMinimumUpdateDTO {
  id?: number;

  minimumQuantity: number = 0;

  constructor(stockBalance?: Partial<StockBalanceMinimumUpdateDTO>) {
    if (stockBalance != null) {
      this.id = stockBalance.id;

      if (stockBalance.minimumQuantity != null) {
        this.minimumQuantity = stockBalance.minimumQuantity;
      }
    }
  }
}
