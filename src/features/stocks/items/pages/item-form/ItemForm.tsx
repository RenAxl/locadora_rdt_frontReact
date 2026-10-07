import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Item } from "../../models/Item";
import { ItemMapper } from "../../mappers/item.mapper";
import { itemService } from "../../services/item.service";
import "./ItemForm.css";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Category } from "../../../categories/models/Category";
import { CategoryMapper } from "../../../categories/mappers/category.mapper";
import { categoryService } from "../../../categories/services/category.service";
import { Pagination } from "../../../../../core/models/Pagination";

export function ItemForm() {
  const [item, setItem] = useState(new Item());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<File>();
  const [currentImage, setCurrentImage] = useState<Blob>();
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        let record = new Item();
        if (itemId) {
          record = ItemMapper.toModel(await itemService.findById(itemId));
          if (cancelled) return;
          setItem(record);
          if (record.id != null && record.imageContentType) {
            try {
              const image = await itemService.getItemImage(record.id);
              if (!cancelled) setCurrentImage(image);
            } catch {
              // A imagem não impede o carregamento das categorias.
            }
          }
        }
        const loadedCategories: Category[] = [];
        let page = 0;
        let total = 0;
        do {
          const data = await categoryService.list(
            new Pagination(page, 1000, "ASC", "name"),
            "",
          );
          if (cancelled) return;
          for (const dto of data.content) {
            const category = CategoryMapper.toModel(dto);
            if (
              category.active &&
              !loadedCategories.some((current) => current.id === category.id)
            )
              loadedCategories.push(category);
          }
          total = data.totalElements;
          page++;
        } while (page * 1000 < total);
        if (
          record.category &&
          !loadedCategories.some(
            (category) => category.id === record.category?.id,
          )
        )
          loadedCategories.push(record.category);
        setCategories(loadedCategories);
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
  }, [itemId]);

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

  const invalid =
    item.name.length < 3 ||
    item.name.length > 100 ||
    !item.category?.id ||
    item.description.length < 3 ||
    item.description.length > 500 ||
    (item.price != null && item.price < 0);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, description: true, category: true });
    if (invalid || saving || loading) return;
    setSaving(true);
    try {
      let id = item.id;
      if (id != null) {
        await itemService.update(ItemMapper.toUpdateDTO(item));
      } else {
        const data = await itemService.insert(ItemMapper.toInsertDTO(item));
        id = data.id;
        setItem(ItemMapper.toModel(data));
      }
      if (id != null && selectedImage) {
        try {
          await itemService.updateImage(id, selectedImage);
        } catch {
          notificationService.add({
            severity: "warn",
            detail: itemId
              ? "Item atualizado, mas falhou ao enviar a imagem."
              : "Item cadastrado, mas falhou ao enviar a imagem.",
          });
          navigate("/items/");
          return;
        }
      }
      notificationService.add({
        severity: "success",
        detail: itemId
          ? "Item atualizado com sucesso!"
          : "Item cadastrado com sucesso!",
      });
      navigate("/items/");
    } catch {
      // O interceptor exibe o erro.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="item-form-screen">
      <div className="item-form-container">
        <div className="item-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados do Item</h1>
            </div>
            <div className="item-image-header">
              <div className="item-image-area">
                <div className="item-image-frame">
                  {imageUrl ? (
                    <img
                      className="item-image"
                      src={imageUrl}
                      alt="Imagem do item"
                    />
                  ) : (
                    <div
                      className="item-image-placeholder"
                      aria-label="Sem imagem"
                    >
                      <span className="item-image-icon">📦</span>
                    </div>
                  )}
                </div>
                <div className="item-image-meta">
                  <div className="item-image-title">Imagem do Item</div>
                  <div className="item-image-subtitle">
                    JPG, PNG ou WEBP • até 2MB
                  </div>
                  <div className="item-image-actions">
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
            <div className="row g-3 item-form-inputs">
              <div className="col-12 col-lg-6">
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
                  maxLength={100}
                  value={item.name}
                  onChange={(e) =>
                    setItem(new Item({ ...item, name: e.target.value }))
                  }
                  onBlur={() => setTouched({ ...touched, name: true })}
                />
                <Message
                  visible={!!touched.name && !item.name}
                  text="Informe o nome do item"
                />
                <Message
                  visible={
                    !!touched.name && !!item.name && item.name.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${item.name.length}`}
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="category">
                  Categoria *
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  required
                  value={item.category?.id ?? ""}
                  onChange={(e) =>
                    setItem(
                      new Item({
                        ...item,
                        category: categories.find(
                          (category) => category.id === Number(e.target.value),
                        ),
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, category: true })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      disabled={!category.active}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                <Message
                  visible={!!touched.category && !item.category}
                  text="Informe a categoria"
                />
              </div>
              <div className="col-12">
                <label className="form-label-custom" htmlFor="description">
                  Descrição *
                </label>
                <InputTextarea
                  id="description"
                  name="description"
                  placeholder="Descrição"
                  className="form-control description-field"
                  rows={4}
                  required
                  minLength={3}
                  maxLength={500}
                  value={item.description}
                  onChange={(e) =>
                    setItem(new Item({ ...item, description: e.target.value }))
                  }
                  onBlur={() => setTouched({ ...touched, description: true })}
                />
                <Message
                  visible={!!touched.description && !item.description}
                  text="Informe a descrição do item"
                />
                <Message
                  visible={
                    !!touched.description &&
                    !!item.description &&
                    item.description.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${item.description.length}`}
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="price">
                  Preço
                </label>
                <InputNumber
                  inputId="price"
                  name="price"
                  placeholder="Preço"
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  min={0}
                  value={item.price ?? null}
                  onValueChange={(e) =>
                    setItem(new Item({ ...item, price: e.value }))
                  }
                />
              </div>
            </div>
            <div className="item-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving || loading}
                className="btn btn-primary item-form-button"
              >
                SALVAR
              </button>
              <Link to="/items/">
                <button
                  type="button"
                  className="btn btn-outline-danger item-form-button"
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
