import { FormEvent, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { InputTextarea } from "primereact/inputtextarea";
import { Pagination } from "../../../../../core/models/Pagination";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { Item } from "../../../items/models/Item";
import { ItemMapper } from "../../../items/mappers/item.mapper";
import { itemService } from "../../../items/services/item.service";
import { ItemUnit } from "../../models/ItemUnit";
import { ItemUnitMapper } from "../../mappers/item-unit.mapper";
import { itemUnitService } from "../../services/item-unit.service";
import { ITEM_UNIT_CONDITIONS } from "../../constants/item-unit-options";
import "./ItemUnitForm.css";

export function ItemUnitForm() {
  const [unit, setUnit] = useState(new ItemUnit());
  const [items, setItems] = useState<Item[]>([]);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { itemUnitId, itemId: routeItemId } = useParams();
  const [searchParams] = useSearchParams();
  const itemId = routeItemId ?? searchParams.get("itemId");
  const backUrl = `/item-units/${itemId == null ? "" : `?itemId=${itemId}`}`;
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (itemUnitId) {
          const found = ItemUnitMapper.toModel(
            await itemUnitService.findById(itemUnitId),
          );
          if (cancelled) return;
          setUnit(found);
          setItems(found.item ? [found.item] : []);
          return;
        }
        const loaded: Item[] = [];
        let page = 0;
        let total = 0;
        do {
          const data = await itemService.list(
            new Pagination(page, 1000, "ASC", "name"),
            "",
          );
          if (cancelled) return;
          for (const dto of data.content) {
            const item = ItemMapper.toModel(dto);
            if (item.active && item.category?.active !== false)
              loaded.push(item);
          }
          page++;
          total = data.totalElements;
        } while (page * 1000 < total);
        setItems(loaded);
        setUnit(
          new ItemUnit({
            item: loaded.find((item) => item.id === Number(itemId)),
          }),
        );
      } catch {
        /* interceptor */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [itemUnitId, itemId]);

  const invalid =
    !unit.item?.id || !unit.conditionStatus || unit.notes.length > 500;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (invalid || saving || loading) return;
    setSaving(true);
    try {
      if (unit.id != null)
        await itemUnitService.update(ItemUnitMapper.toUpdateDTO(unit));
      else await itemUnitService.insert(ItemUnitMapper.toInsertDTO(unit));
      notificationService.add({
        severity: "success",
        detail: itemUnitId
          ? "Unidade física atualizada com sucesso!"
          : "Unidade física cadastrada com sucesso!",
      });
      navigate(backUrl);
    } catch {
      /* interceptor */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="item-unit-form-screen">
      <div className="item-unit-form-container">
        <div className="item-unit-card">
          <form onSubmit={save}>
            <div className="col-12 mb-3">
              <h1>Dados da Unidade Física</h1>
            </div>
            <div className="row g-3 item-unit-form-inputs">
              <div className="col-12 col-lg-6">
                <label htmlFor="item" className="form-label-custom">
                  Item *
                </label>
                <select
                  id="item"
                  name="item"
                  className="form-control"
                  required
                  disabled={!!itemUnitId}
                  value={unit.item?.id ?? ""}
                  onChange={(e) =>
                    setUnit(
                      new ItemUnit({
                        ...unit,
                        item: items.find(
                          (item) => item.id === Number(e.target.value),
                        ),
                      }),
                    )
                  }
                  onBlur={() => setTouched(true)}
                >
                  <option value="">Selecione um item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <Message
                  visible={touched && !unit.item}
                  text="Informe o item"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label htmlFor="conditionStatus" className="form-label-custom">
                  Conservação *
                </label>
                <select
                  id="conditionStatus"
                  name="conditionStatus"
                  className="form-control"
                  required
                  value={unit.conditionStatus}
                  onChange={(e) =>
                    setUnit(
                      new ItemUnit({
                        ...unit,
                        conditionStatus: e.target.value,
                      }),
                    )
                  }
                >
                  {ITEM_UNIT_CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
                <Message
                  visible={touched && !unit.conditionStatus}
                  text="Informe a conservação"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label htmlFor="purchaseDate" className="form-label-custom">
                  Data de compra
                </label>
                <input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  className="form-control"
                  value={unit.purchaseDate || ""}
                  onChange={(e) =>
                    setUnit(
                      new ItemUnit({ ...unit, purchaseDate: e.target.value }),
                    )
                  }
                />
              </div>
              <div className="col-12">
                <label htmlFor="notes" className="form-label-custom">
                  Observações
                </label>
                <InputTextarea
                  id="notes"
                  name="notes"
                  placeholder="Observações"
                  className="form-control notes-field"
                  maxLength={500}
                  rows={4}
                  value={unit.notes}
                  onChange={(e) =>
                    setUnit(new ItemUnit({ ...unit, notes: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="item-unit-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving || loading}
                className="btn btn-primary item-unit-form-button"
              >
                SALVAR
              </button>
              <Link to={backUrl}>
                <button
                  type="button"
                  className="btn btn-outline-danger item-unit-form-button"
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
