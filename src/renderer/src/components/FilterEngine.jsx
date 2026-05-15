import { useState, useMemo, useEffect } from "react";

const FIELD_LABELS = {
  Codigo: "Codigo",
  Nombre_Representante: "Nombre",
  Nombre_Cliente: "Nombre",
  Telefono: "Telefono",
  telefono: "Telefono",
  name: "Nombre",
  telephone: "Telefono",
  remainingDebt: "Saldo pendiente",
  remainingdebt: "Saldo pendiente",
};

const buttonStyle = (isPrimary = true, isDisabled = false) => ({
  padding: "10px 30px",
  cursor: isDisabled ? "not-allowed" : "pointer",
  background: isDisabled ? "#9ca3af" : isPrimary ? "#3b82f6" : "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: 600,
  fontSize: "14px",
});

const smallButtonStyle = (isDanger = false) => ({
  padding: "6px 16px",
  cursor: "pointer",
  background: isDanger ? "#ef4444" : "#e5e7eb",
  color: isDanger ? "white" : "black",
  border: "none",
  borderRadius: "6px",
  fontWeight: 600,
  fontSize: "13px",
});

export const FilterEngine = ({
  sourceType,
  allCustomers,
  excCustomers,
  setExcCustomers,
  updateExceptions,
  columns,
  customFilters,
  setCustomFilters,
  saveCustomFilters,
  addFeedback,
}) => {
  const [inputNameValue, setInputNameValue] = useState("");
  const [updateResult, setUpdateResult] = useState("");
  const [searchField, setSearchField] = useState("");
  const [savedFiltersMsg, setSavedFiltersMsg] = useState("");

  const customerColumns = useMemo(() => {
    if (allCustomers.length === 0) return [];
    return Object.keys(allCustomers[0]);
  }, [allCustomers]);

  useEffect(() => {
    if (columns.length > 0 && !searchField) {
      setSearchField(columns[0]);
    } else if (customerColumns.length > 0 && !searchField) {
      setSearchField(customerColumns[0]);
    }
  }, [columns, customerColumns, searchField]);

  const filteredCustomers = useMemo(() => {
    if (!inputNameValue || customerColumns.length === 0) return [];
    return allCustomers.filter((c) => {
      const val = c[searchField];
      if (val == null) return false;
      return String(val).toLowerCase().includes(inputNameValue.toLowerCase());
    });
  }, [allCustomers, inputNameValue, searchField, customerColumns]);

  const searchColumns = customerColumns.length > 0 ? customerColumns : columns;

  const addException = (customer) => {
    if (!excCustomers.find((ec) => ec.Codigo === customer.Codigo)) {
      setExcCustomers([...excCustomers, customer]);
      if (addFeedback) addFeedback("Agregado a excepciones", "info");
    }
  };

  const removeException = (customer) => {
    setExcCustomers(excCustomers.filter((ec) => ec.Codigo !== customer.Codigo));
  };

  const saveExceptions = async () => {
    const ids = excCustomers.map((ec) => ec.Codigo);
    const ok = await updateExceptions(ids);
    setUpdateResult(ok ? "Actualizado exitosamente" : "Error al actualizar");
    setTimeout(() => setUpdateResult(""), 3000);
    if (addFeedback)
      addFeedback(
        ok ? "Excepciones actualizadas" : "Error al actualizar excepciones",
        ok ? "success" : "error",
      );
  };

  const addCustomFilter = () => {
    setCustomFilters([
      ...customFilters,
      { column: columns[0] || "", operator: ">", value: "" },
    ]);
  };

  const updateFilter = (idx, field, val) => {
    const updated = [...customFilters];
    updated[idx] = { ...updated[idx], [field]: val };
    setCustomFilters(updated);
  };

  const removeFilter = (idx) => {
    setCustomFilters(customFilters.filter((_, i) => i !== idx));
  };

  const handleSaveCustomFilters = () => {
    if (saveCustomFilters) {
      const ok = saveCustomFilters();
      if (ok) {
        setSavedFiltersMsg("Filtros guardados correctamente");
        if (addFeedback) addFeedback("Filtros guardados", "success");
      } else {
        setSavedFiltersMsg("Error al guardar filtros");
        if (addFeedback) addFeedback("Error al guardar filtros", "error");
      }
      setTimeout(() => setSavedFiltersMsg(""), 3000);
    }
  };

  const hasData = columns.length > 0;
  const hasExcData = searchColumns.length > 0;

  return (
    <div
      style={{
        width: "93vw",
        paddingLeft: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {sourceType === "db" && hasData && hasExcData && (
        <>
          <h4>NO enviar a (Excepciones)</h4>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              minHeight: "30px",
            }}
          >
            {excCustomers.map((c, i) => (
              <span
                key={i}
                onClick={() => removeException(c)}
                style={{
                  background: "#c9c9c9",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {c.Nombre_Representante ||
                  c.Nombre_Cliente ||
                  c.name ||
                  c.Codigo}{" "}
                &#10005;
              </span>
            ))}
          </div>
          {excCustomers.length === 0 && (
            <p style={{ userSelect: "none" }}>
              No hay clientes en la lista de excepci&oacute;n
            </p>
          )}
          <button onClick={saveExceptions} style={buttonStyle(false)}>
            Guardar Excepciones
          </button>
          {updateResult && <span>{updateResult}</span>}

          <h4>Agregar a la lista de excepci&oacute;n</h4>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              style={{ height: "32px", padding: "4px" }}
            >
              {searchColumns.map((col) => (
                <option key={col} value={col}>
                  {FIELD_LABELS[col] || col}
                </option>
              ))}
            </select>
            <input
              value={inputNameValue}
              onChange={(e) => setInputNameValue(e.target.value)}
              placeholder={
                "Buscar por " + (FIELD_LABELS[searchField] || searchField)
              }
              style={{
                height: "30px",
                paddingLeft: "10px",
                flex: 1,
              }}
            />
          </div>
          <div
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              width: "90vw",
              alignSelf: "flex-start",
            }}
          >
            {filteredCustomers.map((c, i) => (
              <div
                key={i}
                onClick={() => addException(c)}
                style={{
                  cursor: "pointer",
                  padding: "3px 5px",
                  userSelect: "none",
                }}
              >
                {searchColumns.map((col) => (
                  <span
                    key={col}
                    style={{ marginRight: "12px", fontSize: "13px" }}
                  >
                    <strong>{FIELD_LABELS[col] || col}:</strong>{" "}
                    {c[col] != null ? String(c[col]) : "-"}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      <h4>Filtros personalizados</h4>
      {customFilters.map((f, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={f.column}
            onChange={(e) => updateFilter(i, "column", e.target.value)}
            style={{ height: "32px", padding: "4px" }}
          >
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={f.operator}
            onChange={(e) => updateFilter(i, "operator", e.target.value)}
            style={{ height: "32px", padding: "4px" }}
          >
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;=</option>
            <option value="==">==</option>
            <option value="!=">!=</option>
          </select>
          <input
            value={f.value}
            onChange={(e) => updateFilter(i, "value", e.target.value)}
            placeholder="Valor"
            style={{ height: "30px", padding: "4px", width: "120px" }}
          />
          <button
            onClick={() => removeFilter(i)}
            style={smallButtonStyle(true)}
          >
            &#10005;
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button onClick={addCustomFilter} style={buttonStyle(true)}>
          + Agregar filtro
        </button>
        <button onClick={handleSaveCustomFilters} style={buttonStyle(false)}>
          Guardar Filtros
        </button>
      </div>
      {savedFiltersMsg && (
        <span style={{ color: "#22c55e", fontWeight: 600 }}>
          {savedFiltersMsg}
        </span>
      )}
    </div>
  );
};
