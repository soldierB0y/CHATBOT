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
  hasDebtColumn,
  filterZeroDebt,
  setFilterZeroDebt,
  showDebtSuggestion,
  setShowDebtSuggestion,
  onOpenDebtCalculator,
}) => {
  const [inputNameValue, setInputNameValue] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
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
      setInputNameValue("");
      setComboboxOpen(false);
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
      {showDebtSuggestion && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "13px",
          }}
        >
          <span style={{ fontSize: "18px" }}>💡</span>
          <span style={{ flex: 1, color: "#1e40af" }}>
            Se detect&oacute; la tabla <strong>ventas</strong>.
            Config&uacute;rala para calcular la deuda real de cada cliente y
            usar el filtro de saldo pendiente.
          </span>
          <button
            onClick={() => {
              setShowDebtSuggestion(false);
              if (onOpenDebtCalculator) onOpenDebtCalculator();
            }}
            style={{
              padding: "6px 14px",
              cursor: "pointer",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            Configurar ahora
          </button>
          <button
            onClick={() => setShowDebtSuggestion(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "#6b7280",
              padding: "0 4px",
            }}
          >
            &#10005;
          </button>
        </div>
      )}

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
          <div
            style={{
              position: "relative",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
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
            <div style={{ position: "relative", flex: 1 }}>
              <input
                value={inputNameValue}
                onChange={(e) => {
                  setInputNameValue(e.target.value);
                  setComboboxOpen(true);
                }}
                onFocus={() => inputNameValue && setComboboxOpen(true)}
                onBlur={() => setTimeout(() => setComboboxOpen(false), 200)}
                placeholder={
                  "Buscar por " + (FIELD_LABELS[searchField] || searchField)
                }
                style={{
                  height: "30px",
                  paddingLeft: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              {comboboxOpen &&
                inputNameValue &&
                filteredCustomers.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      maxHeight: "180px",
                      overflowY: "auto",
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      zIndex: 50,
                    }}
                  >
                    {filteredCustomers.map((c, i) => (
                      <div
                        key={i}
                        onMouseDown={() => addException(c)}
                        style={{
                          cursor: "pointer",
                          padding: "6px 10px",
                          fontSize: "13px",
                          borderBottom:
                            i < filteredCustomers.length - 1
                              ? "1px solid #f3f4f6"
                              : "none",
                          background: "#fff",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f3f4f6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#fff")
                        }
                      >
                        {searchColumns.map((col) => (
                          <span key={col} style={{ marginRight: "12px" }}>
                            <strong>{FIELD_LABELS[col] || col}:</strong>{" "}
                            {c[col] != null ? String(c[col]) : "-"}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </>
      )}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          cursor: hasDebtColumn ? "pointer" : "not-allowed",
          fontWeight: 500,
          opacity: hasDebtColumn ? 1 : 0.5,
        }}
      >
        <input
          type="checkbox"
          checked={filterZeroDebt}
          onChange={(e) => hasDebtColumn && setFilterZeroDebt(e.target.checked)}
          disabled={!hasDebtColumn}
          style={{
            width: "16px",
            height: "16px",
            cursor: hasDebtColumn ? "pointer" : "not-allowed",
          }}
        />
        {hasDebtColumn
          ? "Solo clientes con deuda pendiente (deuda &gt; 0)"
          : "Configura el c\u00e1lculo desde la tabla de ventas para filtrar por deuda pendiente"}
      </label>

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
            <option value=">">{"> mayor que"}</option>
            <option value="<">{"< menor que"}</option>
            <option value=">=">{">= mayor o igual que"}</option>
            <option value="<=">{"<= menor o igual que"}</option>
            <option value="==">{"== es igual a"}</option>
            <option value="!=">{"!= es diferente de"}</option>
            <option value="contains">contiene</option>
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
