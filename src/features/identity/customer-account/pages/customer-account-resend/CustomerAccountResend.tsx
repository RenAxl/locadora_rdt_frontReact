import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { CustomerAccountResend as CustomerAccountResendModel } from "../../models/CustomerAccountResend";
import { CustomerAccountResendMapper } from "../../mappers/customer-account-resend.mapper";
import { customerAccountService } from "../../services/customer-account.service";
import "../../CustomerAccountForm.css";

export function CustomerAccountResend() {
  const [params] = useSearchParams();
  const [account, setAccount] = useState(
    new CustomerAccountResendModel({ email: params.get("email") || "" }),
  );
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const setField = (field: keyof CustomerAccountResendModel, value: string) =>
    setAccount(new CustomerAccountResendModel({ ...account, [field]: value }));
  const invalidEmail =
    !/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      account.email,
    );
  const invalid = invalidEmail;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid || loading) return;
    setLoading(true);
    try {
      await customerAccountService.resendActivation(
        CustomerAccountResendMapper.toDTO(account),
      );
      notificationService.add({
        severity: "success",
        detail: "Um novo link de ativação foi enviado.",
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
        <div className="login-card">
          <div className="login-header">
            <h1>Reenviar ativação</h1>
            <p className="login-subtitle">
              Caso não tenha recebido, informe seu e-mail para receber um novo
              link de ativação da sua conta.
            </p>
          </div>
          <form className="login-form" onSubmit={save} noValidate>
            <div className="form-fields">
              <div className="field">
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
                    value={account.email}
                    onChange={(event) => setField("email", event.target.value)}
                    onBlur={() => touch("email")}
                  />
                </span>
                <Message
                  visible={!!touched.email && !account.email}
                  text="Informe o e-mail"
                />
                <Message
                  visible={!!touched.email && !!account.email && invalidEmail}
                  text="Informe um e-mail válido"
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary login-form-button"
                disabled={invalid || loading}
              >
                {loading ? "ENVIANDO..." : "Reenviar link"}
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
