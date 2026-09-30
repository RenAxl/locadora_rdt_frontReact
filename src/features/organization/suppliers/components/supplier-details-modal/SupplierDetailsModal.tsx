import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Supplier } from "../../models/Supplier";
import { supplierService } from "../../services/supplier.service";
import "./SupplierDetailsModal.css";

interface SupplierDetailsModalProps {
  visible: boolean;
  title: string;
  supplier: Supplier | null;
  onHide: () => void;
}

export function SupplierDetailsModal({
  visible,
  title,
  supplier,
  onHide,
}: SupplierDetailsModalProps) {
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    const loadSupplierPhoto = async () => {
      if (!visible || !supplier?.id) return;
      try {
        const photo = await supplierService.getSupplierImage(supplier.id);
        if (!cancelled && photo && photo.size > 0) {
          objectUrl = URL.createObjectURL(photo);
          setPhotoPreviewUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setPhotoPreviewUrl(undefined);
      }
    };

    setPhotoPreviewUrl(undefined);
    loadSupplierPhoto();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visible, supplier]);

  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(new Date(date)) : "-";
  const value = (text?: string | number) => text || "-";

  return (
    <Dialog
      className="supplier-details-dialog"
      header={title}
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {supplier ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{value(supplier.name)}</strong>
          </div>
          <div>
            <span>Nome fantasia</span>
            <strong>{value(supplier.tradeName)}</strong>
          </div>
          <div>
            <span>Razão social</span>
            <strong>{value(supplier.companyName)}</strong>
          </div>
          <div>
            <span>CNPJ</span>
            <strong>{value(supplier.cnpj)}</strong>
          </div>
          <div>
            <span>Telefone</span>
            <strong>{value(supplier.phoneNumber)}</strong>
          </div>
          <div className="wide">
            <span>Email</span>
            <strong>{value(supplier.email)}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(supplier.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(supplier.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{value(supplier.createdBy)}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{value(supplier.updatedBy)}</strong>
          </div>
          <div>
            <span>Rua</span>
            <strong>{value(supplier.address.street)}</strong>
          </div>
          <div>
            <span>Número</span>
            <strong>{value(supplier.address.number)}</strong>
          </div>
          <div>
            <span>Complemento</span>
            <strong>{value(supplier.address.complement)}</strong>
          </div>
          <div>
            <span>Bairro</span>
            <strong>{value(supplier.address.neighborhood)}</strong>
          </div>
          <div>
            <span>Cidade</span>
            <strong>{value(supplier.address.city)}</strong>
          </div>
          <div>
            <span>UF</span>
            <strong>{value(supplier.address.state)}</strong>
          </div>
          <div>
            <span>CEP</span>
            <strong>{value(supplier.address.zipCode)}</strong>
          </div>
          <div className="wide photo">
            <span>Imagem</span>
            <strong>
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt="Imagem do fornecedor"
                  onError={() => setPhotoPreviewUrl(undefined)}
                />
              ) : (
                <span className="photo-placeholder">Sem imagem</span>
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
