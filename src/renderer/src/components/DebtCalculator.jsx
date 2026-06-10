import { useState, useEffect, useCallback, useRef } from "react";

const cardStyle = {
  width: "93vw",
  paddingLeft: "30px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const labelStyle = { fontWeight: "bold", fontSize: "13px" };

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

export const DebtCalculator = ({
  sourceType,
  dbTable,
  tables,
  secondaryTable,
  setSecondaryTable,
  foreignKey,
  setForeignKey,
  totalColumn,
  setTotalColumn,
  abonoColumn,
  setAbonoColumn,
  filterZeroDebt,
  setFilterZeroDebt,
  fetchTableColumns,
  loadDebtData,
  resetJoinConfig,
  addFeedback,
  isLoading,
  hasDebtData,
  autoExpand,
  onAutoExpanded,
}) => {
  const [secondaryCols, setSecondaryCols] = useState([]);
  const [loadingCols, setLoadingCols] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadColumns = useCallback(
    async (table) => {
      if (!table) return;
      setLoadingCols(true);
      const cols = await fetchTableColumns(table);
      setSecondaryCols(cols);
      setLoadingCols(false);
    },
    [fetchTableColumns],
  );

  useEffect(() => {
    if (expanded && secondaryTable && secondaryCols.length === 0) {
      loadColumns(secondaryTable);
    }
  }, [expanded, secondaryTable, loadColumns, secondaryCols.length]);

  const handledAutoExpand = useRef(false);
  useEffect(() => {
    if (autoExpand && !handledAutoExpand.current) {
      handledAutoExpand.current = true;
      setExpanded(true);
      if (sourceType === "db" && !secondaryTable) {
        const salesTable = tables.find(
          (t) =>
            t !== dbTable &&
            (t.toLowerCase().includes("vent") ||
              t.toLowerCase().includes("factur")),
        );
        if (salesTable) {
          setSecondaryTable(salesTable);
          setForeignKey("");
          setTotalColumn("");
          setAbonoColumn("");
          setSecondaryCols([]);
          loadColumns(salesTable);
        }
      }
      if (onAutoExpanded) onAutoExpanded();
    }
    if (!autoExpand) handledAutoExpand.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExpand]);

  const handleSecondaryTableChange = async (table) => {
    setSecondaryTable(table);
    setForeignKey("");
    setTotalColumn("");
    setAbonoColumn("");
    setSecondaryCols([]);
    if (table) {
      setLoadingCols(true);
      const cols = await fetchTableColumns(table);
      setSecondaryCols(cols);
      setLoadingCols(false);
    }
  };

  const handleApply = () => {
    if (!secondaryTable) {
      if (addFeedback) addFeedback("Seleccione una tabla de ventas", "warning");
      return;
    }
    if (!foreignKey) {
      if (addFeedback)
        addFeedback(
          "Seleccione la columna que identifica al cliente",
          "warning",
        );
      return;
    }
    if (!totalColumn) {
      if (addFeedback)
        addFeedback("Seleccione la columna del total de factura", "warning");
      return;
    }
    loadDebtData();
  };

  const handleReset = () => {
    resetJoinConfig();
    setSecondaryCols([]);
  };

  if (sourceType !== "db") return null;

  const hasConfig = secondaryTable && foreignKey && totalColumn;

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
        onClick={() => setExpanded(!expanded)}
      >
        <span
          style={{
            fontSize: "16px",
            transition: "transform 0.2s",
            display: "inline-block",
            transform: expanded ? "rotate(90deg)" : "none",
          }}
        >
          ▶
        </span>
        <h4 style={{ margin: 0 }}>Calcular deuda desde otra tabla</h4>
        {hasDebtData && (
          <span
            style={{
              fontSize: "11px",
              color: "#15803d",
              background: "#dcfce7",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            Deuda calculada
          </span>
        )}
      </div>

      {expanded && (
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
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
            Configura c&oacute;mo calcular la deuda de cada cliente desde una
            tabla de ventas o facturas.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={labelStyle}>Tabla de ventas / facturas</label>
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
                Columna que identifica al cliente
              </label>
              <select
                value={foreignKey}
                onChange={(e) => setForeignKey(e.target.value)}
                style={selectStyle}
                disabled={!secondaryTable}
              >
                <option value="">Seleccionar...</option>
                {secondaryCols.map((col) => (
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
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={labelStyle}>
                Columna del total de factura{" "}
                <span style={{ fontWeight: 400, color: "#6b7280" }}>
                  (total venta)
                </span>
              </label>
              <select
                value={totalColumn}
                onChange={(e) => setTotalColumn(e.target.value)}
                style={selectStyle}
                disabled={!secondaryTable}
              >
                <option value="">Seleccionar...</option>
                {secondaryCols.map((col) => (
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
                Columna de abono / pago{" "}
                <span style={{ fontWeight: 400, color: "#6b7280" }}>
                  (opcional)
                </span>
              </label>
              <select
                value={abonoColumn}
                onChange={(e) => setAbonoColumn(e.target.value)}
                style={selectStyle}
                disabled={!secondaryTable}
              >
                <option value="">No usar (sin abonos)</option>
                {secondaryCols.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={filterZeroDebt}
              onChange={(e) => setFilterZeroDebt(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            Solo clientes con deuda pendiente (saldo &gt; 0)
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleApply}
              disabled={!hasConfig || isLoading}
              style={btnStyle("#22c55e", !hasConfig || isLoading)}
            >
              {isLoading ? "Calculando..." : "Aplicar y cargar deuda"}
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              style={btnStyle("#6b7280", isLoading)}
            >
              Limpiar configuraci&oacute;n
            </button>
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#0369a1",
              background: "#e0f2fe",
              padding: "8px 12px",
              borderRadius: "6px",
              lineHeight: 1.4,
            }}
          >
            La deuda se calcular&aacute; como:{" "}
            <strong>
              SUM({totalColumn || "total"})
              {abonoColumn ? ` - SUM(${abonoColumn})` : ""}
            </strong>{" "}
            agrupado por cliente. El resultado estar&aacute; disponible como{" "}
            <code
              style={{
                background: "#bae6fd",
                padding: "1px 4px",
                borderRadius: "3px",
              }}
            >
              {"{deuda}"}
            </code>{" "}
            en el mensaje.
          </div>
        </div>
      )}
    </div>
  );
};
