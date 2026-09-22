import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { passwordRecoveryService } from "../../services/password-recovery.service";
import "./RequestPasswordReset.css";

export function RequestPasswordReset() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const emailPattern =
    /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const invalidEmail = !emailPattern.test(email);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (invalidEmail || loading) return;
    setLoading(true);
    try {
      await passwordRecoveryService.requestReset(email.trim());
      notificationService.add({
        severity: "success",
        detail: "E-mail enviado com sucesso. Acesso o link que esta no e-mail",
      });
      navigate("/login");
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-screen">
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>Esqueceu a senha?</h1>
            <p className="login-subtitle">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>
          <form className="login-form" onSubmit={save} noValidate>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <span className="p-input-icon-left w-100">
                <i className="pi pi-envelope" />
                <InputText
                  id="email"
                  type="email"
                  className="form-control w-100"
                  placeholder="Digite seu e-mail"
                  disabled={loading}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setTouched(true)}
                />
              </span>
              <Message visible={touched && !email} text="Informe seu e-mail" />
              <Message
                visible={touched && !!email && invalidEmail}
                text="Informe um e-mail válido"
              />
            </div>
            {submitted && (
              <div className="info-box">
                Se este e-mail estiver cadastrado, você receberá um link para
                redefinir sua senha.
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary login-form-button"
              disabled={invalidEmail || loading}
            >
              {loading ? "ENVIANDO..." : "Enviar link"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger cancel-button"
              disabled={loading}
              onClick={() => navigate("/login")}
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
