import { FormEvent, useContext, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { SessionContext } from "../../../../../shared/services/SessionContext";
import { SystemSetting } from "../../models/SystemSetting";
import { SystemSettingMapper } from "../../mappers/system-setting.mapper";
import { systemSettingService } from "../../services/system-setting.service";
import { SYSTEM_SETTING_ICONS } from "../../constants/system-setting-icons";
import "./SystemSettingForm.css";

export function SystemSettingForm() {
  const [setting, setSetting] = useState(new SystemSetting());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { updateSetting } = useContext(SessionContext);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadSetting = async () => {
      try {
        const data = await systemSettingService.findCurrent();
        if (active) {
          const current = SystemSettingMapper.toModel(data);
          setSetting(current);
          updateSetting(current);
        }
      } catch {
        // O interceptor HTTP exibe o erro.
      } finally {
        if (active) setLoading(false);
      }
    };
    loadSetting();
    return () => {
      active = false;
    };
  }, [updateSetting]);

  const touch = (field: string) => setTouched({ ...touched, [field]: true });
  const requiredMessage = (field: string, value?: string) =>
    !!touched[field] && !value;
  const setAddressField = (
    field: keyof SystemSetting["address"],
    value: string,
  ) => {
    setSetting(
      new SystemSetting({
        ...setting,
        address: { ...setting.address, [field]: value },
      }),
    );
  };
  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.length > 5
      ? `${digits.slice(0, 5)}-${digits.slice(5)}`
      : digits;
  };
  const invalid =
    !setting.companyName ||
    !setting.icon ||
    setting.address.zipCode.replace(/\D/g, "").length !== 8 ||
    !setting.address.street ||
    !setting.address.number ||
    !setting.address.neighborhood ||
    !setting.address.city ||
    setting.address.state.length !== 2;
  const iconType =
    setting.icon === "fa-playstation" || setting.icon === "fa-xbox"
      ? "fa-brands"
      : "fa-solid";

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid || saving || !authService.hasAuthority("SYSTEM_SETTING_WRITE"))
      return;
    setSaving(true);
    try {
      const current = new SystemSetting({
        ...setting,
        address: {
          ...setting.address,
          state: setting.address.state.toUpperCase(),
        },
      });
      const data = await systemSettingService.update(
        SystemSettingMapper.toUpdateDTO(current),
      );
      const updated = SystemSettingMapper.toModel(data);
      setSetting(updated);
      updateSetting(updated);
      notificationService.add({
        severity: "success",
        detail: "Configurações atualizadas com sucesso!",
      });
      navigate("/home");
    } catch {
      // O interceptor HTTP exibe o erro.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="system-setting-form-container">
      <div className="system-setting-card">
        <form onSubmit={save} noValidate>
          <div className="col-12 mb-3">
            <h1>Configurações do Sistema</h1>
          </div>
          {loading ? (
            <div className="loading">Carregando configurações...</div>
          ) : (
            <>
              <div className="row g-3 system-setting-form-inputs">
                <div className="col-12">
                  <label className="form-label-custom">Nome da empresa *</label>
                  <InputText
                    className="form-control"
                    placeholder="Nome da empresa"
                    maxLength={120}
                    value={setting.companyName}
                    onChange={(event) =>
                      setSetting(
                        new SystemSetting({
                          ...setting,
                          companyName: event.target.value,
                        }),
                      )
                    }
                    onBlur={() => touch("companyName")}
                  />
                  <Message
                    visible={requiredMessage(
                      "companyName",
                      setting.companyName,
                    )}
                    text="Informe o nome da locadora"
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <label className="form-label-custom" htmlFor="systemIcon">
                    Ícone da empresa *
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <i
                      className={`fs-3 ${iconType} ${setting.icon}`}
                      aria-hidden="true"
                    />
                    <Dropdown
                      inputId="systemIcon"
                      value={setting.icon}
                      options={SYSTEM_SETTING_ICONS}
                      optionLabel="label"
                      optionValue="value"
                      filter
                      filterBy="label"
                      filterPlaceholder="Pesquisar ícone"
                      emptyFilterMessage="Nenhum ícone encontrado"
                      placeholder="Selecione um ícone"
                      className="w-100"
                      style={{ width: "100%" }}
                      onBlur={() => touch("icon")}
                      onChange={(event) =>
                        setSetting(
                          new SystemSetting({ ...setting, icon: event.value }),
                        )
                      }
                      itemTemplate={(item) => (
                        <>
                          <i
                            className={`me-2 ${item.value === "fa-playstation" || item.value === "fa-xbox" ? "fa-brands" : "fa-solid"} ${item.value}`}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </>
                      )}
                    />
                  </div>
                  <Message
                    visible={requiredMessage("icon", setting.icon)}
                    text="Selecione o ícone da empresa"
                  />
                </div>
                <div className="col-12">
                  <h4>Endereço da locadora</h4>
                </div>
                <div className="col-12 col-lg-3">
                  <label className="form-label-custom">CEP *</label>
                  <InputText
                    placeholder="CEP"
                    value={formatZipCode(setting.address.zipCode)}
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
                    visible={requiredMessage(
                      "zipCode",
                      setting.address.zipCode,
                    )}
                    text="Informe o CEP"
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <label className="form-label-custom">Rua *</label>
                  <InputText
                    placeholder="Rua"
                    maxLength={100}
                    value={setting.address.street}
                    onChange={(e) => setAddressField("street", e.target.value)}
                    onBlur={() => touch("street")}
                    className="form-control"
                  />
                  <Message
                    visible={requiredMessage("street", setting.address.street)}
                    text="Informe a rua da locadora"
                  />
                </div>
                <div className="col-12 col-lg-3">
                  <label className="form-label-custom">Número *</label>
                  <InputText
                    placeholder="Número"
                    maxLength={20}
                    value={setting.address.number}
                    onChange={(e) => setAddressField("number", e.target.value)}
                    onBlur={() => touch("number")}
                    className="form-control"
                  />
                  <Message
                    visible={requiredMessage("number", setting.address.number)}
                    text="Informe o número"
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <label className="form-label-custom">Complemento</label>
                  <InputText
                    placeholder="Complemento"
                    maxLength={100}
                    value={setting.address.complement || ""}
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
                    maxLength={80}
                    value={setting.address.neighborhood}
                    onChange={(e) =>
                      setAddressField("neighborhood", e.target.value)
                    }
                    onBlur={() => touch("neighborhood")}
                    className="form-control"
                  />
                  <Message
                    visible={requiredMessage(
                      "neighborhood",
                      setting.address.neighborhood,
                    )}
                    text="Informe o bairro"
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <label className="form-label-custom">Cidade *</label>
                  <InputText
                    placeholder="Cidade"
                    maxLength={80}
                    value={setting.address.city}
                    onChange={(e) => setAddressField("city", e.target.value)}
                    onBlur={() => touch("city")}
                    className="form-control"
                  />
                  <Message
                    visible={requiredMessage("city", setting.address.city)}
                    text="Informe a cidade"
                  />
                </div>
                <div className="col-12 col-lg-3">
                  <label className="form-label-custom">UF *</label>
                  <InputText
                    placeholder="UF"
                    maxLength={2}
                    value={setting.address.state}
                    onChange={(e) => setAddressField("state", e.target.value)}
                    onBlur={() => touch("state")}
                    className="form-control"
                  />
                  <Message
                    visible={requiredMessage("state", setting.address.state)}
                    text="Informe a UF"
                  />
                  <Message
                    visible={
                      !!touched.state &&
                      !!setting.address.state &&
                      setting.address.state.length < 2
                    }
                    text="UF deve possuir 2 caracteres"
                  />
                </div>
              </div>
              <div className="system-setting-form-buttons mt-4">
                {authService.hasAuthority("SYSTEM_SETTING_WRITE") && (
                  <button
                    type="submit"
                    disabled={invalid || saving}
                    className="btn btn-primary system-setting-form-button"
                  >
                    SALVAR
                  </button>
                )}
                <Link
                  to="/home"
                  className="btn btn-outline-danger system-setting-form-button d-inline-flex align-items-center justify-content-center"
                >
                  VOLTAR
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
