import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { PhotoUrlRegistry } from "../../../../../core/utils/photo-preview.util";
import { DataTable } from "../../../../../shared/components/data-table/DataTable";
import { Message } from "../../../../../shared/components/message/Message";
import { EmployeeFile } from "../../models/EmployeeFile";
import { EmployeeFileMapper } from "../../mappers/employee-file.mapper";
import { employeeFileService } from "../../services/employee-file.service";
import "./EmployeeFilesModal.css";

interface EmployeeFilesModalProps {
  visible: boolean;
  employeeId?: number;
  employeeName?: string;
  onHide: () => void;
}

const columns = [
  { field: "preview", label: "Arquivo" },
  { field: "name", label: "Nome" },
  { field: "contentType", label: "Tipo" },
  { field: "createdAt", label: "Data" },
];

export function EmployeeFilesModal(props: EmployeeFilesModalProps) {
  const [files, setFiles] = useState<EmployeeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const [photoMap, setPhotoMap] = useState<Record<number, string>>({});
  const [fileView, setFileView] = useState<{
    url: string;
    name: string;
    isImage: boolean;
  }>();
  const [reload, setReload] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const viewRequest = useRef(0);
  const canRead = authService.hasAuthority("EMPLOYEE_READ");
  const canWrite = authService.hasAuthority("EMPLOYEE_WRITE");
  const canDelete = authService.hasAuthority("EMPLOYEE_DELETE");

  const isImageFile = (file: EmployeeFile) =>
    !!file.contentType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalFileName || "");

  const clearForm = () => {
    setFileName("");
    setSelectedFile(undefined);
    setTouched(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const closeFileView = () => {
    viewRequest.current++;
    setFileView(undefined);
  };

  useEffect(() => {
    clearForm();
    closeFileView();
    return () => {
      viewRequest.current++;
    };
  }, [props.visible, props.employeeId]);

  useEffect(() => {
    if (!selectedFile?.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (fileView) URL.revokeObjectURL(fileView.url);
    };
  }, [fileView]);

  useEffect(() => {
    let cancelled = false;
    const urls = new PhotoUrlRegistry();
    setFiles([]);
    setPhotoMap({});
    setLoading(false);
    const loadFiles = async () => {
      if (!props.visible || props.employeeId == null) return;
      setLoading(true);
      try {
        const data = await employeeFileService.findAllByEmployee(
          props.employeeId,
        );
        if (cancelled) return;
        const loaded = data.map(EmployeeFileMapper.toModel);
        setFiles(loaded);
        setLoading(false);
        for (const file of loaded) {
          if (file.id == null || !isImageFile(file)) continue;
          try {
            const blob = await employeeFileService.getViewBlob(
              props.employeeId,
              file.id,
            );
            if (cancelled) return;
            const url = urls.create(blob);
            if (url)
              setPhotoMap((current) => ({ ...current, [file.id!]: url }));
          } catch {
            /* Mantém o ícone quando não há prévia. */
          }
        }
      } catch {
        /* O interceptor HTTP exibe o erro. */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadFiles();
    return () => {
      cancelled = true;
      urls.clear();
    };
  }, [props.visible, props.employeeId, reload]);

  const upload = async (event: FormEvent) => {
    event.preventDefault();
    if (!canWrite || props.employeeId == null) return;
    if (!fileName.trim()) {
      notificationService.add({
        severity: "warn",
        detail: "Informe o nome do arquivo.",
      });
      return;
    }
    if (!selectedFile) {
      notificationService.add({
        severity: "warn",
        detail: "Selecione um arquivo.",
      });
      return;
    }
    try {
      await employeeFileService.upload(
        props.employeeId,
        fileName.trim(),
        selectedFile,
      );
      clearForm();
      setReload((current) => current + 1);
      notificationService.add({
        severity: "success",
        detail: "Arquivo enviado com sucesso!",
      });
    } catch {
      /* O interceptor HTTP exibe o erro. */
    }
  };

  const openFileView = async (file: EmployeeFile) => {
    if (!canRead || props.employeeId == null || file.id == null) return;
    closeFileView();
    const request = viewRequest.current;
    try {
      const blob = await employeeFileService.getViewBlob(
        props.employeeId,
        file.id,
      );
      if (request !== viewRequest.current || !blob?.size) return;
      setFileView({
        url: URL.createObjectURL(blob),
        name: file.name || file.originalFileName || "Arquivo",
        isImage: isImageFile(file),
      });
    } catch {
      /* O interceptor HTTP exibe o erro. */
    }
  };

  const deleteFile = (file: EmployeeFile) => {
    if (!canDelete || props.employeeId == null || file.id == null) return;
    confirmDialog({
      message: `Tem certeza que deseja excluir o arquivo "${file.name}"?`,
      accept: async () => {
        try {
          await employeeFileService.delete(props.employeeId!, file.id!);
          setReload((current) => current + 1);
          notificationService.add({
            severity: "success",
            detail: "Arquivo excluído com sucesso!",
          });
        } catch {
          /* O interceptor HTTP exibe o erro. */
        }
      },
    });
  };

  const download = async (file: EmployeeFile) => {
    if (!canRead || props.employeeId == null || file.id == null) return;
    try {
      const response = await employeeFileService.download(
        props.employeeId,
        file.id,
      );
      if (!response.data) {
        notificationService.add({
          severity: "warn",
          detail: "Arquivo não disponível para download.",
        });
        return;
      }
      let name = file.originalFileName || file.name || "arquivo";
      const disposition = response.headers["content-disposition"];
      const match =
        typeof disposition === "string"
          ? disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i)
          : null;
      if (match?.[1]) name = decodeURIComponent(match[1]);
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      anchor.click();
      URL.revokeObjectURL(url);
      notificationService.add({
        severity: "success",
        detail: "Download realizado com sucesso!",
      });
    } catch {
      /* O interceptor HTTP exibe o erro. */
    }
  };

  const preview = (file: EmployeeFile) =>
    canRead && (
      <Button
        type="button"
        className="p-button-rounded p-button-text"
        tooltip="Visualizar arquivo"
        onClick={() => openFileView(file)}
      >
        {photoMap[file.id!] ? (
          <img
            src={photoMap[file.id!]}
            alt={file.name}
            className="file-photo"
            onError={() =>
              setPhotoMap((current) => {
                const next = { ...current };
                delete next[file.id!];
                return next;
              })
            }
          />
        ) : (
          <i
            className={
              isImageFile(file)
                ? "pi pi-image"
                : file.contentType === "application/pdf"
                  ? "pi pi-file-pdf"
                  : "pi pi-file"
            }
          />
        )}
      </Button>
    );

  return (
    <>
      <Dialog
        header="Arquivos do Funcionário"
        className="employee-files-dialog"
        visible={props.visible}
        modal
        style={{ width: "960px", maxWidth: "95vw" }}
        onHide={props.onHide}
      >
        <h5>{props.employeeName || `Funcionário #${props.employeeId}`}</h5>
        {canWrite && (
          <form onSubmit={upload} noValidate>
            <div className="row g-3 file-form-inputs">
              <div className="col-12">
                <label className="form-label-custom" htmlFor="fileName">
                  Nome do arquivo *
                </label>
                <InputText
                  id="fileName"
                  placeholder="Ex.: Contrato assinado"
                  className="form-control"
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  onBlur={() => setTouched(true)}
                />
                <Message
                  visible={touched && !fileName}
                  text="Informe o nome do arquivo"
                />
              </div>
              <div className="col-12">
                <label className="upload-btn" htmlFor="fileInput">
                  Selecionar arquivo
                </label>
                <input
                  ref={fileInput}
                  id="fileInput"
                  type="file"
                  className="upload-input"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setSelectedFile(file);
                    if (file && !fileName.trim()) setFileName(file.name);
                  }}
                />
                {selectedFile && (
                  <>
                    <span className="file-chip">{selectedFile.name}</span>
                    <div className="file-preview">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Pré-visualização" />
                      ) : (
                        <i className="pi pi-file" />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="file-form-buttons mt-4 mb-4">
              <button
                type="submit"
                className="btn btn-primary file-form-button"
              >
                ENVIAR
              </button>
              <button
                type="button"
                className="btn btn-outline-danger file-form-button"
                onClick={clearForm}
              >
                LIMPAR
              </button>
            </div>
          </form>
        )}
        <DataTable
          records={files}
          columns={columns}
          loading={loading}
          showSelection={false}
          paginator={false}
          columnTemplates={{
            preview,
            createdAt: (file) =>
              file.createdAt
                ? new Intl.DateTimeFormat("pt-BR").format(file.createdAt)
                : "-",
          }}
          actionsTemplate={(file) => (
            <div className="actions-wrap">
              {canRead && (
                <Button
                  type="button"
                  className="p-button-rounded p-button-text"
                  icon="pi pi-download"
                  tooltip="Download"
                  onClick={() => download(file)}
                />
              )}
              {canDelete && (
                <Button
                  type="button"
                  className="p-button-rounded p-button-text p-button-danger"
                  icon="pi pi-trash"
                  tooltip="Excluir arquivo"
                  onClick={() => deleteFile(file)}
                />
              )}
            </div>
          )}
          emptyMessage="Nenhum arquivo cadastrado para este funcionário."
        />
      </Dialog>
      <Dialog
        header={fileView?.name}
        className="employee-files-dialog"
        visible={!!fileView}
        modal
        style={{ width: "1100px", maxWidth: "95vw" }}
        onHide={closeFileView}
      >
        {fileView && (
          <div className="file-view">
            {fileView.isImage ? (
              <img src={fileView.url} alt={fileView.name} />
            ) : (
              <iframe src={fileView.url} title={fileView.name} />
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
