import { FormEvent, useState } from "react";
import { InputText } from "primereact/inputtext";
import "./NameFilter.css";

interface NameFilterProps {
  text: string;
  onSearch: (name: string) => void;
}

export function NameFilter({ text, onSearch }: NameFilterProps) {
  const [nameFilter, setNameFilter] = useState("");

  const searchName = (event: FormEvent) => {
    event.preventDefault();
    onSearch(nameFilter);
  };

  const formClear = () => {
    setNameFilter("");
    onSearch("");
  };

  return (
    <div className="filter-container">
      <form className="filter-form" onSubmit={searchName}>
        <div className="filter-name-container">
          <InputText
            type="text"
            className="form-control"
            placeholder={text}
            name="name"
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
          />
          <button type="submit" className="filter-search-icon">
            <img src="/assets/images/search-icon.svg" alt="filtro" />
          </button>
        </div>
        <div className="filter-bottom-container">
          <button
            type="button"
            className="btn btn-outline-secondary btn-filter-clear"
            onClick={formClear}
          >
            LIMPAR<span className="btn-filter-word"> FILTRO</span>
          </button>
        </div>
      </form>
    </div>
  );
}
