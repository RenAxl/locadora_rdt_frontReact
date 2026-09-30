import { Dialog } from "primereact/dialog";
import { Position } from "../../models/Position";
import "./PositionDetailsModal.css";

interface Props {
  visible: boolean;
  position: Position | null;
  onHide: () => void;
}
export function PositionDetailsModal({ visible, position, onHide }: Props) {
  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  return (
    <Dialog
      className="position-details-dialog"
      header="Detalhamento do Cargo"
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {position ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{position.name || "-"}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(position.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(position.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{position.createdBy || "-"}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{position.updatedBy || "-"}</strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
