import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { CustomerAccountPassword } from "../../models/CustomerAccountPassword";
import { CustomerAccountPasswordMapper } from "../../mappers/customer-account-password.mapper";
import { customerAccountService } from "../../services/customer-account.service";
import "../../CustomerAccountForm.css";

export function CustomerAccountCreatePassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setAccount] = useState(new CustomerAccountPassword());
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const setField = (field: keyof CustomerAccountPassword, value: string) =>
    setAccount(new CustomerAccountPassword({ ...password, [field]: value }));
  const token = params.get("token") || "";
  const invalid =
    password.password.length < 6 || password.passwordConfirmation.length < 6;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid || loading || !token) return;
    if (password.password !== password.passwordConfirmation) {
      notificationService.add({
        severity: "warn",
        detail: "As senhas não conferem.",
      });
      return;
    }
    setLoading(true);
    try {
      await customerAccountService.createPassword(
        token,
        CustomerAccountPasswordMapper.toDTO(password),
      );
      navigate("/login");
      notificationService.add({
        severity: "success",
        detail: "Conta ativada com sucesso! Faça seu login.",
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
            <h1>Criar senha</h1>
            <p className="login-subtitle">
              Defina a senha de acesso à sua conta.
            </p>
          </div>
          <form className="login-form" onSubmit={save} noValidate>
            <div className="form-fields">
              <div className="field">
                <label htmlFor="password">Nova senha *</label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-lock" aria-hidden="true" />
                  <InputText
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Nova senha"
                    minLength={6}
                    className="form-control w-100"
                    disabled={loading}
                    value={password.password}
                    onChange={(event) =>
                      setField("password", event.target.value)
                    }
                    onBlur={() => touch("password")}
                  />
                </span>
                <Message
                  visible={!!touched.password && !password.password}
                  text="Informe a nova senha"
                />
                <Message
                  visible={
                    !!touched.password &&
                    !!password.password &&
                    password.password.length < 6
                  }
                  text="A senha deve ter pelo menos 6 caracteres"
                />
              </div>
              <div className="field">
                <label htmlFor="passwordConfirmation">
                  Confirmar nova senha *
                </label>
                <span className="p-input-icon-left w-100">
                  <i className="pi pi-lock" aria-hidden="true" />
                  <InputText
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    placeholder="Confirmar nova senha"
                    minLength={6}
                    className="form-control w-100"
                    disabled={loading}
                    value={password.passwordConfirmation}
                    onChange={(event) =>
                      setField("passwordConfirmation", event.target.value)
                    }
                    onBlur={() => touch("passwordConfirmation")}
                  />
                </span>
                <Message
                  visible={
                    !!touched.passwordConfirmation &&
                    !password.passwordConfirmation
                  }
                  text="Confirme a nova senha"
                />
                <Message
                  visible={
                    !!touched.passwordConfirmation &&
                    !!password.passwordConfirmation &&
                    password.passwordConfirmation.length < 6
                  }
                  text="A senha deve ter pelo menos 6 caracteres"
                />
              </div>
            </div>
            {!token && (
              <div className="token-warning" role="alert">
                Token não encontrado. Solicite um novo link.
              </div>
            )}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary login-form-button"
                disabled={invalid || loading || !token}
              >
                {loading ? "SALVANDO..." : "Criar senha"}
              </button>
              <Link
                to="/customer-account/resend"
                className="btn btn-outline-danger cancel-button"
              >
                Solicitar novo link
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
