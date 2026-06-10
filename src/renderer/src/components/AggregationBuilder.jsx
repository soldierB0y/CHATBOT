import { useState, useEffect, useCallback } from "react";

const AGG_FUNCTIONS = ["SUM", "COUNT", "AVG", "MIN", "MAX"];
const OPERATORS = ["+", "-", "*", "/"];
const JOIN_TYPES = ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN"];

const cardStyle = {
  width: "93vw",
  paddingLeft: "30px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const labelStyle = { fontWeight: "bold", fontSize: "13px" };

const inputStyle = {
  height: "32px",
  padding: "6px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  fontSize: "13px",
};

const selectStyle = {
  height: "32px",
  padding: "6px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  fontSize: "13px",
};

const btnStyle = (bg = "#3b82f6", disabled = false) => ({
  padding: "8px 20px",
  cursor: disabled ? "not-allowed" : "pointer",
  background: disabled ? "#9ca3af" : bg,
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: 600,
  fontSize: "13px",
});

const smallBtn = (bg = "#6b7280") => ({
  padding: "4px 10px",
  cursor: "pointer",
  background: bg,
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontWeight: 600,
  fontSize: "11px",
  whiteSpace: "nowrap",
});

export const AggregationBuilder = ({
  sourceType,
  dbTable,
  tables,
  secondaryTable,
  setSecondaryTable,
  primaryKey,
  setPrimaryKey,
  foreignKey,
  setForeignKey,
  joinType,
  setJoinType,
  aggregations,
  setAggregations,
  havingExpr,
  setHavingExpr,
  showAggregationBuilder,
  setShowAggregationBuilder,
  primaryColumns,
  secondaryColumns,
  fetchPrimaryColumns,
  fetchSecondaryColumns,
  loadJoinedData,
  resetJoinConfig,
  isLoading,
  aggregationAliases,
}) => {
  const [loadingCols, setLoadingCols] = useState(false);

  useEffect(() => {
    if (showAggregationBuilder && dbTable && primaryColumns.length === 0) {
      fetchPrimaryColumns();
    }
  }, [
    showAggregationBuilder,
    dbTable,
    fetchPrimaryColumns,
    primaryColumns.length,
  ]);

  const handleSecondaryTableChange = useCallback(
    async (table) => {
      setSecondaryTable(table);
      setForeignKey("");
      if (table) {
        setLoadingCols(true);
        await fetchSecondaryColumns(table);
        setLoadingCols(false);
      }
    },
    [setSecondaryTable, setForeignKey, fetchSecondaryColumns],
  );

  const addAggregation = () => {
    setAggregations((prev) => [
      ...prev,
      { alias: "", terms: [{ fn: "SUM", field: "", coalesce: false }] },
    ]);
  };

  const removeAggregation = (idx) => {
    setAggregations((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAggregationAlias = (idx, alias) => {
    setAggregations((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], alias };
      return next;
    });
  };

  const addTerm = (aggIdx) => {
    setAggregations((prev) => {
      const next = [...prev];
      next[aggIdx] = {
        ...next[aggIdx],
        terms: [
          ...next[aggIdx].terms,
          { operator: "+", fn: "SUM", field: "", coalesce: false },
        ],
      };
      return next;
    });
  };

  const removeTerm = (aggIdx, termIdx) => {
    setAggregations((prev) => {
      const next = [...prev];
      next[aggIdx] = {
        ...next[aggIdx],
        terms: next[aggIdx].terms.filter((_, i) => i !== termIdx),
      };
      return next;
    });
  };

  const updateTerm = (aggIdx, termIdx, updates) => {
    setAggregations((prev) => {
      const next = [...prev];
      const terms = [...next[aggIdx].terms];
      terms[termIdx] = { ...terms[termIdx], ...updates };
      next[aggIdx] = { ...next[aggIdx], terms };
      return next;
    });
  };

  const hasSecondaryConfig =
    secondaryTable &&
    primaryKey &&
    foreignKey &&
    aggregations.some((a) => a.alias && a.terms.some((t) => t.field));

  if (sourceType !== "db") return null;

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setShowAggregationBuilder(!showAggregationBuilder)}
      >
        <span
          style={{
            fontSize: "16px",
            transition: "transform 0.2s",
            display: "inline-block",
            transform: showAggregationBuilder ? "rotate(90deg)" : "none",
          }}
        >
          ▶
        </span>
        <h4 style={{ margin: 0 }}>Configuración avanzada: Tabla secundaria</h4>
      </div>

      {showAggregationBuilder && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "14px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={labelStyle}>Tabla secundaria</label>
              <select
                value={secondaryTable}
                onChange={(e) => handleSecondaryTableChange(e.target.value)}
                style={selectStyle}
              >
                <option value="">Seleccionar...</option>
                {tables
                  .filter((t) => t !== dbTable)
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={labelStyle}>
                Columna PK ({dbTable || "primaria"})
              </label>
              <select
                value={primaryKey}
                onChange={(e) => setPrimaryKey(e.target.value)}
                style={selectStyle}
              >
                <option value="">Seleccionar...</option>
                {primaryColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={labelStyle}>
                Columna FK ({secondaryTable || "secundaria"})
              </label>
              <select
                value={foreignKey}
                onChange={(e) => setForeignKey(e.target.value)}
                style={selectStyle}
                disabled={!secondaryTable}
              >
                <option value="">Seleccionar...</option>
                {secondaryColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              {loadingCols && (
                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                  Cargando columnas...
                </span>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={labelStyle}>Tipo JOIN</label>
              <select
                value={joinType}
                onChange={(e) => setJoinType(e.target.value)}
                style={selectStyle}
              >
                {JOIN_TYPES.map((jt) => (
                  <option key={jt} value={jt}>
                    {jt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label style={labelStyle}>Variables de agregación</label>
              <button onClick={addAggregation} style={smallBtn("#3b82f6")}>
                + Agregar variable
              </button>
            </div>

            {aggregations.map((agg, aggIdx) => (
              <div
                key={aggIdx}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "10px",
                  marginBottom: "8px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <label style={{ ...labelStyle, whiteSpace: "nowrap" }}>
                    Variable #{aggIdx + 1}
                  </label>
                  <input
                    value={agg.alias}
                    onChange={(e) =>
                      updateAggregationAlias(aggIdx, e.target.value)
                    }
                    placeholder="Alias (ej: debt)"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {aggregations.length > 1 && (
                    <button
                      onClick={() => removeAggregation(aggIdx)}
                      style={smallBtn("#dc2626")}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {agg.terms.map((term, termIdx) => (
                  <div
                    key={termIdx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {termIdx > 0 && (
                      <select
                        value={term.operator || "+"}
                        onChange={(e) =>
                          updateTerm(aggIdx, termIdx, {
                            operator: e.target.value,
                          })
                        }
                        style={{ ...selectStyle, width: "60px" }}
                      >
                        {OPERATORS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                    )}

                    <select
                      value={term.fn || "SUM"}
                      onChange={(e) =>
                        updateTerm(aggIdx, termIdx, { fn: e.target.value })
                      }
                      style={{ ...selectStyle, width: "90px" }}
                    >
                      {AGG_FUNCTIONS.map((fn) => (
                        <option key={fn} value={fn}>
                          {fn}
                        </option>
                      ))}
                    </select>

                    <select
                      value={term.field || ""}
                      onChange={(e) =>
                        updateTerm(aggIdx, termIdx, { field: e.target.value })
                      }
                      style={{ ...selectStyle, flex: 1, minWidth: "120px" }}
                    >
                      <option value="">Campo...</option>
                      {secondaryColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>

                    <label style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      <input
                        type="checkbox"
                        checked={term.coalesce || false}
                        onChange={(e) =>
                          updateTerm(aggIdx, termIdx, {
                            coalesce: e.target.checked,
                          })
                        }
                        style={{ marginRight: "3px" }}
                      />
                      COALESCE
                    </label>

                    {agg.terms.length > 1 && (
                      <button
                        onClick={() => removeTerm(aggIdx, termIdx)}
                        style={smallBtn("#9ca3af")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => addTerm(aggIdx)}
                  style={{ ...smallBtn("#6b7280"), marginTop: "4px" }}
                >
                  + Término
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={labelStyle}>
              Filtro HAVING{" "}
              <span style={{ fontWeight: 400, color: "#6b7280" }}>
                (opcional, ej: debt &gt; 0)
              </span>
            </label>
            <input
              value={havingExpr}
              onChange={(e) => setHavingExpr(e.target.value)}
              placeholder="debt > 0"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={loadJoinedData}
              disabled={!hasSecondaryConfig || isLoading}
              style={btnStyle("#22c55e", !hasSecondaryConfig || isLoading)}
            >
              {isLoading
                ? "Cargando..."
                : "Aplicar y cargar datos relacionados"}
            </button>
            <button onClick={resetJoinConfig} style={btnStyle("#6b7280")}>
              Limpiar configuración
            </button>
          </div>

          {aggregationAliases.length > 0 && (
            <div
              style={{
                fontSize: "12px",
                color: "#0369a1",
                background: "#e0f2fe",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              Variables disponibles en el mensaje:{" "}
              {aggregationAliases.map((a) => `{${a}}`).join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
