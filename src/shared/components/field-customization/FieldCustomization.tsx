import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { CustomizableField } from "../../models/customizable-field";
import "./FieldCustomization.css";

interface FieldCustomizationProps {
  visible: boolean;
  selectedFields: string[];
  fields: CustomizableField[];
  contentName: string;
  onHide: () => void;
  onApply: (fields: string[]) => void;
}

export function FieldCustomization(props: FieldCustomizationProps) {
  const [fieldsToApply, setFieldsToApply] = useState<string[]>([]);

  useEffect(() => {
    if (props.visible) setFieldsToApply([...props.selectedFields]);
  }, [props.visible, props.selectedFields]);

  const changeField = (field: string, checked: boolean) => {
    let updated = [...fieldsToApply];
    if (checked && !updated.includes(field)) updated.push(field);
    if (!checked) {
      if (updated.length === 1) return;
      updated = updated.filter((selectedField) => selectedField !== field);
    }
    setFieldsToApply(updated);
    props.onApply(updated);
  };

  return (
    <Dialog
      header="Personalizar campos"
      visible={props.visible}
      modal
      draggable={false}
      resizable={false}
      style={{ width: "600px", maxWidth: "95vw" }}
      onHide={props.onHide}
    >
      <p className="modal-description">
        Selecione os campos que devem aparecer em {props.contentName}.
      </p>
      <div className="fields-list">
        {props.fields.map((field) => (
          <label className="field-option" key={field.field}>
            <input
              type="checkbox"
              checked={fieldsToApply.includes(field.field)}
              onChange={(event) =>
                changeField(field.field, event.target.checked)
              }
            />
            <span>{field.label}</span>
          </label>
        ))}
      </div>
      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={props.onHide}
        >
          FECHAR
        </button>
      </div>
    </Dialog>
  );
}
