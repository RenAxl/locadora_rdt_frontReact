import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import "./LoginForm.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password || loading) return;
    setLoading(true);
    try {
      await authService.login(email, password);
      notificationService.add({
        severity: "success",
        detail: "Usuário autenticado com sucesso!",
      });
      navigate("/home");
    } catch {
      // O interceptor HTTP exibe o erro.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1>Login</h1>
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
                  placeholder="ex: renan@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                />
              </span>
              <Message
                visible={touched.email && !email}
                text="Informe o E-mail"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Senha</label>
              <span className="p-input-icon-left w-100">
                <i className="pi pi-lock" />
                <InputText
                  id="password"
                  type="password"
                  className="form-control w-100"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                />
              </span>
              <Message
                visible={touched.password && !password}
                text="Informe a senha"
              />
            </div>
            <div className="forgot-password">
              <Link to="/password-recovery">Esqueceu a senha?</Link>
            </div>
            <button
              type="submit"
              className="btn btn-primary login-form-button"
              disabled={!email || !password || loading}
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
