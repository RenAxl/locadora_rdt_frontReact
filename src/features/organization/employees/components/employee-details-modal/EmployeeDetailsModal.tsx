import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Employee } from "../../models/Employee";
import { employeeService } from "../../services/employee.service";
import "./EmployeeDetailsModal.css";

interface EmployeeDetailsModalProps {
  visible: boolean;
  title: string;
  employee: Employee | null;
  onHide: () => void;
}

export function EmployeeDetailsModal({
  visible,
  title,
  employee,
  onHide,
}: EmployeeDetailsModalProps) {
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    const loadEmployeePhoto = async () => {
      if (!visible || !employee?.id) return;
      try {
        const photo = await employeeService.getEmployeePhoto(employee.id);
        if (!cancelled && photo && photo.size > 0) {
          objectUrl = URL.createObjectURL(photo);
          setPhotoPreviewUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setPhotoPreviewUrl(undefined);
      }
    };

    setPhotoPreviewUrl(undefined);
    loadEmployeePhoto();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visible, employee]);

  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(new Date(date)) : "-";
  const value = (text?: string | number) => text || "-";

  return (
    <Dialog
      className="employee-details-dialog"
      header={title}
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {employee ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{value(employee.name)}</strong>
          </div>
          <div>
            <span>Telefone</span>
            <strong>{value(employee.phone)}</strong>
          </div>
          <div>
            <span>Ativo</span>
            <strong>{employee.active ? "Sim" : "Não"}</strong>
          </div>
          <div className="wide">
            <span>Email</span>
            <strong>{value(employee.email)}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(employee.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(employee.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{value(employee.createdBy)}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{value(employee.updatedBy)}</strong>
          </div>
          <div>
            <span>Matrícula</span>
            <strong>{value(employee.employeeCode)}</strong>
          </div>
          <div>
            <span>Endereço</span>
            <strong>{value(employee.address)}</strong>
          </div>
          <div>
            <span>Salário</span>
            <strong>
              {employee.salary != null
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(employee.salary)
                : "-"}
            </strong>
          </div>
          <div>
            <span>Tipo de contratação</span>
            <strong>{value(employee.employmentType)}</strong>
          </div>
          <div>
            <span>Data de admissão</span>
            <strong>
              {employee.hireDate
                ? formatDate(new Date(employee.hireDate + "T00:00:00"))
                : "-"}
            </strong>
          </div>
          <div>
            <span>Data de desligamento</span>
            <strong>
              {employee.terminationDate
                ? formatDate(new Date(employee.terminationDate + "T00:00:00"))
                : "-"}
            </strong>
          </div>
          <div>
            <span>Cargo</span>
            <strong>{value(employee.position?.name)}</strong>
          </div>
          <div>
            <span>Departamento</span>
            <strong>{value(employee.department?.name)}</strong>
          </div>
          <div className="wide photo">
            <span>Foto</span>
            <strong>
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt="Foto do funcionário"
                  onError={() => setPhotoPreviewUrl(undefined)}
                />
              ) : (
                <span className="photo-placeholder">Sem foto</span>
              )}
            </strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
