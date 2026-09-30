import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Pagination } from "../../../../../core/models/Pagination";
import { Employee } from "../../models/Employee";
import { EmployeeMapper } from "../../mappers/employee.mapper";
import { employeeService } from "../../services/employee.service";
import { Position } from "../../../positions/models/Position";
import { Department } from "../../../departments/models/Department";
import { PositionMapper } from "../../../positions/mappers/position.mapper";
import { DepartmentMapper } from "../../../departments/mappers/department.mapper";
import { positionService } from "../../../positions/services/position.service";
import { departmentService } from "../../../departments/services/department.service";
import "./EmployeeForm.css";

export function EmployeeForm() {
  const [employee, setEmployee] = useState(new Employee());
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File>();
  const [currentPhoto, setCurrentPhoto] = useState<Blob>();
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { employeeId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const loadPositions = async () => {
      try {
        setPositions(
          PositionMapper.toModelList(
            (
              await positionService.list(
                new Pagination(0, 1000, "ASC", "name"),
                "",
              )
            ).content,
          ),
        );
      } catch {
        notificationService.add({
          severity: "warn",
          detail: "Não foi possível carregar os cargos.",
        });
      }
    };
    const loadDepartments = async () => {
      try {
        setDepartments(
          DepartmentMapper.toModelList(
            (
              await departmentService.list(
                new Pagination(0, 1000, "ASC", "name"),
                "",
              )
            ).content,
          ),
        );
      } catch {
        notificationService.add({
          severity: "warn",
          detail: "Não foi possível carregar os departamentos.",
        });
      }
    };
    const loadEmployee = async () => {
      if (!employeeId) return;
      try {
        const data = await employeeService.findById(employeeId);
        setEmployee(EmployeeMapper.toModel(data));
        if (data.id != null)
          setCurrentPhoto(await employeeService.getEmployeePhoto(data.id));
      } catch {
        
      }
    };
    loadPositions();
    loadDepartments();
    loadEmployee();
  }, [employeeId]);
  useEffect(() => {
    const photo = selectedPhoto || currentPhoto;
    if (!photo?.size) {
      setPhotoUrl("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedPhoto, currentPhoto]);
  const touch = (field: string) => setTouched({ ...touched, [field]: true });
  const setField = (
    field:
      | "name"
      | "employeeCode"
      | "email"
      | "phone"
      | "address"
      | "employmentType"
      | "hireDate"
      | "terminationDate",
    value: string,
  ) => {
    setEmployee(new Employee({ ...employee, [field]: value }));
  };
  const invalid =
    employee.name.length < 3 ||
    employee.employeeCode.length < 3 ||
    !employee.employmentType ||
    employee.employmentType.length > 30 ||
    !employee.position ||
    !employee.department ||
    !employee.hireDate ||
    (!!employee.phone && employee.phone.length !== 11);
  const formatTelephone = (value: string) => {
    if (value.length <= 2) return value ? `(${value}` : "";
    if (value.length <= 7) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid || saving) return;
    if (
      employee.hireDate &&
      employee.terminationDate &&
      employee.terminationDate < employee.hireDate
    ) {
      notificationService.add({
        severity: "warn",
        detail:
          "A data de desligamento não pode ser menor que a data de admissão.",
      });
      return;
    }
    setSaving(true);
    try {
      let id = employee.id;
      if (id != null)
        await employeeService.update(EmployeeMapper.toUpdateDTO(employee));
      else {
        const data = await employeeService.insert(
          EmployeeMapper.toInsertDTO(employee),
        );
        id = data.id;
        setEmployee(EmployeeMapper.toModel(data));
      }
      if (id != null && selectedPhoto) {
        try {
          await employeeService.updatePhoto(id, selectedPhoto);
        } catch {
          notificationService.add({
            severity: "warn",
            detail: employeeId
              ? "Funcionário atualizado, mas falhou ao enviar a foto."
              : "Funcionário cadastrado, mas falhou ao enviar a foto.",
          });
          navigate("/employees/");
          return;
        }
      }
      notificationService.add({
        severity: "success",
        detail: employeeId
          ? "Funcionário atualizado com sucesso!"
          : "Funcionário cadastrado com sucesso!",
      });
      navigate("/employees/");
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="employee-form-screen">
      <div className="employee-form-container">
        <div className="employee-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados do Funcionário</h1>
            </div>
            <div className="employee-photo-header">
              <div className="employee-photo-area">
                <div className="employee-photo-frame">
                  {photoUrl ? (
                    <img
                      className="employee-photo"
                      src={photoUrl}
                      alt="Foto do funcionário"
                    />
                  ) : (
                    <div
                      className="employee-photo-placeholder"
                      aria-label="Sem foto"
                    >
                      <span className="employee-photo-icon">👤</span>
                    </div>
                  )}
                </div>
                <div className="employee-photo-meta">
                  <div className="employee-photo-title">
                    Foto do Funcionário
                  </div>
                  <div className="employee-photo-subtitle">
                    JPG, PNG ou WEBP • até 2MB
                  </div>
                  <div className="employee-photo-actions">
                    <label className="upload-btn" htmlFor="photo">
                      <span className="upload-btn-icon">⬆️</span>
                      <span>Selecionar foto</span>
                    </label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="upload-input"
                      onChange={(event) => {
                        setSelectedPhoto(event.target.files?.[0]);
                        if (!event.target.files?.length)
                          setCurrentPhoto(undefined);
                      }}
                    />
                    {selectedPhoto && (
                      <span className="file-chip">{selectedPhoto.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 employee-form-inputs">
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="name">
                  Nome *
                </label>
                <InputText
                  id="name"
                  name="name"
                  placeholder="Nome"
                  type="text"
                  className="form-control"
                  value={employee.name}
                  onChange={(e) => setField("name", e.target.value)}
                  onBlur={() => touch("name")}
                />
                <Message
                  visible={touched.name && !employee.name}
                  text="Informe o nome do funcionário"
                />
                <Message
                  visible={
                    touched.name && !!employee.name && employee.name.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${employee.name.length}`}
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="employeeCode">
                  Matrícula *
                </label>
                <InputText
                  id="employeeCode"
                  name="employeeCode"
                  placeholder="Matrícula"
                  type="text"
                  className="form-control"
                  value={employee.employeeCode}
                  onChange={(e) => setField("employeeCode", e.target.value)}
                  onBlur={() => touch("employeeCode")}
                />
                <Message
                  visible={touched.employeeCode && !employee.employeeCode}
                  text="Informe a matrícula do funcionário"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="email">
                  E-mail
                </label>
                <InputText
                  id="email"
                  name="email"
                  placeholder="E-mail"
                  type="email"
                  className="form-control"
                  value={employee.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onBlur={() => touch("email")}
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="phone">
                  Telefone
                </label>
                <InputText
                  id="phone"
                  name="phone"
                  placeholder="Telefone"
                  type="text"
                  className="form-control"
                  value={formatTelephone(employee.phone)}
                  onChange={(e) =>
                    setField(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 11),
                    )
                  }
                  onBlur={() => touch("phone")}
                />
              </div>
              <div className="col-12">
                <label className="form-label-custom" htmlFor="address">
                  Endereço
                </label>
                <InputText
                  id="address"
                  name="address"
                  placeholder="Endereço"
                  type="text"
                  className="form-control"
                  value={employee.address}
                  onChange={(e) => setField("address", e.target.value)}
                  onBlur={() => touch("address")}
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="salary">
                  Salário
                </label>
                <InputNumber
                  inputId="salary"
                  name="salary"
                  className="salary-input-host"
                  value={employee.salary}
                  onValueChange={(e) =>
                    setEmployee(
                      new Employee({ ...employee, salary: e.value ?? null }),
                    )
                  }
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  placeholder="Salário"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="employmentType">
                  Contratação *
                </label>
                <InputText
                  id="employmentType"
                  name="employmentType"
                  placeholder="Informe o tipo de contratação"
                  className="form-control"
                  maxLength={30}
                  value={employee.employmentType}
                  onChange={(e) => setField("employmentType", e.target.value)}
                  onBlur={() => touch("employmentType")}
                />
                <Message
                  visible={touched.employmentType && !employee.employmentType}
                  text="Informe o tipo de contratação"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="position">
                  Cargo *
                </label>
                <select
                  id="position"
                  name="position"
                  className="form-control form-select"
                  value={employee.position?.id ?? ""}
                  onChange={(e) =>
                    setEmployee(
                      new Employee({
                        ...employee,
                        position: positions.find(
                          (item) => item.id === Number(e.target.value),
                        ),
                      }),
                    )
                  }
                  onBlur={() => touch("position")}
                >
                  <option value="">Selecione um cargo</option>
                  {positions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <Message
                  visible={touched.position && !employee.position}
                  text="Informe o cargo do funcionário"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="department">
                  Departamento *
                </label>
                <select
                  id="department"
                  name="department"
                  className="form-control form-select"
                  value={employee.department?.id ?? ""}
                  onChange={(e) =>
                    setEmployee(
                      new Employee({
                        ...employee,
                        department: departments.find(
                          (item) => item.id === Number(e.target.value),
                        ),
                      }),
                    )
                  }
                  onBlur={() => touch("department")}
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <Message
                  visible={touched.department && !employee.department}
                  text="Informe o departamento do funcionário"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="hireDate">
                  Data de admissão *
                </label>
                <input
                  id="hireDate"
                  name="hireDate"
                  type="date"
                  className="form-control"
                  value={employee.hireDate || ""}
                  onChange={(e) => setField("hireDate", e.target.value)}
                  onBlur={() => touch("hireDate")}
                />
                <Message
                  visible={touched.hireDate && !employee.hireDate}
                  text="Informe a data de admissão"
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="terminationDate">
                  Data de desligamento
                </label>
                <input
                  id="terminationDate"
                  name="terminationDate"
                  type="date"
                  className="form-control"
                  value={employee.terminationDate || ""}
                  onChange={(e) => setField("terminationDate", e.target.value)}
                  onBlur={() => touch("terminationDate")}
                />
              </div>
            </div>
            <div className="employee-form-buttons mt-4">
              <button
                type="submit"
                className="btn btn-primary employee-form-button"
                disabled={invalid || saving}
              >
                SALVAR
              </button>
              <Link to="/employees/">
                <button
                  type="button"
                  className="btn btn-outline-danger employee-form-button"
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
