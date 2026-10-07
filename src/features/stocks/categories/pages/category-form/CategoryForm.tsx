import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Category } from "../../models/Category";
import { CategoryMapper } from "../../mappers/category.mapper";
import { categoryService } from "../../services/category.service";
import "./CategoryForm.css";

export function CategoryForm() {
  const [category, setCategory] = useState(new Category());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<File>();
  const [currentImage, setCurrentImage] = useState<Blob>();
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { categoryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        let record = new Category();
        if (categoryId) {
          record = CategoryMapper.toModel(
            await categoryService.findById(categoryId),
          );
          if (cancelled) return;
          setCategory(record);
          if (record.id != null && record.imageContentType) {
            const image = await categoryService.getCategoryImage(record.id);
            if (!cancelled) setCurrentImage(image);
          }
        }
      } catch {
        // O interceptor exibe o erro.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  useEffect(() => {
    const image = selectedImage || currentImage;
    if (!image || image.size === 0) {
      setImageUrl("");
      return;
    }
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage, currentImage]);

  const invalid = category.name.length < 3 || category.name.length > 60;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, description: true, category: true });
    if (invalid || saving || loading) return;
    setSaving(true);
    try {
      let id = category.id;
      if (id != null) {
        await categoryService.update(CategoryMapper.toUpdateDTO(category));
      } else {
        const data = await categoryService.insert(
          CategoryMapper.toInsertDTO(category),
        );
        id = data.id;
        setCategory(CategoryMapper.toModel(data));
      }
      if (id != null && selectedImage) {
        try {
          await categoryService.updateImage(id, selectedImage);
        } catch {
          notificationService.add({
            severity: "warn",
            detail: categoryId
              ? "Categoria atualizada, mas falhou ao enviar a imagem."
              : "Categoria cadastrada, mas falhou ao enviar a imagem.",
          });
          navigate("/categories/");
          return;
        }
      }
      notificationService.add({
        severity: "success",
        detail: categoryId
          ? "Categoria atualizada com sucesso!"
          : "Categoria cadastrada com sucesso!",
      });
      navigate("/categories/");
    } catch {
      // O interceptor exibe o erro.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="category-form-screen">
      <div className="category-form-container">
        <div className="category-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados da Categoria</h1>
            </div>
            <div className="category-image-header">
              <div className="category-image-area">
                <div className="category-image-frame">
                  {imageUrl ? (
                    <img
                      className="category-image"
                      src={imageUrl}
                      alt="Imagem da categoria"
                    />
                  ) : (
                    <div
                      className="category-image-placeholder"
                      aria-label="Sem imagem"
                    >
                      <i className="pi pi-tags category-image-icon" />
                    </div>
                  )}
                </div>
                <div className="category-image-meta">
                  <div className="category-image-title">
                    Imagem da Categoria
                  </div>
                  <div className="category-image-subtitle">
                    JPG, PNG ou WEBP • até 2MB
                  </div>
                  <div className="category-image-actions">
                    <label className="upload-btn" htmlFor="image">
                      <span className="upload-btn-icon">⬆️</span>
                      <span>Selecionar imagem</span>
                    </label>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="upload-input"
                      onChange={(event) => {
                        setSelectedImage(event.target.files?.[0]);
                        if (!event.target.files?.length)
                          setCurrentImage(undefined);
                      }}
                    />
                    {selectedImage && (
                      <span className="file-chip">{selectedImage.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3 category-form-inputs">
              <div className="col-12">
                <label className="form-label-custom" htmlFor="name">
                  Nome *
                </label>
                <InputText
                  id="name"
                  name="name"
                  placeholder="Nome"
                  className="form-control"
                  required
                  minLength={3}
                  maxLength={60}
                  value={category.name}
                  onChange={(e) =>
                    setCategory(
                      new Category({ ...category, name: e.target.value }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, name: true })}
                />
                <Message
                  visible={!!touched.name && !category.name}
                  text="Informe o nome da categoria"
                />
                <Message
                  visible={
                    !!touched.name &&
                    !!category.name &&
                    category.name.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${category.name.length}`}
                />
              </div>
            </div>
            <div className="category-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving || loading}
                className="btn btn-primary category-form-button"
              >
                SALVAR
              </button>
              <Link to="/categories/">
                <button
                  type="button"
                  className="btn btn-outline-danger category-form-button"
                >
                  CANCELAR
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
