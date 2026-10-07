import { useEffect, useState } from "react";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import {
  ITEM_UNIT_CONDITIONS,
  ITEM_UNIT_STATUSES,
} from "../../../../stocks/item-units/constants/item-unit-options";
import { StockReport } from "../../models/StockReport";
import { StockReportFilter } from "../../models/StockReportFilter";
import { StockReportOption } from "../../models/StockReportOption";
import { StockReportMapper } from "../../mappers/stock-report.mapper";
import { stockReportService } from "../../services/stock-report.service";
import "./StockReportList.css";

const reportOptions = [
  { value: "balances", label: "Saldos atuais" },
  { value: "low-stock", label: "Estoque abaixo do mínimo" },
  { value: "item-units", label: "Unidades físicas" },
  { value: "movements", label: "Movimentações" },
];
const movementTypes = [
  { value: "ENTRY", label: "Entrada" },
  { value: "EXIT", label: "Saída" },
  { value: "ADJUSTMENT", label: "Ajuste" },
  { value: "STATUS_CHANGE", label: "Alteração de situação" },
];

export function StockReportList() {
  const [selectedReportType, setSelectedReportType] = useState("balances");
  const [filters, setFilters] = useState(new StockReportFilter());
  const [summary, setSummary] = useState(new StockReport());
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [categories, setCategories] = useState<StockReportOption[]>([]);
  const [items, setItems] = useState<StockReportOption[]>([]);
  const loadSummary = async (currentFilters = filters) => {
    if (summaryLoading) return;
    setSummaryLoading(true);
    try {
      setSummary(
        StockReportMapper.toModel(
          await stockReportService.summary(
            StockReportMapper.toSummaryFilterDTO(currentFilters),
          ),
        ),
      );
    } catch {
      /* interceptor */
    } finally {
      setSummaryLoading(false);
    }
  };
  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const data = await stockReportService.options();
        if (!cancelled) {
          setCategories(data.categories);
          setItems(data.items);
        }
      } catch {
        /* interceptor */
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    };
    loadOptions();
    loadSummary(new StockReportFilter());
    return () => {
      cancelled = true;
    };
  }, []);
  const changeReportType = (type: string) => {
    setSelectedReportType(type);
    setFilters({
      ...filters,
      active: true,
      status: "ALL",
      conditionStatus: "ALL",
      movementType: "ALL",
      startDate: null,
      endDate: null,
    });
  };
  const clearFilters = () => {
    const next = new StockReportFilter();
    setSelectedReportType("balances");
    setFilters(next);
    loadSummary(next);
  };
  const download = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const generate = async (format: string) => {
    if (loading || !authService.hasAuthority("STOCK_REPORTS_READ")) return;
    if (
      selectedReportType === "movements" &&
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      notificationService.add({
        severity: "warn",
        detail: "Data inicial não pode ser maior que a data final.",
      });
      return;
    }
    setLoading(true);
    try {
      const blob = await stockReportService.generate(
        selectedReportType,
        format,
        StockReportMapper.toFilterDTO(filters, selectedReportType),
      );
      const fileName = `${selectedReportType}.${format}`;
      if (format === "pdf") {
        const url = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" }),
        );
        const tab = window.open(url, "_blank");
        if (tab == null) {
          URL.revokeObjectURL(url);
          download(blob, fileName);
        } else setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else download(blob, fileName);
    } catch {
      /* interceptor */
    } finally {
      setLoading(false);
    }
  };
  const filteredItems =
    filters.categoryId == null
      ? items
      : items.filter((item) => item.categoryId === filters.categoryId);
  const searchPlaceholder =
    selectedReportType === "movements"
      ? "Item, categoria, código patrimonial ou motivo"
      : selectedReportType === "item-units"
        ? "Item, categoria ou código patrimonial"
        : "Item ou categoria";
  const availability = [
    {
      label: "Disponíveis",
      quantity: summary.availableQuantity,
      color: "#149447",
    },
    {
      label: "Indisponíveis",
      quantity: summary.unavailableQuantity,
      color: "#64748b",
    },
    {
      label: "Em manutenção",
      quantity: summary.maintenanceQuantity,
      color: "#d97706",
    },
    {
      label: "Danificadas",
      quantity: summary.damagedQuantity,
      color: "#d84238",
    },
    {
      label: "Não localizadas",
      quantity: summary.lostQuantity,
      color: "#7c3aed",
    },
  ];

  return (
    <div className="stock-report-list-screen">
      <div className="stock-report-list-container">
        <header className="module-page-header">
          <div>
            <span className="module-page-eyebrow">RELATÓRIOS</span>
            <h1>Relatórios de estoque</h1>
            <p>
              Consulte saldos, unidades físicas e o histórico de movimentações.
            </p>
          </div>
          <div className="module-page-header-icon">
            <i className="fa-solid fa-boxes-stacked" />
          </div>
        </header>
        <form
          className="stock-report-card"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="row g-3 stock-report-form-inputs">
            <div className="col-12 col-lg-6">
              <label className="form-label-custom" htmlFor="stock-report-type">
                Relatório
              </label>
              <select
                id="stock-report-type"
                name="reportType"
                className="form-control"
                value={selectedReportType}
                onChange={(e) => changeReportType(e.target.value)}
              >
                {reportOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-lg-6">
              <label
                className="form-label-custom"
                htmlFor="stock-report-search"
              >
                Busca
              </label>
              <input
                id="stock-report-search"
                name="search"
                className="form-control"
                type="text"
                value={filters.search}
                placeholder={searchPlaceholder}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <div className="col-12 col-lg-4">
              <label
                className="form-label-custom"
                htmlFor="stock-report-category"
              >
                Categoria
              </label>
              <select
                id="stock-report-category"
                name="categoryId"
                className="form-control"
                disabled={optionsLoading}
                value={filters.categoryId ?? ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    categoryId: e.target.value ? Number(e.target.value) : null,
                    itemId: null,
                  })
                }
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-lg-4">
              <label className="form-label-custom" htmlFor="stock-report-item">
                Item
              </label>
              <select
                id="stock-report-item"
                name="itemId"
                className="form-control"
                disabled={optionsLoading}
                value={filters.itemId ?? ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    itemId: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">Todos</option>
                {filteredItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedReportType !== "movements" && (
              <div className="col-12 col-lg-4">
                <label
                  className="form-label-custom"
                  htmlFor="stock-report-active"
                >
                  {selectedReportType === "item-units" ? "Unidades" : "Itens"}
                </label>
                <select
                  id="stock-report-active"
                  name="active"
                  className="form-control"
                  value={
                    filters.active == null ? "all" : String(filters.active)
                  }
                  onChange={(e) => {
                    const active =
                      e.target.value === "all"
                        ? null
                        : e.target.value === "true";
                    setFilters({
                      ...filters,
                      active,
                      status: active === false ? "ALL" : filters.status,
                    });
                  }}
                >
                  <option value="true">
                    {selectedReportType === "item-units" ? "Ativas" : "Ativos"}
                  </option>
                  <option value="false">
                    {selectedReportType === "item-units"
                      ? "Com baixa"
                      : "Inativos"}
                  </option>
                  <option value="all">Todos</option>
                </select>
              </div>
            )}
            {selectedReportType === "item-units" && (
              <>
                <div className="col-12 col-lg-4">
                  <label
                    className="form-label-custom"
                    htmlFor="stock-report-status"
                  >
                    Situação
                  </label>
                  <select
                    id="stock-report-status"
                    name="status"
                    className="form-control"
                    disabled={filters.active === false}
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                  >
                    <option value="ALL">Todas</option>
                    {ITEM_UNIT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-lg-4">
                  <label
                    className="form-label-custom"
                    htmlFor="stock-report-condition"
                  >
                    Conservação
                  </label>
                  <select
                    id="stock-report-condition"
                    name="conditionStatus"
                    className="form-control"
                    value={filters.conditionStatus}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        conditionStatus: e.target.value,
                      })
                    }
                  >
                    <option value="ALL">Todas</option>
                    {ITEM_UNIT_CONDITIONS.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {selectedReportType === "movements" && (
              <>
                <div className="col-12 col-lg-4">
                  <label
                    className="form-label-custom"
                    htmlFor="stock-report-movement"
                  >
                    Tipo de movimentação
                  </label>
                  <select
                    id="stock-report-movement"
                    name="movementType"
                    className="form-control"
                    value={filters.movementType}
                    onChange={(e) =>
                      setFilters({ ...filters, movementType: e.target.value })
                    }
                  >
                    <option value="ALL">Todos</option>
                    {movementTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-lg-4">
                  <label
                    className="form-label-custom"
                    htmlFor="stock-report-start-date"
                  >
                    Data inicial
                  </label>
                  <input
                    id="stock-report-start-date"
                    name="startDate"
                    type="date"
                    className="form-control"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        startDate: e.target.value || null,
                      })
                    }
                  />
                </div>
                <div className="col-12 col-lg-4">
                  <label
                    className="form-label-custom"
                    htmlFor="stock-report-end-date"
                  >
                    Data final
                  </label>
                  <input
                    id="stock-report-end-date"
                    name="endDate"
                    type="date"
                    className="form-control"
                    value={filters.endDate || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        endDate: e.target.value || null,
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
          {selectedReportType === "low-stock" && (
            <p className="report-note mt-3">
              São exibidos os itens cuja quantidade disponível está abaixo do
              estoque mínimo.
            </p>
          )}
          {selectedReportType === "movements" && (
            <p className="report-note mt-3">
              O histórico inclui unidades com baixa. Nos ajustes, a quantidade
              representa o total ativo final informado. Datas e horários das
              movimentações são apresentados em UTC.
            </p>
          )}
          {authService.hasAuthority("STOCK_REPORTS_READ") && (
            <div className="stock-report-form-buttons mt-4">
              <button
                type="button"
                className="btn btn-primary stock-report-form-button"
                disabled={loading}
                onClick={() => generate("pdf")}
              >
                <i className="pi pi-file-pdf me-2" />
                GERAR PDF
              </button>
              <button
                type="button"
                className="btn btn-success stock-report-form-button"
                disabled={loading}
                onClick={() => generate("xlsx")}
              >
                <i className="pi pi-file-excel me-2" />
                GERAR EXCEL
              </button>
              <button
                type="button"
                className="btn btn-outline-danger stock-report-form-button"
                disabled={loading || summaryLoading}
                onClick={clearFilters}
              >
                LIMPAR
              </button>
              <button
                type="button"
                className="btn btn-outline-primary stock-report-form-button"
                disabled={summaryLoading}
                onClick={() => loadSummary()}
              >
                <i className="pi pi-chart-bar me-2" />
                ATUALIZAR RESUMO
              </button>
            </div>
          )}
          {loading && (
            <span className="loading-label" role="status">
              Gerando relatório...
            </span>
          )}
        </form>
        <section className="stock-report-card" aria-busy={summaryLoading}>
          <div className="summary-header">
            <h2>Disponibilidade atual</h2>
            {summaryLoading && (
              <span className="loading-label" role="status">
                Carregando...
              </span>
            )}
          </div>
          <p className="report-note">
            Resumo por categoria e item selecionados. Quantidades calculadas
            pelas unidades ativas.
          </p>
          <div className="stock-summary">
            <div className="summary-item">
              <span>Itens</span>
              <strong>{summary.itemCount}</strong>
            </div>
            <div className="summary-item">
              <span>Unidades ativas</span>
              <strong>{summary.totalQuantity}</strong>
            </div>
            <div className="summary-item low-stock">
              <span>Itens abaixo do mínimo</span>
              <strong>{summary.lowStockItemCount}</strong>
            </div>
          </div>
          <div
            className="availability-chart"
            aria-label="Distribuição das unidades ativas por situação"
          >
            {availability.map((entry) => (
              <div className="availability-row" key={entry.label}>
                <span>{entry.label}</span>
                <div className="availability-track">
                  <div
                    className="availability-bar"
                    style={{
                      width:
                        summary.totalQuantity === 0
                          ? "0%"
                          : `${(entry.quantity / summary.totalQuantity) * 100}%`,
                      background: entry.color,
                    }}
                  />
                </div>
                <strong>{entry.quantity}</strong>
              </div>
            ))}
          </div>
          {!summaryLoading && summary.itemCount === 0 && (
            <p className="report-note mt-3">Nenhum item encontrado.</p>
          )}
        </section>
      </div>
    </div>
  );
}
