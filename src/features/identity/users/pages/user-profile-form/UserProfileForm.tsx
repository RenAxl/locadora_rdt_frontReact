import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Link, useNavigate } from "react-router-dom";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { SessionContext } from "../../../../../shared/services/SessionContext";
import { UserMapper } from "../../mappers/user.mapper";
import { ChangePasswordMapper } from "../../mappers/change-password.mapper";
import { User } from "../../models/User";
import { ChangePassword } from "../../models/ChangePassword";
import { userProfileService } from "../../services/user-profile.service";
import "./UserProfileForm.css";

type FieldName =
  | "name"
  | "email"
  | "telephone"
  | "zipCode"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state";

export function UserProfileForm() {
  const [user, setUser] = useState(new User());
  const [password, setPassword] = useState(new ChangePassword());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { updateProfile, updatePhoto } = useContext(SessionContext);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      try {
        const data = await userProfileService.getMe();
        if (active) setUser(UserMapper.toModel(data));
      } catch {
        // O interceptor HTTP exibe o erro.
      }
    };
    const loadPhoto = async () => {
      try {
        const data = await userProfileService.getMyPhoto();
        if (active) setCurrentPhoto(data);
      } catch {
        // Um perfil sem foto usa o ícone padrão.
      }
    };
    loadUser();
    loadPhoto();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const photo = selectedPhoto || currentPhoto;
    if (!photo || photo.size === 0) return;
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedPhoto, currentPhoto]);

  const onPhotoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/webp"
    ) {
      notificationService.add({
        severity: "warn",
        detail: "Tipo de arquivo inválido. Use JPG, PNG ou WEBP.",
      });
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notificationService.add({
        severity: "warn",
        detail: "Foto muito grande. Máximo: 2MB.",
      });
      event.target.value = "";
      return;
    }
    setSelectedPhoto(file);
  };

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
    if (invalid || saving) return;
    if (password.newPassword.trim() !== "") {
      if (password.currentPassword.trim() === "") {
        notificationService.add({
          severity: "warn",
          detail: "Para alterar a senha, informe a senha atual.",
        });
        return;
      }
      if (password.newPassword.length < 6) {
        notificationService.add({
          severity: "warn",
          detail: "A nova senha deve ter no mínimo 6 caracteres.",
        });
        return;
      }
      if (password.newPassword !== password.confirmPassword) {
        notificationService.add({
          severity: "warn",
          detail: "A confirmação de senha deve ser igual à nova senha.",
        });
        return;
      }
    }
    setSaving(true);
    try {
      const data = await userProfileService.updateMe(
        UserMapper.toMeUpdateDTO(user),
      );
      const profile = UserMapper.toModel(data);
      setUser(profile);
      updateProfile(profile);
      if (password.newPassword.trim() !== "") {
        try {
          await userProfileService.changePassword(
            ChangePasswordMapper.toDTO(password),
          );
          setPassword(new ChangePassword());
        } catch {
          notificationService.add({
            severity: "warn",
            detail: "Perfil atualizado, mas não foi possível alterar a senha.",
          });
          return;
        }
      }
      if (selectedPhoto) {
        try {
          await userProfileService.updateMyPhoto(selectedPhoto);
          updatePhoto(selectedPhoto);
        } catch {
          notificationService.add({
            severity: "warn",
            detail: "Perfil atualizado, mas falhou ao enviar a foto.",
          });
          navigate("/home");
          return;
        }
      }
      notificationService.add({
        severity: "success",
        detail: "Perfil atualizado com sucesso!",
      });
      navigate("/home");
    } catch {
      // O interceptor HTTP exibe o erro.
    } finally {
      setSaving(false);
    }
  };

  const requiredMessage = (field: FieldName, value?: string) =>
    !!touched[field] && required(value);

  return (
    <div className="profile-form-container">
      <div className="profile-card">
        <form onSubmit={save} noValidate>
          <div className="col-12 mb-3">
            <h1>Meu Perfil</h1>
          </div>
          <div className="profile-photo-header">
            <div className="profile-photo-area">
              <div className="profile-photo-frame">
                {photoUrl ? (
                  <img
                    className="profile-photo"
                    src={photoUrl}
                    alt="Foto do perfil"
                  />
                ) : (
                  <div
                    className="profile-photo-placeholder"
                    aria-label="Sem foto"
                  >
                    <span className="profile-photo-icon">👤</span>
                  </div>
                )}
              </div>
              <div className="profile-photo-meta">
                <div className="profile-photo-title">Foto do Perfil</div>
                <div className="profile-photo-subtitle">
                  JPG, PNG ou WEBP • até 2MB
                </div>
                <div className="profile-photo-actions">
                  <label className="upload-btn" htmlFor="photo">
                    <span className="upload-btn-icon">⬆️</span>
                    <span>Selecionar foto</span>
                  </label>
                  <input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onPhotoSelected}
                    className="upload-input"
                  />
                  {selectedPhoto && (
                    <span className="file-chip">{selectedPhoto.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row g-3 profile-form-inputs">
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Nome</label>
              <InputText
                placeholder="Nome"
                value={user.name}
                onChange={(e) => setField("name", e.target.value)}
                onBlur={() => touch("name")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("name", user.name)}
                text="Informe seu nome completo"
              />
              <Message
                visible={!!touched.name && !!user.name && user.name.length < 5}
                text={`Mínimo de 5 caracteres. Você digitou apenas ${user.name.length}`}
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">E-mail</label>
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
                text="Informe seu e-mail"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Telefone</label>
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
                text="Informe seu telefone"
              />
            </div>
            <div className="col-12 col-lg-3">
              <label className="form-label-custom">CEP</label>
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
              <label className="form-label-custom">Rua</label>
              <InputText
                placeholder="Rua"
                value={user.address.street}
                onChange={(e) => setAddressField("street", e.target.value)}
                onBlur={() => touch("street")}
                className="form-control"
              />
              <Message
                visible={requiredMessage("street", user.address.street)}
                text="Informe sua rua"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Número</label>
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
              <label className="form-label-custom">Bairro</label>
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
              <label className="form-label-custom">Cidade</label>
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
              <label className="form-label-custom">UF</label>
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
            <div className="col-12 mt-2">
              <h5 className="mt-3">Alterar Senha</h5>
              <small className="field-help">
                Se não quiser alterar a senha, deixe os campos de nova senha em
                branco.
              </small>
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Senha atual</label>
              <InputText
                type="password"
                placeholder="Senha atual"
                className="form-control"
                value={password.currentPassword}
                onChange={(event) =>
                  setPassword(
                    new ChangePassword({
                      ...password,
                      currentPassword: event.target.value,
                    }),
                  )
                }
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Nova senha</label>
              <InputText
                type="password"
                placeholder="Nova senha"
                className="form-control"
                value={password.newPassword}
                onChange={(event) =>
                  setPassword(
                    new ChangePassword({
                      ...password,
                      newPassword: event.target.value,
                    }),
                  )
                }
              />
              <small className="field-help">Mínimo de 6 caracteres.</small>
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Confirmar nova senha</label>
              <InputText
                type="password"
                placeholder="Confirmar nova senha"
                className="form-control"
                value={password.confirmPassword}
                onChange={(event) =>
                  setPassword(
                    new ChangePassword({
                      ...password,
                      confirmPassword: event.target.value,
                    }),
                  )
                }
              />
              <small className="field-help">Deve ser igual à nova senha.</small>
            </div>
          </div>
          <div className="profile-form-buttons mt-4">
            <button
              type="submit"
              disabled={invalid || saving}
              className="btn btn-primary profile-form-button"
            >
              SALVAR
            </button>
            <Link
              to="/home"
              className="btn btn-outline-danger profile-form-button d-inline-flex align-items-center justify-content-center"
            >
              CANCELAR
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
