import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Department } from "../../models/Department";
import { DepartmentMapper } from "../../mappers/department.mapper";
import { departmentService } from "../../services/department.service";
import "./DepartmentForm.css";

export function DepartmentForm() {
  const [department, setDepartment] = useState(new Department());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { departmentId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const load = async () => {
      if (!departmentId) return;
      try {
        const data = await departmentService.findById(departmentId);
        setDepartment(DepartmentMapper.toModel(data));
      } catch {}
    };
    load();
  }, [departmentId]);
  const invalid =
    department.name.length < 3 || department.description.length < 3;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, description: true });
    if (invalid || saving) return;
    setSaving(true);
    try {
      if (department.id != null) {
        await departmentService.update(
          department.id,
          DepartmentMapper.toUpdateDTO(department),
        );
      } else {
        await departmentService.insert(
          DepartmentMapper.toInsertDTO(department),
        );
      }
      notificationService.add({
        severity: "success",
        detail: departmentId
          ? "Setor atualizado com sucesso!"
          : "Setor cadastrado com sucesso!",
      });
      navigate("/departments/");
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="department-form-screen">
      <div className="department-form-container">
        <div className="department-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados do Setor</h1>
            </div>
            <div className="row g-3 department-form-inputs">
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="name">
                  Nome do Setor
                </label>
                <InputText
                  id="name"
                  name="name"
                  placeholder="Nome do Setor"
                  className="form-control"
                  value={department.name}
                  onChange={(e) =>
                    setDepartment(
                      new Department({ ...department, name: e.target.value }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, name: true })}
                />
                <Message
                  visible={touched.name && !department.name}
                  text="Informe o nome do setor"
                />
                <Message
                  visible={
                    touched.name &&
                    !!department.name &&
                    department.name.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${department.name.length}`}
                />
              </div>
              <div className="col-12">
                <label className="form-label-custom" htmlFor="description">
                  Descrição
                </label>
                <InputTextarea
                  id="description"
                  name="description"
                  placeholder="Descrição do Setor"
                  rows={6}
                  className="form-control textarea-description"
                  value={department.description}
                  onChange={(e) =>
                    setDepartment(
                      new Department({
                        ...department,
                        description: e.target.value,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, description: true })}
                />
                <Message
                  visible={touched.description && !department.description}
                  text="Informe a descrição do setor"
                />
                <Message
                  visible={
                    touched.description &&
                    !!department.description &&
                    department.description.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${department.description.length}`}
                />
              </div>
            </div>
            <div className="department-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving}
                className="btn btn-primary department-form-button"
              >
                SALVAR
              </button>
              <Link to="/departments/">
                <button
                  type="button"
                  className="btn btn-outline-danger department-form-button"
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
