import { FormEvent, useEffect, useState } from "react";
import { InputNumber } from "primereact/inputnumber";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Message } from "../../../../../shared/components/message/Message";
import { FinancialSetting } from "../../models/FinancialSetting";
import { FinancialSettingMapper } from "../../mappers/financial-setting.mapper";
import { financialSettingService } from "../../services/financial-setting.service";
import "./FinancialSettingForm.css";

export function FinancialSettingForm() {
  const [financialSetting, setFinancialSetting] = useState(
    new FinancialSetting(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const canWrite = authService.hasAuthority("FINANCIAL_SETTINGS_WRITE");
  useEffect(() => {
    const load = async () => {
      try {
        const data = await financialSettingService.findCurrent();
        setFinancialSetting(FinancialSettingMapper.toModel(data));
      } catch {
        /* O interceptor exibe o erro. */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const invalid =
    financialSetting.defaultLateFeePercent == null ||
    financialSetting.defaultLateInterestPercent == null ||
    Number(financialSetting.defaultLateFeePercent) < 0 ||
    Number(financialSetting.defaultLateInterestPercent) < 0;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({
      defaultLateFeePercent: true,
      defaultLateInterestPercent: true,
    });
    if (invalid || saving || loading || !canWrite) return;
    setSaving(true);
    try {
      const dto = FinancialSettingMapper.toUpdateDTO(financialSetting);
      const data = await financialSettingService.update(dto);
      setFinancialSetting(FinancialSettingMapper.toModel(data));
      notificationService.add({
        severity: "success",
        detail: "Configurações financeiras atualizadas com sucesso!",
      });
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="financial-setting-form-screen">
      <div className="financial-setting-form-container">
        <div className="financial-setting-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Configurações Financeiras</h1>
            </div>
            {loading && (
              <div className="financial-setting-loading" aria-live="polite">
                Carregando configurações...
              </div>
            )}
            {!loading && (
              <div className="row g-3 financial-setting-form-inputs">
                <div className="col-12 col-lg-6">
                  <label
                    className="form-label-custom"
                    htmlFor="defaultLateFeePercent"
                  >
                    Multa por atraso *
                  </label>
                  <InputNumber
                    inputId="defaultLateFeePercent"
                    name="defaultLateFeePercent"
                    className="percent-input-host"
                    inputClassName="form-control"
                    placeholder="Multa por atraso"
                    suffix="%"
                    locale="pt-BR"
                    min={0}
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    required
                    value={financialSetting.defaultLateFeePercent}
                    onValueChange={(event) =>
                      setFinancialSetting(
                        new FinancialSetting({
                          ...financialSetting,
                          defaultLateFeePercent: event.value ?? null,
                        }),
                      )
                    }
                    onBlur={() =>
                      setTouched({ ...touched, defaultLateFeePercent: true })
                    }
                  />
                  <Message
                    visible={
                      touched.defaultLateFeePercent &&
                      financialSetting.defaultLateFeePercent == null
                    }
                    text="Informe o percentual padrão de multa por atraso"
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <label
                    className="form-label-custom"
                    htmlFor="defaultLateInterestPercent"
                  >
                    Juros por atraso *
                  </label>
                  <InputNumber
                    inputId="defaultLateInterestPercent"
                    name="defaultLateInterestPercent"
                    className="percent-input-host"
                    inputClassName="form-control"
                    placeholder="Juros por atraso"
                    suffix="%"
                    locale="pt-BR"
                    min={0}
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    required
                    value={financialSetting.defaultLateInterestPercent}
                    onValueChange={(event) =>
                      setFinancialSetting(
                        new FinancialSetting({
                          ...financialSetting,
                          defaultLateInterestPercent: event.value ?? null,
                        }),
                      )
                    }
                    onBlur={() =>
                      setTouched({
                        ...touched,
                        defaultLateInterestPercent: true,
                      })
                    }
                  />
                  <Message
                    visible={
                      touched.defaultLateInterestPercent &&
                      financialSetting.defaultLateInterestPercent == null
                    }
                    text="Informe o percentual padrão de juros por atraso"
                  />
                </div>
              </div>
            )}
            {!loading && canWrite && (
              <div className="financial-setting-form-buttons mt-4">
                <button
                  type="submit"
                  disabled={invalid || saving}
                  className="btn btn-primary financial-setting-form-button"
                >
                  SALVAR
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
