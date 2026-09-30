import { FormEvent, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { CustomerMapper } from "../../mappers/customer.mapper";
import { Customer } from "../../models/Customer";
import { customerService } from "../../services/customer.service";
import "./CustomerForm.css";

type FieldName =
  | "name"
  | "email"
  | "phone"
  | "cpf"
  | "zipCode"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state";

export function CustomerForm() {
  const [customer, setCustomer] = useState(new Customer());

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File>();
  const [currentPhoto, setCurrentPhoto] = useState<Blob>();
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { customerId } = useParams();

  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId) return;
      try {
        const data = await customerService.findById(customerId);
        setCustomer(CustomerMapper.toModel(data));
        if (data.id != null)
          setCurrentPhoto(await customerService.getCustomerPhoto(data.id));
      } catch {}
    };

    loadCustomer();
  }, [customerId]);

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
    field: "name" | "email" | "phone" | "cpf",
    value: string,
  ) => {
    setCustomer(new Customer({ ...customer, [field]: value }));
  };

  const setAddressField = (field: keyof Customer["address"], value: string) => {
    setCustomer(
      new Customer({
        ...customer,
        address: { ...customer.address, [field]: value },
      }),
    );
  };

  const touch = (field: FieldName) => setTouched({ ...touched, [field]: true });
  const required = (value?: string) => !value;
  const invalid =
    required(customer.name) ||
    customer.name.length < 5 ||
    required(customer.email) ||
    customer.phone.replace(/\D/g, "").length !== 11 ||
    required(customer.cpf) ||
    customer.address.zipCode.replace(/\D/g, "").length !== 8 ||
    required(customer.address.street) ||
    required(customer.address.number) ||
    required(customer.address.neighborhood) ||
    required(customer.address.city) ||
    required(customer.address.state);

  const formatTelephone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
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
        email: true,
        phone: true,
        cpf: true,
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
      let id = customer.id;
      if (id != null) {
        await customerService.update(CustomerMapper.toUpdateDTO(customer));
      } else {
        const data = await customerService.insert(
          CustomerMapper.toInsertDTO(customer),
        );
        id = data.id;
        setCustomer(CustomerMapper.toModel(data));
      }
      if (id != null && selectedPhoto) {
        try {
          await customerService.updatePhoto(id, selectedPhoto);
        } catch {
          notificationService.add({
            severity: "warn",
            detail: customerId
              ? "Cliente atualizado, mas falhou ao enviar a foto."
              : "Cliente cadastrado, mas falhou ao enviar a foto.",
          });
          navigate("/customers/");
          return;
        }
      }
      navigate("/customers/");
      notificationService.add({
        severity: "success",
        detail: customerId
          ? "Cliente atualizado com sucesso!"
          : "Cliente cadastrado com sucesso!",
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
    <div className="customer-form-screen">
      <div className="customer-form-container">
        <div className="customer-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados do Cliente</h1>
            </div>
            <div className="customer-photo-header">
              <div className="customer-photo-area">
                <div className="customer-photo-frame">
                  {photoUrl ? (
                    <img
                      className="customer-photo"
                      src={photoUrl}
                      alt="Foto do cliente"
                    />
                  ) : (
                    <div
                      className="customer-photo-placeholder"
                      aria-label="Sem foto"
                    >
                      <span className="customer-photo-icon">👤</span>
                    </div>
                  )}
                </div>
                <div className="customer-photo-meta">
                  <div className="customer-photo-title">Foto do Cliente</div>
                  <div className="customer-photo-subtitle">
                    JPG, PNG ou WEBP • até 2MB
                  </div>
                  <div className="customer-photo-actions">
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
            <div className="row g-3 customer-form-inputs">
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Nome *</label>
                <InputText
                  placeholder="Nome"
                  value={customer.name}
                  onChange={(e) => setField("name", e.target.value)}
                  onBlur={() => touch("name")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("name", customer.name)}
                  text="Informe o nome completo do cliente"
                />
                <Message
                  visible={
                    !!touched.name &&
                    !!customer.name &&
                    customer.name.length < 5
                  }
                  text={`Mínimo de 5 caracteres. Você digitou apenas ${customer.name.length}`}
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">E-mail *</label>
                <InputText
                  placeholder="E-mail"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onBlur={() => touch("email")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("email", customer.email)}
                  text="Informe o e-mail do cliente"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Telefone *</label>
                <InputText
                  placeholder="Telefone"
                  value={formatTelephone(customer.phone)}
                  onChange={(e) =>
                    setField(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 11),
                    )
                  }
                  onBlur={() => touch("phone")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("phone", customer.phone)}
                  text="Informe o telefone do cliente"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">CPF *</label>
                <InputText
                  placeholder="CPF"
                  value={customer.cpf}
                  onChange={(e) => setField("cpf", e.target.value)}
                  onBlur={() => touch("cpf")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("cpf", customer.cpf)}
                  text="Informe o CPF do cliente"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom">CEP *</label>
                <InputText
                  placeholder="CEP"
                  value={formatZipCode(customer.address.zipCode)}
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
                  visible={requiredMessage("zipCode", customer.address.zipCode)}
                  text="Informe o CEP"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Rua *</label>
                <InputText
                  placeholder="Rua"
                  value={customer.address.street}
                  onChange={(e) => setAddressField("street", e.target.value)}
                  onBlur={() => touch("street")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("street", customer.address.street)}
                  text="Informe a rua do cliente"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom">Número *</label>
                <InputText
                  placeholder="Número"
                  value={customer.address.number}
                  onChange={(e) => setAddressField("number", e.target.value)}
                  onBlur={() => touch("number")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("number", customer.address.number)}
                  text="Informe o número"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Complemento</label>
                <InputText
                  placeholder="Complemento"
                  value={customer.address.complement || ""}
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
                  value={customer.address.neighborhood}
                  onChange={(e) =>
                    setAddressField("neighborhood", e.target.value)
                  }
                  onBlur={() => touch("neighborhood")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage(
                    "neighborhood",
                    customer.address.neighborhood,
                  )}
                  text="Informe o bairro"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Cidade *</label>
                <InputText
                  placeholder="Cidade"
                  value={customer.address.city}
                  onChange={(e) => setAddressField("city", e.target.value)}
                  onBlur={() => touch("city")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("city", customer.address.city)}
                  text="Informe a cidade"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom">UF *</label>
                <InputText
                  placeholder="UF"
                  maxLength={2}
                  value={customer.address.state}
                  onChange={(e) => setAddressField("state", e.target.value)}
                  onBlur={() => touch("state")}
                  className="form-control"
                />
                <Message
                  visible={requiredMessage("state", customer.address.state)}
                  text="Informe a UF"
                />
              </div>
            </div>
            <div className="customer-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving}
                className="btn btn-primary customer-form-button"
              >
                SALVAR
              </button>
              <Link to="/customers/">
                <button
                  type="button"
                  className="btn btn-outline-danger customer-form-button"
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
