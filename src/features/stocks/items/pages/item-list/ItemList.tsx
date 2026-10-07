import { authService } from "../../../../../core/auth/services/auth.service";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { Link } from "react-router-dom";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { PageResponse } from "../../../../../core/models/page-response";
import { Pagination } from "../../../../../core/models/Pagination";
import { PhotoUrlRegistry } from "../../../../../core/utils/photo-preview.util";
import {
  DataTable,
  LazyLoadEvent,
} from "../../../../../shared/components/data-table/DataTable";
import { DataTableColumn } from "../../../../../shared/components/data-table/models/data-table-column";
import { FieldCustomization } from "../../../../../shared/components/field-customization/FieldCustomization";
import { NameFilter } from "../../../../../shared/components/name-filter/NameFilter";
import { ItemDetailsModal } from "../../components/item-details-modal/ItemDetailsModal";
import { ItemDTO } from "../../dtos/item-dto";
import { ItemMapper } from "../../mappers/item.mapper";
import { Item } from "../../models/Item";
import { itemService } from "../../services/item.service";
import "./ItemList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "description", label: "Descrição" },
  { field: "category.name", label: "Categoria" },
  { field: "price", label: "Preço" },
  { field: "active", label: "Ativo" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
  { field: "image", label: "Imagem" },
];

