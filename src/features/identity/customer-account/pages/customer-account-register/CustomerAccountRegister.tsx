import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { CustomerAccountRegistration } from "../../models/CustomerAccountRegistration";
import { CustomerAccountRegistrationMapper } from "../../mappers/customer-account-registration.mapper";
import { customerAccountService } from "../../services/customer-account.service";
import "../../CustomerAccountForm.css";
import "./CustomerAccountRegister.css";

export function CustomerAccountRegister() {
  const navigate = useNavigate();
  const [registration, setAccount] = useState(
    new CustomerAccountRegistration(),
  );
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const setField = (field: keyof CustomerAccountRegistration, value: string) =>
    setAccount(
      new CustomerAccountRegistration({ ...registration, [field]: value }),
    );
  const invalidEmail =
    !/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      registration.email,
    );
  const invalid =
    !registration.name ||
    registration.name.length > 100 ||
    !/^[0-9]{11}$/.test(registration.cpf) ||
    invalidEmail ||
    !registration.phone ||
    !registration.street ||
    !registration.number ||
    !registration.neighborhood ||
    !registration.city ||
    registration.state.length !== 2 ||
    !registration.zipCode;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid || loading) return;
    setLoading(true);
    try {
      await customerAccountService.register(
        CustomerAccountRegistrationMapper.toDTO(registration),
      );
      navigate(
        `/customer-account/resend?${new URLSearchParams({ email: registration.email })}`,
      );
      notificationService.add({
        severity: "success",
        detail:
          "Cadastro realizado! Enviamos um link para você criar sua senha.",
      });
    } catch {
      // O interceptor HTTP exibe o erro.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-account-screen">
      <div className="login-page">
        <div className="login-card registration-card">
          <div className="login-header">
            <h1>Cadastro de cliente</h1>
            <p className="login-subtitle">
              Preencha seus dados para criar sua conta.
            </p>
          </div>
          <form className="login-form" onSubmit={save} noValidate>
            <div className="form-fields registration-fields">
              <div className="field field-full">
                <label htmlFor="name">Nome completo *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-user" aria-hidden="true" />
                  <InputText
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nome completo"
                    maxLength={100}
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.name}
                    onChange={(event) => setField("name", event.target.value)}
                    onBlur={() => touch("name")}
                  />
                </span>
                <Message
                  visible={!!touched.name && !registration.name}
                  text="Informe o nome completo"
                />
                <Message
                  visible={!!touched.name && registration.name.length > 100}
                  text="O nome deve ter no máximo 100 caracteres"
                />
              </div>
              <div className="field">
                <label htmlFor="cpf">CPF *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-id-card" aria-hidden="true" />
                  <InputText
                    id="cpf"
                    name="cpf"
                    type="text"
                    placeholder="CPF"
                    maxLength={11}
                    minLength={11}
                    inputMode="numeric"
                    pattern="[0-9]{11}"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.cpf}
                    onChange={(event) => setField("cpf", event.target.value)}
                    onBlur={() => touch("cpf")}
                  />
                </span>
                <Message
                  visible={!!touched.cpf && !registration.cpf}
                  text="Informe o CPF"
                />
                <Message
                  visible={
                    !!touched.cpf &&
                    !!registration.cpf &&
                    !/^[0-9]{11}$/.test(registration.cpf)
                  }
                  text="O CPF deve conter 11 dígitos"
                />
              </div>
              <div className="field">
                <label htmlFor="phone">Telefone *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-phone" aria-hidden="true" />
                  <InputText
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder="Telefone"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.phone}
                    onChange={(event) => setField("phone", event.target.value)}
                    onBlur={() => touch("phone")}
                  />
                </span>
                <Message
                  visible={!!touched.phone && !registration.phone}
                  text="Informe o telefone"
                />
              </div>
              <div className="field field-full">
                <label htmlFor="email">E-mail *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-envelope" aria-hidden="true" />
                  <InputText
                    id="email"
                    name="email"
                    type="email"
                    placeholder="E-mail"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.email}
                    onChange={(event) => setField("email", event.target.value)}
                    onBlur={() => touch("email")}
                  />
                </span>
                <Message
                  visible={!!touched.email && !registration.email}
                  text="Informe o e-mail"
                />
                <Message
                  visible={
                    !!touched.email && !!registration.email && invalidEmail
                  }
                  text="Informe um e-mail válido"
                />
              </div>
              <div className="field">
                <label htmlFor="street">Rua *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-map-marker" aria-hidden="true" />
                  <InputText
                    id="street"
                    name="street"
                    type="text"
                    placeholder="Rua"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.street}
                    onChange={(event) => setField("street", event.target.value)}
                    onBlur={() => touch("street")}
                  />
                </span>
                <Message
                  visible={!!touched.street && !registration.street}
                  text="Informe a rua"
                />
              </div>
              <div className="field">
                <label htmlFor="number">Número *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-home" aria-hidden="true" />
                  <InputText
                    id="number"
                    name="number"
                    type="text"
                    placeholder="Número"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.number}
                    onChange={(event) => setField("number", event.target.value)}
                    onBlur={() => touch("number")}
                  />
                </span>
                <Message
                  visible={!!touched.number && !registration.number}
                  text="Informe o número"
                />
              </div>
              <div className="field field-full">
                <label htmlFor="complement">Complemento</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-home" aria-hidden="true" />
                  <InputText
                    id="complement"
                    name="complement"
                    type="text"
                    placeholder="Complemento"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.complement}
                    onChange={(event) =>
                      setField("complement", event.target.value)
                    }
                    onBlur={() => touch("complement")}
                  />
                </span>
              </div>
              <div className="field">
                <label htmlFor="neighborhood">Bairro *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-map-marker" aria-hidden="true" />
                  <InputText
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    placeholder="Bairro"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.neighborhood}
                    onChange={(event) =>
                      setField("neighborhood", event.target.value)
                    }
                    onBlur={() => touch("neighborhood")}
                  />
                </span>
                <Message
                  visible={!!touched.neighborhood && !registration.neighborhood}
                  text="Informe o bairro"
                />
              </div>
              <div className="field">
                <label htmlFor="city">Cidade *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-map-marker" aria-hidden="true" />
                  <InputText
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Cidade"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.city}
                    onChange={(event) => setField("city", event.target.value)}
                    onBlur={() => touch("city")}
                  />
                </span>
                <Message
                  visible={!!touched.city && !registration.city}
                  text="Informe a cidade"
                />
              </div>
              <div className="field">
                <label htmlFor="state">UF *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-map" aria-hidden="true" />
                  <InputText
                    id="state"
                    name="state"
                    type="text"
                    placeholder="UF"
                    maxLength={2}
                    minLength={2}
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.state}
                    onChange={(event) => setField("state", event.target.value)}
                    onBlur={() => touch("state")}
                  />
                </span>
                <Message
                  visible={!!touched.state && !registration.state}
                  text="Informe a UF"
                />
                <Message
                  visible={
                    !!touched.state &&
                    !!registration.state &&
                    registration.state.length < 2
                  }
                  text="A UF deve ter 2 caracteres"
                />
              </div>
              <div className="field">
                <label htmlFor="zipCode">CEP *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-map-marker" aria-hidden="true" />
                  <InputText
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    placeholder="CEP"
                    className="form-control w-100"
                    disabled={loading}
                    value={registration.zipCode}
                    onChange={(event) =>
                      setField("zipCode", event.target.value)
                    }
                    onBlur={() => touch("zipCode")}
                  />
                </span>
                <Message
                  visible={!!touched.zipCode && !registration.zipCode}
                  text="Informe o CEP"
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary login-form-button"
                disabled={invalid || loading}
              >
                {loading ? "CADASTRANDO..." : "Cadastrar"}
              </button>
              <Link
                to="/login"
                className="btn btn-outline-danger cancel-button"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
