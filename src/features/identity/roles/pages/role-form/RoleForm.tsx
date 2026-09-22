import { FormEvent, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Link, useNavigate } from "react-router-dom";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { RoleMapper } from "../../mappers/role.mapper";
import { Role } from "../../models/Role";
import { roleService } from "../../services/role.service";
import "./RoleForm.css";

export function RoleForm() {
  const [role, setRole] = useState(new Role());
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  const required = !role.authority.trim();
  const minimumLength = role.authority.length < 3;
  const invalid = required || minimumLength;

  const normalizeAuthority = (value: string) => {
    let authority = value.trim().toUpperCase();
    authority = authority.replace(/\s+/g, "_");
    authority = authority.replace(/[^A-Z0-9_]/g, "");

    if (authority && !authority.startsWith("ROLE_")) {
      authority = "ROLE_" + authority;
    }

    return authority;
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();

    if (invalid) {
      setTouched(true);
      return;
    }

    const roleToInsert = new Role({
      ...role,
      authority: normalizeAuthority(role.authority),
    });

    try {
      await roleService.insert(RoleMapper.toInsertDTO(roleToInsert));
      navigate("/roles/");
      notificationService.add({
        severity: "success",
        detail: "Perfil cadastrado com sucesso!",
      });
    } catch {
      // O interceptor HTTP exibe a mensagem de erro.
    }
  };

  return (
    <div className="role-form-container">
      <div className="role-card">
        <form onSubmit={save} noValidate>
          <div className="col-12 mb-3">
            <h1>Dados do Perfil</h1>
          </div>

          <div className="row g-3 role-form-inputs">
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Nome do Perfil *</label>
              <InputText
                placeholder="Nome do Perfil"
                value={role.authority}
                maxLength={100}
                onChange={(event) =>
                  setRole(new Role({ ...role, authority: event.target.value }))
                }
                onBlur={() => setTouched(true)}
                className="form-control"
              />

              <Message
                visible={touched && required}
                text="Informe o nome do perfil"
              />
              <Message
                visible={touched && !required && minimumLength}
                text={`Mínimo de 3 caracteres. Você digitou apenas ${role.authority.length}`}
              />
            </div>
          </div>

          <div className="role-form-buttons mt-4">
            <button
              type="submit"
              disabled={invalid}
              className="btn btn-primary role-form-button"
            >
              SALVAR
            </button>

            <Link to="/roles/">
              <button
                type="button"
                className="btn btn-outline-danger role-form-button"
              >
                CANCELAR
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
