export class Pagination {
  page: number;
  linesPerPage: number;
  direction: string;
  orderBy: string;

  constructor(page = 0, linesPerPage = 5, direction = "ASC", orderBy = "name") {
    this.page = page;
    this.linesPerPage = linesPerPage;
    this.direction = direction;
    this.orderBy = orderBy;
  }
}
