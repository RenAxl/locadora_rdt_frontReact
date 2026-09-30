import { FormEvent, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pagination } from "../../../../../core/models/Pagination";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { UserMapper } from "../../mappers/user.mapper";
import { User } from "../../models/User";
import { userService } from "../../services/user.service";
import { Role } from "../../../roles/models/Role";
import { RoleMapper } from "../../../roles/mappers/role.mapper";
import { roleService } from "../../../roles/services/role.service";
import "./UserForm.css";

type FieldName =
  | "name"
  | "email"
  | "telephone"
  | "roleIds"
  | "zipCode"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state";

export function UserForm() {
  const [user, setUser] = useState(new User());
  const [roles, setRoles] = useState<Role[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const pagination = new Pagination(0, 100, "ASC", "authority");
        const data = await roleService.list(pagination, "");
        setRoles(RoleMapper.toModelList(data.content));
      } catch {
        // O interceptor HTTP já exibe a mensagem equivalente ao Angular.
      }
    };

    const loadUser = async () => {
      if (!userId) return;
      try {
        const data = await userService.findById(userId);
        setUser(UserMapper.toModel(data));
      } catch {
        // O interceptor HTTP já exibe a mensagem equivalente ao Angular.
      }
    };

    loadRoles();
    loadUser();
  }, [userId]);

  const setField = (field: "name" | "email" | "telephone", value: string) => {
    setUser(new User({ ...user, [field]: value }));
  };

  const setAddressField = (field: keyof User["address"], value: string) => {
    setUser(
      new User({ ...user, address: { ...user.address, [field]: value } }),
    );
  };

  const touch = (field: FieldName) => setTouched({ ...touched, [field]: true });
  const required = (value?: string) => !value;
  const invalid =
    required(user.name) ||
    user.name.length < 5 ||
    required(user.email) ||
    user.telephone.replace(/\D/g, "").length !== 11 ||
    user.roleIds.length === 0 ||
    user.address.zipCode.replace(/\D/g, "").length !== 8 ||
    required(user.address.street) ||
    required(user.address.number) ||
    required(user.address.neighborhood) ||
    required(user.address.city) ||
    required(user.address.state);

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
        telephone: true,
        roleIds: true,
        zipCode: true,
        street: true,
        number: true,
        neighborhood: true,
        city: true,
        state: true,
      });
      return;
    }

    try {
      if (user.id != null) {
        await userService.update(UserMapper.toUpdateDTO(user));
        navigate("/users/");
        notificationService.add({
          severity: "success",
          detail: "Usuário atualizado com sucesso!",
        });
      } else {
        await userService.insert(UserMapper.toInsertDTO(user));
        navigate("/users/");
        notificationService.add({
          severity: "success",
          detail:
            "Usuário cadastrado com sucesso!. Para ativar a conta acesse o E-mail cadastrado",
        });
      }
    } catch {
      // O erro já foi tratado pelo interceptor.
    }
  };

  const requiredMessage = (field: FieldName, value?: string) =>
    touched[field] && required(value);

  return (
    <div className="user-form-container">
      <div className="user-card">
        <form onSubmit={save} noValidate>
          <div className="col-12 mb-3">
            <h1>Dados do Usuário</h1>
          </div>
          <div className="row g-3 user-form-inputs">
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Nome *</label>
              <InputText
                placeholder="Nome"
                value={user.name}
                onChange={(e) => setField("name", e.target.value)}
                onBlur={() => touch("name")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("name", user.name)}
                text="Informe o nome completo do usuário"
              />
              <Message
                visible={!!touched.name && !!user.name && user.name.length < 5}
                text={`Mínimo de 5 caracteres. Você digitou apenas ${user.name.length}`}
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">E-mail *</label>
              <InputText
                placeholder="E-mail"
                type="email"
                value={user.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => touch("email")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("email", user.email)}
                text="Informe o e-mail do usuário"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Telefone *</label>
              <InputText
                placeholder="Telefone"
                value={formatTelephone(user.telephone)}
                onChange={(e) =>
                  setField(
                    "telephone",
                    e.target.value.replace(/\D/g, "").slice(0, 11),
                  )
                }
                onBlur={() => touch("telephone")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("telephone", user.telephone)}
                text="Informe o telefone do usuário"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Perfis *</label>
              <MultiSelect
                value={user.roleIds}
                options={roles}
                optionLabel="authority"
                optionValue="id"
                placeholder="Selecione os perfis"
                className="w-100"
                style={{ width: "100%" }}
                onChange={(event) =>
                  setUser(new User({ ...user, roleIds: event.value || [] }))
                }
                onBlur={() => touch("roleIds")}
              />
              <Message
                visible={!!touched.roleIds && user.roleIds.length === 0}
                text="Informe pelo menos um perfil"
              />
            </div>
            <div className="col-12 col-lg-3">
              <label className="form-label-custom">CEP *</label>
              <InputText
                placeholder="CEP"
                value={formatZipCode(user.address.zipCode)}
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
                visible={requiredMessage("zipCode", user.address.zipCode)}
                text="Informe o CEP"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Rua *</label>
              <InputText
                placeholder="Rua"
                value={user.address.street}
                onChange={(e) => setAddressField("street", e.target.value)}
                onBlur={() => touch("street")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("street", user.address.street)}
                text="Informe a rua do usuário"
              />
            </div>
            <div className="col-12 col-lg-3">
              <label className="form-label-custom">Número *</label>
              <InputText
                placeholder="Número"
                value={user.address.number}
                onChange={(e) => setAddressField("number", e.target.value)}
                onBlur={() => touch("number")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("number", user.address.number)}
                text="Informe o número"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Complemento</label>
              <InputText
                placeholder="Complemento"
                value={user.address.complement || ""}
                onChange={(e) => setAddressField("complement", e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Bairro *</label>
              <InputText
                placeholder="Bairro"
                value={user.address.neighborhood}
                onChange={(e) =>
                  setAddressField("neighborhood", e.target.value)
                }
                onBlur={() => touch("neighborhood")}
                className="form-control"
              />
              <Message
                visible={requiredMessage(
                  "neighborhood",
                  user.address.neighborhood,
                )}
                text="Informe o bairro"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Cidade *</label>
              <InputText
                placeholder="Cidade"
                value={user.address.city}
                onChange={(e) => setAddressField("city", e.target.value)}
                onBlur={() => touch("city")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("city", user.address.city)}
                text="Informe a cidade"
              />
            </div>
            <div className="col-12 col-lg-3">
              <label className="form-label-custom">UF *</label>
              <InputText
                placeholder="UF"
                maxLength={2}
                value={user.address.state}
                onChange={(e) => setAddressField("state", e.target.value)}
                onBlur={() => touch("state")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("state", user.address.state)}
                text="Informe a UF"
              />
            </div>
          </div>
          <div className="user-form-buttons mt-4">
            <button
              type="submit"
              disabled={invalid}
              className="btn btn-primary user-form-button"
            >
              SALVAR
            </button>
            <Link to="/users/">
              <button
                type="button"
                className="btn btn-outline-danger user-form-button"
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
