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
import { CategoryDetailsModal } from "../../components/category-details-modal/CategoryDetailsModal";
import { CategoryDTO } from "../../dtos/category-dto";
import { CategoryMapper } from "../../mappers/category.mapper";
import { Category } from "../../models/Category";
import { categoryService } from "../../services/category.service";
import "./CategoryList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "active", label: "Ativa" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
  { field: "image", label: "Imagem" },
];

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState(new Pagination());
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldCustomizationVisible, setFieldCustomizationVisible] =
    useState(false);
  const [visibleFields, setVisibleFields] = useState(["name", "image"]);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState<Category | null>(null);
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const imageUrls = useRef(new PhotoUrlRegistry());
  const imageRequest = useRef(0);

  const visibleTableColumns = useMemo(
    () =>
      availableFields.filter((column) => visibleFields.includes(column.field)),
    [visibleFields],
  );

  const loadImages = async (loadedCategories: Category[]) => {
    const request = ++imageRequest.current;
    imageUrls.current.clear();
    setImageMap({});
    for (const category of loadedCategories) {
      if (!category.id || !category.imageContentType) continue;
      try {
        const blob = await categoryService.getCategoryImage(category.id);
        if (request !== imageRequest.current) return;
        const imageUrl = imageUrls.current.create(blob);
        if (imageUrl)
          setImageMap((current) => ({ ...current, [category.id!]: imageUrl }));
      } catch {
        // Categoria sem foto é um caso esperado no Angular original.
      }
    }
  };

  const list = async (
    currentPagination: Pagination,
    currentFilter = filterName,
  ) => {
    setLoading(true);
    try {
      const data = await categoryService.list(currentPagination, currentFilter);
      const loadedCategories = CategoryMapper.toModelList(data.content);
      setCategories(loadedCategories);
      setTotalElements(data.totalElements);
      setSelectedCategories(
        loadedCategories.filter(
          (category) =>
            category.id != null && selectedCategoryIds.includes(category.id),
        ),
      );
      loadImages(loadedCategories);
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

  const searchCategory = (name: string) => {
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

  const canDeleteCategories = authService.hasAnyAuthority(["CATEGORY_DELETE"]);
  const canDelete = (_category: Category) => canDeleteCategories;

  const deleteCategory = (category: Category) => {
    if (!category.id || !canDelete(category)) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await categoryService.delete(category.id!);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Categoria excluída com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const onSelectionChange = (currentCategories: Category[]) => {
    currentCategories = currentCategories.filter(canDelete);
    setSelectedCategories(currentCategories);
    const idsOutsidePage = selectedCategoryIds.filter(
      (id) => !categories.some((category) => category.id === id),
    );
    const currentIds = currentCategories.flatMap((category) =>
      category.id == null ? [] : [category.id],
    );
    setSelectedCategoryIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedCategories = () => {
    if (!canDeleteCategories || selectedCategoryIds.length === 0) return;
    const ids = [...selectedCategoryIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} categoria(s)?`,
      accept: async () => {
        try {
          await categoryService.deleteAll(ids);
          setSelectedCategoryIds([]);
          setSelectedCategories([]);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Categorias excluídas com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const openDetails = async (category: Category) => {
    if (category.id == null) return;
    setDetailsVisible(true);
    setCategoryDetails(null);
    try {
      const details: CategoryDTO = await categoryService.findById(category.id);
      setCategoryDetails(CategoryMapper.toModel(details));
    } catch {
      /* interceptor */
    }
  };

  const toggleActive = async (category: Category) => {
    if (!category.id) return;
    const newStatus = !category.active;
    try {
      await categoryService.changeActive(category.id, newStatus);
      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? new Category({ ...item, active: newStatus })
            : item,
        ),
      );
      notificationService.add({
        severity: "success",
        detail: `Categoria ${newStatus ? "ativada" : "desativada"} com sucesso!`,
      });
    } catch {
      /* interceptor */
    }
  };

  const loadCategoriesForExport = (
    exportPagination: Pagination,
  ): Promise<PageResponse<CategoryDTO>> => {
    return categoryService.list(exportPagination, filterName);
  };

  const actionsTemplate = (category: Category) => (
    <div className="actions-wrap">
      {authService.hasAuthority("CATEGORY_WRITE") && (
        <Link to={`/categories/${category.id}/edit`}>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-pencil"
            tooltip="Editar categoria"
            tooltipOptions={{ position: "top" }}
          />
        </Link>
      )}
      {canDeleteCategories && (
        <Button
          className="p-button-rounded p-button-text p-button-danger"
          icon="pi pi-trash"
          tooltip="Excluir categoria"
          tooltipOptions={{ position: "top" }}
          disabled={!canDelete(category)}
          onClick={() => deleteCategory(category)}
        />
      )}
      {authService.hasAuthority("CATEGORY_WRITE") && (
        <Button
          className="p-button-rounded p-button-text p-button-warning"
          icon={category.active ? "pi pi-ban" : "pi pi-check"}
          tooltip="Ativar / Desativar Categoria"
          tooltipOptions={{ position: "top" }}
          onClick={() => toggleActive(category)}
        />
      )}
      {authService.hasAuthority("CATEGORY_READ") && (
        <>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-eye"
            tooltip="Detalhamento da categoria"
            tooltipOptions={{ position: "top" }}
            onClick={() => openDetails(category)}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="category-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ESTOQUE</span>
          <h1>Categorias</h1>
          <p>Consulte e gerencie as categorias cadastradas.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-tags" />
        </div>
      </header>
      <div className="category-filter-container">
        <div className="category-actions-group">
          {authService.hasAuthority("CATEGORY_WRITE") && (
            <Link to="/categories/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVA CATEGORIA
              </button>
            </Link>
          )}
          {canDeleteCategories && selectedCategoryIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedCategories}
            >
              EXCLUIR CATEGORIAS
            </button>
          )}
        </div>
        <NameFilter
          text="Digite o nome da categoria"
          onSearch={searchCategory}
        />
      </div>

      <DataTable
        records={categories}
        showSelection={canDeleteCategories}
        rowSelectable={canDelete}
        columns={visibleTableColumns}
        selectedRecords={selectedCategories}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        columnTemplates={{
          createdAt: (category) =>
            category.createdAt
              ? new Intl.DateTimeFormat("pt-BR").format(category.createdAt)
              : "-",
          updatedAt: (category) =>
            category.updatedAt
              ? new Intl.DateTimeFormat("pt-BR").format(category.updatedAt)
              : "-",
          active: (category) => (category.active ? "Sim" : "Não"),
          image: (category) =>
            imageMap[category.id!] ? (
              <img
                className="category-image"
                src={imageMap[category.id!]}
                alt="Imagem da categoria"
              />
            ) : (
              <div className="profile-photo-placeholder">
                <i className="pi pi-tags profile-photo-icon" />
              </div>
            ),
        }}
        actionsTemplate={actionsTemplate}
        showColumnsButton
        showExportButton
        exportTitle="Categorias"
        exportFileName="categorias"
        exportPagination={pagination}
        exportLoadRecords={loadCategoriesForExport}
        emptyMessage="Nenhuma categoria encontrada."
        onLazyLoad={changePage}
        onSelectedRecordsChange={onSelectionChange}
        onColumnsButtonClick={() => setFieldCustomizationVisible(true)}
      />

      <CategoryDetailsModal
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        title="Detalhamento da Categoria"
        category={categoryDetails}
      />
      <FieldCustomization
        visible={fieldCustomizationVisible}
        onHide={() => setFieldCustomizationVisible(false)}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="categorias"
        onApply={setVisibleFields}
      />
    </div>
  );
}
