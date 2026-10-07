import { Dialog } from "primereact/dialog";
import { ItemUnit } from "../../models/ItemUnit";
import {
  getItemUnitAvailabilityLabel,
  getItemUnitConditionLabel,
} from "../../constants/item-unit-options";
import "./ItemUnitDetailsModal.css";

export function ItemUnitDetailsModal({
  visible,
  unit,
  onHide,
}: {
  visible: boolean;
  unit: ItemUnit | null;
  onHide: () => void;
}) {
  const formatDate = (date?: Date | string | null) =>
    date
      ? new Intl.DateTimeFormat("pt-BR").format(
          typeof date === "string" ? new Date(date + "T00:00:00") : date,
        )
      : "-";
  return (
    <Dialog
      className="item-unit-details-modal-dialog"
      header="Detalhamento da Unidade Física"
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {unit ? (
        <div className="details-grid">
          <div>
            <span>Item</span>
            <strong>{unit.item?.name || "-"}</strong>
          </div>
          <div>
            <span>Código patrimonial</span>
            <strong>{unit.assetCode || "-"}</strong>
          </div>
          <div>
            <span>Situação</span>
            <strong>{getItemUnitAvailabilityLabel(unit)}</strong>
          </div>
          <div>
            <span>Conservação</span>
            <strong>{getItemUnitConditionLabel(unit.conditionStatus)}</strong>
          </div>
          <div>
            <span>Ativa</span>
            <strong>{unit.active ? "Sim" : "Não"}</strong>
          </div>
          <div>
            <span>Data de compra</span>
            <strong>{formatDate(unit.purchaseDate)}</strong>
          </div>
          <div>
            <span>Observações</span>
            <strong>{unit.notes || "-"}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(unit.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(unit.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{unit.createdBy || "-"}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{unit.updatedBy || "-"}</strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
