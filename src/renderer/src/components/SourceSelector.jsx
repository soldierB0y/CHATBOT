export const SourceSelector = ({ sourceType, setSourceType }) => (
  <div
    style={{
      width: "93vw",
      display: "flex",
      gap: "10px",
      paddingLeft: "30px",
      alignItems: "center",
    }}
  >
    <label style={{ fontWeight: "bold" }}>Fuente de datos:</label>
    <button
      onClick={() => setSourceType("excel")}
      style={{
        padding: "8px 20px",
        cursor: "pointer",
        background: sourceType === "excel" ? "#3b82f6" : "#e5e7eb",
        color: sourceType === "excel" ? "white" : "black",
        border: "none",
        borderRadius: "6px",
        fontWeight: 600,
      }}
    >
      Archivo Excel
    </button>
    <button
      onClick={() => setSourceType("db")}
      style={{
        padding: "8px 20px",
        cursor: "pointer",
        background: sourceType === "db" ? "#3b82f6" : "#e5e7eb",
        color: sourceType === "db" ? "white" : "black",
        border: "none",
        borderRadius: "6px",
        fontWeight: 600,
      }}
    >
      Base de Datos
    </button>
    <button
      onClick={() => setSourceType("contacts")}
      style={{
        padding: "8px 20px",
        cursor: "pointer",
        background: sourceType === "contacts" ? "#3b82f6" : "#e5e7eb",
        color: sourceType === "contacts" ? "white" : "black",
        border: "none",
        borderRadius: "6px",
        fontWeight: 600,
      }}
    >
      Contactos de WhatsApp
    </button>
  </div>
);
