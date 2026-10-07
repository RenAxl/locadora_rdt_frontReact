import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Category } from "../../models/Category";
import { categoryService } from "../../services/category.service";
import "./CategoryDetailsModal.css";

interface CategoryDetailsModalProps {
  visible: boolean;
  title: string;
  category: Category | null;
  onHide: () => void;
}

export function CategoryDetailsModal({
  visible,
  title,
  category,
  onHide,
}: CategoryDetailsModalProps) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    const loadCategoryImage = async () => {
      if (!visible || !category?.id) return;
      try {
        const image = await categoryService.getCategoryImage(category.id);
        if (!cancelled && image && image.size > 0) {
          objectUrl = URL.createObjectURL(image);
          setImagePreviewUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setImagePreviewUrl(undefined);
      }
    };

    setImagePreviewUrl(undefined);
    loadCategoryImage();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visible, category]);

  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(new Date(date)) : "-";
  const value = (text?: string | number) => text || "-";

  return (
    <Dialog
      className="category-details-dialog"
      header={title}
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {category ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{value(category.name)}</strong>
          </div>
          <div>
            <span>Ativa</span>
            <strong>{category.active ? "Sim" : "Não"}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(category.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(category.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{value(category.createdBy)}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{value(category.updatedBy)}</strong>
          </div>
          <div className="wide image">
            <span>Imagem</span>
            <strong>
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Imagem da categoria"
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