export function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState(new Pagination());
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldCustomizationVisible, setFieldCustomizationVisible] =
    useState(false);
  const [visibleFields, setVisibleFields] = useState([
    "name",
    "category.name",
    "price",
    "image",
  ]);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [itemDetails, setItemDetails] = useState<Item | null>(null);
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const imageUrls = useRef(new PhotoUrlRegistry());
  const imageRequest = useRef(0);

  const visibleTableColumns = useMemo(
    () =>
      availableFields.filter((column) => visibleFields.includes(column.field)),
    [visibleFields],
  );

  const loadImages = async (loadedItems: Item[]) => {
    const request = ++imageRequest.current;
    imageUrls.current.clear();
    setImageMap({});
    for (const item of loadedItems) {
      if (!item.id || !item.imageContentType) continue;
      try {
        const blob = await itemService.getItemImage(item.id);
        if (request !== imageRequest.current) return;
        const imageUrl = imageUrls.current.create(blob);
        if (imageUrl)
          setImageMap((current) => ({ ...current, [item.id!]: imageUrl }));
      } catch {
        // Item sem foto é um caso esperado no Angular original.
      }
    }
  };

  const list = async (
    currentPagination: Pagination,
    currentFilter = filterName,
  ) => {
    setLoading(true);
    try {
      const data = await itemService.list(currentPagination, currentFilter);
      const loadedItems = ItemMapper.toModelList(data.content);
      setItems(loadedItems);
      setTotalElements(data.totalElements);
      setSelectedItems(
        loadedItems.filter(
          (item) => item.id != null && selectedItemIds.includes(item.id),
        ),
      );
      loadImages(loadedItems);
    } catch {
      // O interceptor mostra o erro.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    list(new Pagination());
    return () => {
      imageRequest.current++;
      imageUrls.current.clear();
    };
  }, []);

  const changePage = (event: LazyLoadEvent) => {
    const rows = event.rows || pagination.linesPerPage || 1;
    const first = event.first || 0;
    const next = new Pagination(
      first / rows,
      rows,
      event.sortOrder === -1 ? "DESC" : pagination.direction,
      typeof event.sortField === "string"
        ? event.sortField
        : pagination.orderBy,
    );
    if (event.sortOrder === 1) next.direction = "ASC";
    setPagination(next);
    list(next);
  };

  const searchItem = (name: string) => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setFilterName(name);
    setPagination(next);
    list(next, name);
  };

  const reloadFromFirstPage = () => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    list(next);
  };

  const canDeleteItems = authService.hasAnyAuthority(["ITEM_DELETE"]);
  const canDelete = (_item: Item) => canDeleteItems;

  const deleteItem = (item: Item) => {
    if (!item.id || !canDelete(item)) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await itemService.delete(item.id!);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Item excluído com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const onSelectionChange = (currentItems: Item[]) => {
    currentItems = currentItems.filter(canDelete);
    setSelectedItems(currentItems);
    const idsOutsidePage = selectedItemIds.filter(
      (id) => !items.some((item) => item.id === id),
    );
    const currentIds = currentItems.flatMap((item) =>
      item.id == null ? [] : [item.id],
    );
    setSelectedItemIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedItems = () => {
    if (!canDeleteItems || selectedItemIds.length === 0) return;
    const ids = [...selectedItemIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} item(ns)?`,
      accept: async () => {
        try {
          await itemService.deleteAll(ids);
          setSelectedItemIds([]);
          setSelectedItems([]);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Itens excluídos com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const openDetails = async (item: Item) => {
    if (item.id == null) return;
    setDetailsVisible(true);
    setItemDetails(null);
    try {
      const details: ItemDTO = await itemService.findById(item.id);
      setItemDetails(ItemMapper.toModel(details));
    } catch {
      /* interceptor */
    }
  };

  const toggleActive = async (item: Item) => {
    if (!item.id) return;
    const newStatus = !item.active;
    try {
      await itemService.changeActive(item.id, newStatus);
      setItems((current) =>
        current.map((record) =>
          record.id === item.id
            ? new Item({ ...record, active: newStatus })
            : record,
        ),
      );
      notificationService.add({
        severity: "success",
        detail: `Item ${newStatus ? "ativado" : "desativado"} com sucesso!`,
      });
    } catch {
      /* interceptor */
    }
  };

  const loadItemsForExport = (
    exportPagination: Pagination,
  ): Promise<PageResponse<ItemDTO>> => {
    return itemService.list(exportPagination, filterName);
  };

  const actionsTemplate = (item: Item) => (
    <div className="actions-wrap">
      {authService.hasAuthority("ITEM_WRITE") && (
        <Link to={`/items/${item.id}/edit`}>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-pencil"
            tooltip="Editar item"
            tooltipOptions={{ position: "top" }}
          />
        </Link>
      )}
      {canDeleteItems && (
        <Button
          className="p-button-rounded p-button-text p-button-danger"
          icon="pi pi-trash"
          tooltip="Excluir item"
          tooltipOptions={{ position: "top" }}
          disabled={!canDelete(item)}
          onClick={() => deleteItem(item)}
        />
      )}
      {authService.hasAuthority("ITEM_WRITE") && (
        <Button
          className="p-button-rounded p-button-text p-button-warning"
          icon={item.active ? "pi pi-ban" : "pi pi-check"}
          tooltip="Ativar / Desativar Item"
          tooltipOptions={{ position: "top" }}
          onClick={() => toggleActive(item)}
        />
      )}
      {authService.hasAuthority("ITEM_READ") && (
        <>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-eye"
            tooltip="Detalhamento do item"
            tooltipOptions={{ position: "top" }}
            onClick={() => openDetails(item)}
          />
          {authService.hasAuthority("ITEM_UNIT_READ") && (
            <Link to={`/item-units?itemId=${item.id}`}>
              <Button
                className="p-button-rounded p-button-text"
                icon="pi pi-box"
                tooltip="Unidades físicas do item"
              />
            </Link>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="item-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ESTOQUE</span>
          <h1>Itens</h1>
          <p>Consulte e gerencie os items cadastrados.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-box-open" />
        </div>
      </header>
      <div className="item-filter-container">
        <div className="item-actions-group">
          {authService.hasAuthority("ITEM_WRITE") && (
            <Link to="/items/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVO ITEM
              </button>
            </Link>
          )}
          {canDeleteItems && selectedItemIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedItems}
            >
              EXCLUIR ITENS
            </button>
          )}
        </div>
        <NameFilter text="Digite o nome do item" onSearch={searchItem} />
      </div>

      <DataTable
        records={items}
        showSelection={canDeleteItems}
        rowSelectable={canDelete}
        columns={visibleTableColumns}
        selectedRecords={selectedItems}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        columnTemplates={{
          price: (item) =>
            item.price != null
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.price)
              : "-",
          createdAt: (item) =>
            item.createdAt
              ? new Intl.DateTimeFormat("pt-BR").format(item.createdAt)
              : "-",
          updatedAt: (item) =>
            item.updatedAt
              ? new Intl.DateTimeFormat("pt-BR").format(item.updatedAt)
              : "-",
          active: (item) => (item.active ? "Sim" : "Não"),
          image: (item) =>
            imageMap[item.id!] ? (
              <img
                className="item-image"
                src={imageMap[item.id!]}
                alt="Imagem do item"
              />
            ) : (
              <div className="profile-photo-placeholder">
                <span className="profile-photo-icon">📦</span>
              </div>
            ),
        }}
        actionsTemplate={actionsTemplate}
        showColumnsButton
        showExportButton
        exportTitle="Itens"
        exportFileName="itens"
        exportPagination={pagination}
        exportLoadRecords={loadItemsForExport}
        emptyMessage="Nenhum item encontrado."
        onLazyLoad={changePage}
        onSelectedRecordsChange={onSelectionChange}
        onColumnsButtonClick={() => setFieldCustomizationVisible(true)}
      />

      <ItemDetailsModal
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        title="Detalhamento do Item"
        item={itemDetails}
      />
      <FieldCustomization
        visible={fieldCustomizationVisible}
        onHide={() => setFieldCustomizationVisible(false)}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="itens"
        onApply={setVisibleFields}
      />
    </div>
  );
}
