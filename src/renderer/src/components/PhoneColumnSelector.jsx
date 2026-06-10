export const PhoneColumnSelector = ({
  sourceType,
  columns,
  phoneColumn,
  setPhoneColumn,
}) => {
  if (sourceType === "contacts") {
    return (
      <div
        style={{
          width: "93vw",
          paddingLeft: "30px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <label style={{ fontWeight: "bold", fontSize: "13px" }}>
          Columna de teléfono:
        </label>
        <span
          style={{
            padding: "6px 14px",
            background: "#e5e7eb",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          WhatsApp (telephone)
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "93vw",
        paddingLeft: "30px",
        display: "flex",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <label style={{ fontWeight: "bold", fontSize: "13px" }}>
        Columna de teléfono:
      </label>
      <select
        value={phoneColumn}
        onChange={(e) => setPhoneColumn(e.target.value)}
        style={{
          height: "32px",
          padding: "4px 8px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          fontSize: "13px",
          minWidth: "180px",
        }}
      >
        {columns.length === 0 && <option value="">Sin columnas</option>}
        {columns.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>
    </div>
  );
};
