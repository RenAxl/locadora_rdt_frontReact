import { FormEvent, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { SupplierMapper } from "../../mappers/supplier.mapper";
import { Supplier } from "../../models/Supplier";
import { supplierService } from "../../services/supplier.service";
import "./SupplierForm.css";

type FieldName =
  | "name"
  | "tradeName"
  | "companyName"
  | "email"
  | "phoneNumber"
  | "cnpj"
  | "zipCode"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state";

export function SupplierForm() {
  const [supplier, setSupplier] = useState(new Supplier());

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File>();
  const [currentPhoto, setCurrentPhoto] = useState<Blob>();
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { supplierId } = useParams();

  useEffect(() => {
    const loadSupplier = async () => {
      if (!supplierId) return;
      try {
        const data = await supplierService.findById(supplierId);
        setSupplier(SupplierMapper.toModel(data));
        if (data.id != null)
          setCurrentPhoto(await supplierService.getSupplierImage(data.id));
      } catch {
        // O interceptor HTTP já exibe a mensagem equivalente ao Angular.
      }
    };

    loadSupplier();
  }, [supplierId]);

  useEffect(() => {
    const photo = selectedPhoto || currentPhoto;
    if (!photo || photo.size === 0) {
      setPhotoUrl("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedPhoto, currentPhoto]);

  const setField = (
    field:
      | "name"
      | "tradeName"
      | "companyName"
      | "email"
      | "phoneNumber"
      | "cnpj",
    value: string,
  ) => {
    setSupplier(new Supplier({ ...supplier, [field]: value }));
  };

  const setAddressField = (field: keyof Supplier["address"], value: string) => {
    setSupplier(
      new Supplier({
        ...supplier,
        address: { ...supplier.address, [field]: value },
      }),
    );
  };

  const touch = (field: FieldName) => setTouched({ ...touched, [field]: true });
  const required = (value?: string) => !value;
  const invalid =
    required(supplier.name) ||
    supplier.name.length < 3 ||
    required(supplier.tradeName) ||
    required(supplier.companyName) ||
    required(supplier.email) ||
    ![10, 11].includes(supplier.phoneNumber.length) ||
    supplier.cnpj.length !== 14 ||
    supplier.address.zipCode.replace(/\D/g, "").length !== 8 ||
    required(supplier.address.street) ||
    required(supplier.address.number) ||
    required(supplier.address.neighborhood) ||
    required(supplier.address.city) ||
    required(supplier.address.state);

  const formatTelephone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    const prefixLength = digits.length > 10 ? 7 : 6;
    if (digits.length <= prefixLength)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, prefixLength)}-${digits.slice(prefixLength)}`;
  };

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    let formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += "." + digits.slice(2, 5);
    if (digits.length > 5) formatted += "." + digits.slice(5, 8);
    if (digits.length > 8) formatted += "/" + digits.slice(8, 12);
    if (digits.length > 12) formatted += "-" + digits.slice(12, 14);
    return formatted;
  };

  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.length > 5
      ? `${digits.slice(0, 5)}-${digits.slice(5)}`
      : digits;
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid) {
      setTouched({
        name: true,
        tradeName: true,
        companyName: true,
        email: true,
        phoneNumber: true,
        cnpj: true,
        zipCode: true,
        street: true,
        number: true,
        neighborhood: true,
        city: true,
        state: true,
      });
      return;
    }

    if (saving) return;
    setSaving(true);
    try {
      let id = supplier.id;
      if (id != null) {
        await supplierService.update(SupplierMapper.toUpdateDTO(supplier));
      } else {
        const data = await supplierService.insert(
          SupplierMapper.toInsertDTO(supplier),
        );
        id = data.id;
        setSupplier(SupplierMapper.toModel(data));
      }
      if (id != null && selectedPhoto) {
        try {
          await supplierService.updateImage(id, selectedPhoto);
        } catch {
          notificationService.add({
            severity: "warn",
            detail: supplierId
              ? "Fornecedor atualizado, mas falhou ao enviar a imagem."
              : "Fornecedor cadastrado, mas falhou ao enviar a imagem.",
          });
          navigate("/suppliers/");
          return;
        }
      }
      navigate("/suppliers/");
      notificationService.add({
        severity: "success",
        detail: supplierId
          ? "Fornecedor atualizado com sucesso!"
          : "Fornecedor cadastrado com sucesso!",
      });
    } catch {
      // O interceptor HTTP exibe o erro.
    } finally {
      setSaving(false);
    }
  };

  const requiredMessage = (field: FieldName, value?: string) =>
    touched[field] && required(value);

  return (
    <div className="supplier-form-screen">
      <div className="supplier-form-container">
        <div className="supplier-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados do Fornecedor</h1>
            </div>
            <div className="supplier-photo-header">
              <div className="supplier-photo-area">
                <div className="supplier-photo-frame">
                  {photoUrl ? (
                    <img
                      className="supplier-photo"
                      src={photoUrl}
                      alt="Imagem do fornecedor"
                    />
                  ) : (
                    <div
                      className="supplier-photo-placeholder"
                      aria-label="Sem imagem"
                    >
                      <span className="supplier-photo-icon">👤</span>
                    </div>
                  )}
                </div>
                <div className="supplier-photo-meta">
                  <div className="supplier-photo-title">
                    Imagem do Fornecedor
                  </div>
                  <div className="supplier-photo-subtitle">
                    JPG, PNG ou WEBP • até 2MB
                  </div>
                  <div className="supplier-photo-actions">
                    <label className="upload-btn" htmlFor="photo">
                      <span className="upload-btn-icon">⬆️</span>
                      <span>Selecionar foto</span>
                    </label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="upload-input"
                      onChange={(event) => {
                        setSelectedPhoto(event.target.files?.[0]);
                        if (!event.target.files?.length)
                          setCurrentPhoto(undefined);
                      }}
                    />
                    {selectedPhoto && (
                      <span className="file-chip">{selectedPhoto.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3 supplier-form-inputs">
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Nome *</label>
                <InputText
                  placeholder="Nome"
                  value={supplier.name}
                  onChange={(e) => setField("name", e.target.value)}
                  onBlur={() => touch("name")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("name", supplier.name)}
                  text="Informe o nome do fornecedor"
                />
                <Message
                  visible={
                    !!touched.name &&
                    !!supplier.name &&
                    supplier.name.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${supplier.name.length}`}
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Nome fantasia *</label>
                <InputText
                  placeholder="Nome fantasia"
                  value={supplier.tradeName}
                  onChange={(e) => setField("tradeName", e.target.value)}
                  onBlur={() => touch("tradeName")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("tradeName", supplier.tradeName)}
                  text="Informe o nome fantasia"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Razão social *</label>
                <InputText
                  placeholder="Razão social"
                  value={supplier.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                  onBlur={() => touch("companyName")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("companyName", supplier.companyName)}
                  text="Informe a razão social"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">E-mail *</label>
                <InputText
                  placeholder="E-mail"
                  type="email"
                  value={supplier.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onBlur={() => touch("email")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("email", supplier.email)}
                  text="Informe o e-mail do fornecedor"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Telefone *</label>
                <InputText
                  placeholder="Telefone"
                  value={formatTelephone(supplier.phoneNumber)}
                  onChange={(e) =>
                    setField(
                      "phoneNumber",
                      e.target.value.replace(/\D/g, "").slice(0, 11),
                    )
                  }
                  onBlur={() => touch("phoneNumber")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("phoneNumber", supplier.phoneNumber)}
                  text="Informe o telefone do fornecedor"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">CNPJ *</label>
                <InputText
                  placeholder="CNPJ"
                  value={formatCnpj(supplier.cnpj)}
                  onChange={(e) =>
                    setField(
                      "cnpj",
                      e.target.value.replace(/\D/g, "").slice(0, 14),
                    )
                  }
                  onBlur={() => touch("cnpj")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("cnpj", supplier.cnpj)}
                  text="Informe o CNPJ do fornecedor"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom">CEP *</label>
                <InputText
                  placeholder="CEP"
                  value={formatZipCode(supplier.address.zipCode)}
                  onChange={(e) =>
                    setAddressField(
                      "zipCode",
                      e.target.value.replace(/\D/g, "").slice(0, 8),
                    )
                  }
                  onBlur={() => touch("zipCode")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("zipCode", supplier.address.zipCode)}
                  text="Informe o CEP"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Rua *</label>
                <InputText
                  placeholder="Rua"
                  value={supplier.address.street}
                  onChange={(e) => setAddressField("street", e.target.value)}
                  onBlur={() => touch("street")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("street", supplier.address.street)}
                  text="Informe a rua do fornecedor"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom">Número *</label>
                <InputText
                  placeholder="Número"
                  value={supplier.address.number}
                  onChange={(e) => setAddressField("number", e.target.value)}
                  onBlur={() => touch("number")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("number", supplier.address.number)}
                  text="Informe o número"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Complemento</label>
                <InputText
                  placeholder="Complemento"
                  value={supplier.address.complement || ""}
                  onChange={(e) =>
                    setAddressField("complement", e.target.value)
                  }
                  className="form-control"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Bairro *</label>
                <InputText
                  placeholder="Bairro"
                  value={supplier.address.neighborhood}
                  onChange={(e) =>
                    setAddressField("neighborhood", e.target.value)
                  }
                  onBlur={() => touch("neighborhood")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage(
                    "neighborhood",
                    supplier.address.neighborhood,
                  )}
                  text="Informe o bairro"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Cidade *</label>
                <InputText
                  placeholder="Cidade"
                  value={supplier.address.city}
                  onChange={(e) => setAddressField("city", e.target.value)}
                  onBlur={() => touch("city")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("city", supplier.address.city)}
                  text="Informe a cidade"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom">UF *</label>
                <InputText
                  placeholder="UF"
                  maxLength={2}
                  value={supplier.address.state}
                  onChange={(e) => setAddressField("state", e.target.value)}
                  onBlur={() => touch("state")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("state", supplier.address.state)}
                  text="Informe a UF"
                />
              </div>
            </div>
            <div className="supplier-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving}
                className="btn btn-primary supplier-form-button"
              >
                SALVAR
              </button>
              <Link to="/suppliers/">
                <button
                  type="button"
                  className="btn btn-outline-danger supplier-form-button"
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
