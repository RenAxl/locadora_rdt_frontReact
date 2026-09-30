import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Position } from "../../models/Position";
import { PositionMapper } from "../../mappers/position.mapper";
import { positionService } from "../../services/position.service";
import "./PositionForm.css";

export function PositionForm() {
  const [position, setPosition] = useState(new Position());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { positionId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const load = async () => {
      if (!positionId) return;
      try {
        const data = await positionService.findById(positionId);
        setPosition(PositionMapper.toModel(data));
      } catch {}
    };
    load();
  }, [positionId]);
  const invalid = position.name.length < 3;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, description: true });
    if (invalid || saving) return;
    setSaving(true);
    try {
      if (position.id != null) {
        await positionService.update(PositionMapper.toUpdateDTO(position));
      } else {
        await positionService.insert(PositionMapper.toInsertDTO(position));
      }
      notificationService.add({
        severity: "success",
        detail: positionId
          ? "Cargo atualizado com sucesso!"
          : "Cargo cadastrado com sucesso!",
      });
      navigate("/positions/");
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="position-form-screen">
      <div className="position-form-container">
        <div className="position-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados do Cargo</h1>
            </div>
            <div className="row g-3 position-form-inputs">
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="name">
                  Nome do Cargo *
                </label>
                <InputText
                  id="name"
                  name="name"
                  placeholder="Nome do Cargo"
                  className="form-control"
                  value={position.name}
                  onChange={(e) =>
                    setPosition(
                      new Position({ ...position, name: e.target.value }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, name: true })}
                />
                <Message
                  visible={touched.name && !position.name}
                  text="Informe o nome do cargo"
                />
                <Message
                  visible={
                    touched.name && !!position.name && position.name.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${position.name.length}`}
                />
              </div>
            </div>
            <div className="position-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving}
                className="btn btn-primary position-form-button"
              >
                SALVAR
              </button>
              <Link to="/positions/">
                <button
                  type="button"
                  className="btn btn-outline-danger position-form-button"
                >
                  CANCELAR
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
