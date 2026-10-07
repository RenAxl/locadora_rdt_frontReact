import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Item } from "../../models/Item";
import { itemService } from "../../services/item.service";
import "./ItemDetailsModal.css";

interface ItemDetailsModalProps {
  visible: boolean;
  title: string;
  item: Item | null;
  onHide: () => void;
}

export function ItemDetailsModal({
  visible,
  title,
  item,
  onHide,
}: ItemDetailsModalProps) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    const loadItemImage = async () => {
      if (!visible || !item?.id) return;
      try {
        const image = await itemService.getItemImage(item.id);
        if (!cancelled && image && image.size > 0) {
          objectUrl = URL.createObjectURL(image);
          setImagePreviewUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setImagePreviewUrl(undefined);
      }
    };

    setImagePreviewUrl(undefined);
    loadItemImage();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visible, item]);

  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(new Date(date)) : "-";
  const value = (text?: string | number) => text || "-";

  return (
    <Dialog
      className="item-details-dialog"
      header={title}
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {item ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{value(item.name)}</strong>
          </div>
          <div className="wide">
            <span>Descrição</span>
            <strong>{item.description || "-"}</strong>
          </div>
          <div>
            <span>Categoria</span>
            <strong>{item.category?.name || "-"}</strong>
          </div>
          <div>
            <span>Preço</span>
            <strong>
              {item.price != null
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.price)
                : "-"}
            </strong>
          </div>
          <div>
            <span>Ativo</span>
            <strong>{item.active ? "Sim" : "Não"}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(item.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(item.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{value(item.createdBy)}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{value(item.updatedBy)}</strong>
          </div>
          <div className="wide image">
            <span>Imagem</span>
            <strong>
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Imagem do item"
                  onError={() => setImagePreviewUrl(undefined)}
                />
              ) : (
                <span className="image-placeholder">Sem imagem</span>
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
