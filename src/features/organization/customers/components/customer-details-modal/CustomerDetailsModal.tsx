import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Customer } from "../../models/Customer";
import { customerService } from "../../services/customer.service";
import "./CustomerDetailsModal.css";

interface CustomerDetailsModalProps {
  visible: boolean;
  title: string;
  customer: Customer | null;
  onHide: () => void;
}

export function CustomerDetailsModal({
  visible,
  title,
  customer,
  onHide,
}: CustomerDetailsModalProps) {
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    const loadCustomerPhoto = async () => {
      if (!visible || !customer?.id) return;
      try {
        const photo = await customerService.getCustomerPhoto(customer.id);
        if (!cancelled && photo && photo.size > 0) {
          objectUrl = URL.createObjectURL(photo);
          setPhotoPreviewUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setPhotoPreviewUrl(undefined);
      }
    };

    setPhotoPreviewUrl(undefined);
    loadCustomerPhoto();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visible, customer]);

  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(new Date(date)) : "-";
  const value = (text?: string | number) => text || "-";

  return (
    <Dialog
      className="customer-details-dialog"
      header={title}
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {customer ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{value(customer.name)}</strong>
          </div>
          <div>
            <span>Telefone</span>
            <strong>{value(customer.phone)}</strong>
          </div>
          <div>
            <span>Ativo</span>
            <strong>{customer.active ? "Sim" : "Não"}</strong>
          </div>
          <div className="wide">
            <span>Email</span>
            <strong>{value(customer.email)}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(customer.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(customer.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{value(customer.createdBy)}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{value(customer.updatedBy)}</strong>
          </div>
          <div>
            <span>Rua</span>
            <strong>{value(customer.address.street)}</strong>
          </div>
          <div>
            <span>Número</span>
            <strong>{value(customer.address.number)}</strong>
          </div>
          <div>
            <span>Complemento</span>
            <strong>{value(customer.address.complement)}</strong>
          </div>
          <div>
            <span>Bairro</span>
            <strong>{value(customer.address.neighborhood)}</strong>
          </div>
          <div>
            <span>Cidade</span>
            <strong>{value(customer.address.city)}</strong>
          </div>
          <div>
            <span>UF</span>
            <strong>{value(customer.address.state)}</strong>
          </div>
          <div>
            <span>CEP</span>
            <strong>{value(customer.address.zipCode)}</strong>
          </div>
          <div className="wide photo">
            <span>Foto</span>
            <strong>
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt="Foto do cliente"
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
