import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Pagination } from "../../../../../core/models/Pagination";
import { Message } from "../../../../../shared/components/message/Message";
import { Item } from "../../../items/models/Item";
import { ItemMapper } from "../../../items/mappers/item.mapper";
import { itemService } from "../../../items/services/item.service";
import { ItemUnit } from "../../../item-units/models/ItemUnit";
import { ItemUnitMapper } from "../../../item-units/mappers/item-unit.mapper";
import { itemUnitService } from "../../../item-units/services/item-unit.service";
import {
  ITEM_UNIT_STATUSES,
  getItemUnitAvailabilityLabel,
} from "../../../item-units/constants/item-unit-options";
import { StockMovement } from "../../models/StockMovement";
import { StockMovementMapper } from "../../mappers/stock-movement.mapper";
import { stockMovementService } from "../../services/stock-movement.service";
import "./StockMovementForm.css";

const movementTypes = [
  { value: "ENTRY", label: "Entrada" },
  { value: "EXIT", label: "Saída definitiva" },
  { value: "ADJUSTMENT", label: "Ajuste" },
  { value: "STATUS_CHANGE", label: "Alteração de situação" },
];

export function StockMovementForm() {
  const [movement, setMovement] = useState(new StockMovement());
  const [items, setItems] = useState<Item[]>([]);
  const [units, setUnits] = useState<ItemUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const canReadUnits = authService.hasAuthority("ITEM_UNIT_READ");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const loadItems = async () => {
      const loaded: Item[] = [];
      let page = 0;
      let total = 0;
      try {
        do {
          const data = await itemService.list(
            new Pagination(page, 1000, "ASC", "name"),
            "",
          );
          if (cancelled) return;
          loaded.push(...ItemMapper.toModelList(data.content));
          total = data.totalElements;
          page++;
        } while (page * 1000 < total);
        setItems(loaded);
      } catch {
        if (!cancelled) setItems([]);
      }
    };
    loadItems();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const itemId = movement.itemId;
    const type = movement.type;
    setUnits([]);
    setLoadingUnits(false);
    if (
      itemId == null ||
      (type !== "EXIT" && type !== "STATUS_CHANGE") ||
      !canReadUnits
    )
      return;
    const loadUnits = async () => {
      setLoadingUnits(true);
      const loaded: ItemUnit[] = [];
      let page = 0;
      let total = 0;
      try {
        do {
          const data = await itemUnitService.list(
            new Pagination(page, 1000, "ASC", "assetCode"),
            "",
            itemId,
            undefined,
            controller.signal,
          );
          if (controller.signal.aborted) return;
          for (const dto of data.content) {
            const unit = ItemUnitMapper.toModel(dto);
            if (!unit.active) continue;
            if (
              type === "EXIT" &&
              (unit.status !== "AVAILABLE" ||
                unit.item?.active === false ||
                unit.item?.category?.active === false)
            )
              continue;
            loaded.push(unit);
          }
          total = data.totalElements;
          page++;
        } while (page * 1000 < total);
        setUnits(loaded);
      } catch {
        if (!controller.signal.aborted) setUnits([]);
      } finally {
        if (!controller.signal.aborted) setLoadingUnits(false);
      }
    };
    loadUnits();
    return () => controller.abort();
  }, [movement.itemId, movement.type, canReadUnits]);

  const changeSelection = (itemId: number | undefined, type: string) => {
    setMovement(
      new StockMovement({
        ...movement,
        itemId,
        type,
        itemUnitId: null,
        status: null,
        quantity: type === "STATUS_CHANGE" ? 1 : movement.quantity,
      }),
    );
  };
  const selectedUnit = units.find((unit) => unit.id === movement.itemUnitId);
  const warn = (detail: string) => {
    notificationService.add({ severity: "warn", detail });
    return false;
  };
  const validateMovement = () => {
    if (movement.itemId == null) return warn("Selecione um item.");
    if (!movementTypes.some((type) => type.value === movement.type))
      return warn("Selecione um tipo de movimentação válido.");
    const item = items.find((item) => item.id === movement.itemId);
    if (
      (movement.type === "ENTRY" || movement.type === "EXIT") &&
      item &&
      (!item.active || item.category?.active === false)
    )
      return warn("Entradas e saídas exigem item e categoria ativos.");
    const quantity = movement.quantity;
    const minimum = movement.type === "ADJUSTMENT" ? 0 : 1;
    if (quantity == null || !Number.isInteger(quantity) || quantity < minimum)
      return warn(
        `Informe uma quantidade inteira maior ou igual a ${minimum}.`,
      );
    if ((movement.reason || "").length > 255)
      return warn("O motivo deve ter até 255 caracteres.");
    if (movement.type === "STATUS_CHANGE") {
      if (!selectedUnit || !selectedUnit.active || quantity !== 1)
        return warn("Selecione uma unidade ativa e informe quantidade 1.");
      if (
        !ITEM_UNIT_STATUSES.some((status) => status.value === movement.status)
      )
        return warn("Selecione a nova situação.");
      if (selectedUnit.status === movement.status)
        return warn("Selecione uma situação diferente da atual.");
    }
    if (
      movement.type === "EXIT" &&
      movement.itemUnitId != null &&
      (!selectedUnit ||
        !selectedUnit.active ||
        selectedUnit.status !== "AVAILABLE" ||
        selectedUnit.item?.active === false ||
        selectedUnit.item?.category?.active === false ||
        quantity !== 1)
    )
      return warn(
        "A saída de uma unidade específica exige uma unidade disponível e quantidade 1.",
      );
    if (
      (movement.type === "ENTRY" || movement.type === "ADJUSTMENT") &&
      movement.itemUnitId != null
    )
      return warn("Entradas e ajustes não selecionam uma unidade existente.");
    if (movement.type !== "STATUS_CHANGE" && movement.status != null)
      return warn(
        "Selecione uma nova situação apenas em Alteração de situação.",
      );
    return true;
  };
  const invalid =
    movement.itemId == null ||
    !movement.type ||
    movement.quantity == null ||
    movement.quantity < (movement.type === "ADJUSTMENT" ? 0 : 1) ||
    !Number.isInteger(movement.quantity) ||
    (movement.type === "STATUS_CHANGE" &&
      (movement.itemUnitId == null || !movement.status));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (saving || loadingUnits || invalid || !validateMovement()) return;
    setSaving(true);
    try {
      await stockMovementService.insert(
        StockMovementMapper.toInsertDTO(movement),
      );
      notificationService.add({
        severity: "success",
        detail: "Movimentação registrada com sucesso!",
      });
      navigate("/stock-movements/");
    } catch {
      /* interceptor */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stock-movement-form-screen">
      <div className="stock-movement-form-container">
        <div className="stock-movement-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Movimentar Estoque</h1>
            </div>
            <div className="row g-3 stock-movement-form-inputs">
              <div className="col-12 col-lg-6">
                <label htmlFor="itemId" className="form-label-custom">
                  Item *
                </label>
                <select
                  id="itemId"
                  name="itemId"
                  className="form-control form-select"
                  required
                  value={movement.itemId ?? ""}
                  onBlur={() => setTouched(true)}
                  onChange={(e) =>
                    changeSelection(
                      e.target.value ? Number(e.target.value) : undefined,
                      movement.type,
                    )
                  }
                >
                  <option value="">Selecione um item</option>
                  {items.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      disabled={
                        (movement.type === "ENTRY" ||
                          movement.type === "EXIT") &&
                        (!item.active || item.category?.active === false)
                      }
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
                <Message
                  visible={touched && movement.itemId == null}
                  text="Informe o item"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label htmlFor="type" className="form-label-custom">
                  Tipo *
                </label>
                <select
                  id="type"
                  name="type"
                  className="form-control form-select"
                  required
                  value={movement.type}
                  onChange={(e) =>
                    changeSelection(movement.itemId, e.target.value)
                  }
                >
                  {movementTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                      disabled={type.value === "STATUS_CHANGE" && !canReadUnits}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
                <Message
                  visible={touched && !movement.type}
                  text="Informe o tipo de movimentação"
                />
              </div>
              {canReadUnits &&
                (movement.type === "EXIT" ||
                  movement.type === "STATUS_CHANGE") && (
                  <div className="col-12 col-lg-6">
                    <label htmlFor="movementUnit" className="form-label-custom">
                      Unidade física{" "}
                      {movement.type === "STATUS_CHANGE" ? "*" : "(opcional)"}
                    </label>
                    <select
                      id="movementUnit"
                      name="itemUnitId"
                      className="form-control form-select"
                      required={movement.type === "STATUS_CHANGE"}
                      disabled={loadingUnits}
                      value={movement.itemUnitId ?? ""}
                      onChange={(e) =>
                        setMovement(
                          new StockMovement({
                            ...movement,
                            itemUnitId: e.target.value
                              ? Number(e.target.value)
                              : null,
                            status: null,
                            quantity: e.target.value ? 1 : movement.quantity,
                          }),
                        )
                      }
                    >
                      <option value="">
                        {movement.type === "EXIT"
                          ? "Selecionar disponíveis automaticamente"
                          : "Selecione uma unidade"}
                      </option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.assetCode} —{" "}
                          {getItemUnitAvailabilityLabel(unit)}
                        </option>
                      ))}
                    </select>
                    {loadingUnits && <small>Carregando unidades...</small>}
                    {!loadingUnits &&
                      movement.itemId != null &&
                      units.length === 0 && (
                        <small>
                          Nenhuma unidade{" "}
                          {movement.type === "EXIT" ? "disponível" : "ativa"}{" "}
                          encontrada.
                        </small>
                      )}
                  </div>
                )}
              {movement.type === "STATUS_CHANGE" && (
                <div className="col-12 col-lg-6">
                  <label htmlFor="movementStatus" className="form-label-custom">
                    Nova situação *
                  </label>
                  <select
                    id="movementStatus"
                    name="status"
                    className="form-control form-select"
                    required
                    value={movement.status ?? ""}
                    onChange={(e) =>
                      setMovement(
                        new StockMovement({
                          ...movement,
                          status: e.target.value || null,
                        }),
                      )
                    }
                  >
                    <option value="">Selecione a nova situação</option>
                    {ITEM_UNIT_STATUSES.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                        disabled={status.value === selectedUnit?.status}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="col-12 col-lg-4">
                <label htmlFor="quantity" className="form-label-custom">
                  {movement.type === "ADJUSTMENT"
                    ? "Quantidade total desejada *"
                    : "Quantidade *"}
                </label>
                <InputText
                  id="quantity"
                  name="quantity"
                  placeholder="Quantidade"
                  type="number"
                  className="form-control"
                  required
                  min={movement.type === "ADJUSTMENT" ? 0 : 1}
                  step={1}
                  readOnly={
                    movement.type === "STATUS_CHANGE" ||
                    movement.itemUnitId != null
                  }
                  value={
                    movement.quantity == null ? "" : String(movement.quantity)
                  }
                  onBlur={() => setTouched(true)}
                  onChange={(e) =>
                    setMovement(
                      new StockMovement({
                        ...movement,
                        quantity:
                          e.target.value === "" ? null : Number(e.target.value),
                      }),
                    )
                  }
                />
                <Message
                  visible={touched && movement.quantity == null}
                  text="Informe a quantidade"
                />
                <Message
                  visible={
                    touched &&
                    movement.quantity != null &&
                    movement.quantity < (movement.type === "ADJUSTMENT" ? 0 : 1)
                  }
                  text={
                    movement.type === "ADJUSTMENT"
                      ? "A quantidade não pode ser negativa"
                      : "A quantidade deve ser maior que zero"
                  }
                />
                {movement.type === "ADJUSTMENT" && (
                  <small>
                    Informe o total de unidades ativas desejado. O ajuste reduz
                    apenas unidades disponíveis. Para zerar, informe 0.
                  </small>
                )}
                {movement.type === "EXIT" && (
                  <small>
                    A saída dá baixa definitiva nas unidades. Para
                    indisponibilidade temporária, use Alteração de situação.
                  </small>
                )}
              </div>
              <div className="col-12 col-lg-8">
                <label htmlFor="reason" className="form-label-custom">
                  Motivo
                </label>
                <InputText
                  id="reason"
                  name="reason"
                  placeholder="Motivo"
                  className="form-control"
                  maxLength={255}
                  value={movement.reason || ""}
                  onChange={(e) =>
                    setMovement(
                      new StockMovement({
                        ...movement,
                        reason: e.target.value,
                      }),
                    )
                  }
                />
              </div>
            </div>
            <div className="stock-movement-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving || loadingUnits}
                className="btn btn-primary stock-movement-form-button"
              >
                SALVAR
              </button>
              <Link to="/stock-movements/">
                <button
                  type="button"
                  className="btn btn-outline-danger stock-movement-form-button"
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
