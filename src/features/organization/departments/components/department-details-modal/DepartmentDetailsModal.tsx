import { Dialog } from "primereact/dialog";
import { Department } from "../../models/Department";
import "./DepartmentDetailsModal.css";

interface Props {
  visible: boolean;
  department: Department | null;
  onHide: () => void;
}
export function DepartmentDetailsModal({ visible, department, onHide }: Props) {
  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  return (
    <Dialog
      className="department-details-dialog"
      header="Detalhamento do Departamento"
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {department ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{department.name || "-"}</strong>
          </div>
          <div className="wide">
            <span>Descrição</span>
            <strong>{department.description || "-"}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(department.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(department.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{department.createdBy || "-"}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{department.updatedBy || "-"}</strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
