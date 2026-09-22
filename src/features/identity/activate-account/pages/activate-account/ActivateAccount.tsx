import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { activateAccountService } from "../../services/activate-account.service";
import "./ActivateAccount.css";

export function ActivateAccount() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [mismatch, setMismatch] = useState(false);
  const token = params.get("token") || "";
  const invalid = password.length < 6 || confirmPassword.length < 6;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || invalid || loading) return;
    if (password !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setLoading(true);
    try {
      await activateAccountService.activate(token, password);
      notificationService.add({
        severity: "success",
        detail: "Senha cadastrada com sucesso! Você já pode acessar o sistema.",
      });
      navigate("/login");
    } catch {
      // O interceptor HTTP exibe o erro.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="activate-screen">
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>Criar senha</h1>
          </div>
          <form className="login-form" onSubmit={save} noValidate>
            <div className="field">
              <label htmlFor="password">Nova senha</label>
              <span className="p-input-icon-left w-100">
                <i className="pi pi-lock" />
                <InputText
                  id="password"
                  type="password"
                  className="form-control w-100"
                  placeholder="Digite sua nova senha"
                  disabled={loading}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setMismatch(false);
                  }}
                  onBlur={() => setTouched({ ...touched, password: true })}
                />
              </span>
              <Message
                visible={touched.password && !password}
                text="Informe uma senha"
              />
              <Message
                visible={touched.password && !!password && password.length < 6}
                text="Mínimo de 6 caracteres."
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <span className="p-input-icon-left w-100">
                <i className="pi pi-lock" />
                <InputText
                  id="confirmPassword"
                  type="password"
                  className="form-control w-100"
                  placeholder="Confirme sua senha"
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setMismatch(false);
                  }}
                  onBlur={() => setTouched({ ...touched, confirm: true })}
                />
              </span>
              <Message
                visible={touched.confirm && !confirmPassword}
                text="Confirme a senha"
              />
              <Message visible={mismatch} text="As senhas não conferem" />
            </div>
            {!token && (
              <div className="token-warning">
                Token não encontrado na URL. Abra novamente o link do e-mail.
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary login-form-button"
              disabled={invalid || loading || !token}
            >
              {loading ? "ENVIANDO..." : "Confirmar"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger cancel-button"
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
