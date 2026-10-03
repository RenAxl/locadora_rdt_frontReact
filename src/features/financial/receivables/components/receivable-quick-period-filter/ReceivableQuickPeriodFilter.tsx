import { useEffect, useState } from "react";
import "./ReceivableQuickPeriodFilter.css";

export interface ReceivableQuickPeriodRange {
  startDate: string | null;
  endDate: string | null;
}
interface Props {
  startDate: string | null;
  endDate: string | null;
  onPeriodChange: (period: ReceivableQuickPeriodRange) => void;
}
const periods = [
  { key: "TODAY", label: "Hoje" },
  { key: "YESTERDAY", label: "Ontem" },
  { key: "TOMORROW", label: "Amanhã" },
  { key: "THIS_WEEK", label: "Esta Semana" },
  { key: "NEXT_WEEK", label: "Próxima Semana" },
  { key: "THIS_MONTH", label: "Este Mês" },
  { key: "LAST_MONTH", label: "Mês Passado" },
];

export function ReceivableQuickPeriodFilter({
  startDate,
  endDate,
  onPeriodChange,
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  function getRange(period: string): ReceivableQuickPeriodRange {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const end = new Date(start);

    if (period === "YESTERDAY") {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    }

    if (period === "TOMORROW") {
      start.setDate(start.getDate() + 1);
      end.setDate(end.getDate() + 1);
    }

    if (period === "THIS_WEEK" || period === "NEXT_WEEK") {
      let mondayOffset = 1 - today.getDay();

      if (today.getDay() === 0) {
        mondayOffset = -6;
      }

      if (period === "NEXT_WEEK") {
        mondayOffset = mondayOffset + 7;
      }

      start.setDate(start.getDate() + mondayOffset);
      end.setFullYear(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 6,
      );
    }

    if (period === "THIS_MONTH" || period === "LAST_MONTH") {
      let month = today.getMonth();

      if (period === "LAST_MONTH") {
        month = month - 1;
      }

      start.setFullYear(today.getFullYear(), month, 1);
      end.setFullYear(today.getFullYear(), month + 1, 0);
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }

  function formatDate(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  useEffect(() => {
    if (!selectedPeriod) return;
    const range = getRange(selectedPeriod);
    if (range.startDate !== startDate || range.endDate !== endDate)
      setSelectedPeriod(null);
  }, [startDate, endDate]);

  const selectPeriod = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange(getRange(period));
  };
  const clearPeriod = () => {
    setSelectedPeriod(null);
    onPeriodChange({ startDate: null, endDate: null });
  };
  return (
    <div className="receivable-quick-period-screen">
      <div className="quick-period-filter">
        <span className="quick-period-title">Períodos Rápidos</span>
        <div className="quick-period-options">
          {periods.map((period) => (
            <button
              key={period.key}
              type="button"
              className={`quick-period-chip${selectedPeriod === period.key ? " selected" : ""}`}
              onClick={() => selectPeriod(period.key)}
            >
              {period.label}
            </button>
          ))}
          <button
            type="button"
            className="quick-period-chip clear"
            disabled={!startDate && !endDate && !selectedPeriod}
            onClick={clearPeriod}
          >
            Limpar período
          </button>
        </div>
      </div>
    </div>
  );
}
