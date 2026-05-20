import { useState } from "react";

const buttonStyle = (isPrimary = true, isDisabled = false) => ({
  padding: "10px 30px",
  cursor: isDisabled ? "not-allowed" : "pointer",
  background: isDisabled ? "#9ca3af" : isPrimary ? "#3b82f6" : "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: 600,
  fontSize: "14px",
  alignSelf: "flex-start",
});

export const SourceConfig = ({
  sourceType,
  dbHost,
  setDbHost,
  dbPort,
  setDbPort,
  dbUser,
  setDbUser,
  dbPassword,
  setDbPassword,
  dbName,
  setDbName,
  dbTable,
  setDbTable,
  dbStep,
  setDbStep,
  dbStatus,
  databases,
  tables,
  testConnection,
  loadDbData,
  saveDbConfig,
  dbConnected,
  setFile,
  fileUrl,
  setFileUrl,
  loadExcelFile,
  addFeedback,
  isLoading,
  loadWhatsAppContacts,
  contactsCount,
}) => {
  const [saveMsg, setSaveMsg] = useState("");

  const handleSaveConfig = () => {
    if (saveDbConfig) {
      const ok = saveDbConfig();
      if (ok) {
        setSaveMsg("Configuraci\u00f3n guardada correctamente");
        if (addFeedback) addFeedback("Configuraci\u00f3n guardada", "success");
      } else {
        setSaveMsg("Error al guardar configuraci\u00f3n");
        if (addFeedback)
          addFeedback("Error al guardar configuraci\u00f3n", "error");
      }
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  if (sourceType === "excel") {
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
        <h4>Archivo Excel (.xlsx)</h4>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            if (f) {
              setFile(f);
              setFileUrl(f.name);
              loadExcelFile(f);
            }
          }}
          style={{ height: "35px" }}
        />
        {fileUrl && <span>Archivo: {fileUrl}</span>}
        {isLoading && <span>Cargando...</span>}
      </div>
    );
  }

  if (sourceType === "contacts") {
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
        <h4>Contactos de WhatsApp</h4>
        <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
          Carga los contactos de tu WhatsApp para usarlos como lista de
          env&iacute;o.
        </p>
        <button
          onClick={loadWhatsAppContacts}
          disabled={isLoading}
          style={{
            alignSelf: "flex-start",
            padding: "10px 30px",
            cursor: isLoading ? "not-allowed" : "pointer",
            background: isLoading ? "#9ca3af" : "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {isLoading ? "Cargando contactos..." : "Cargar Contactos"}
        </button>
        {contactsCount != null && !isLoading && (
          <span style={{ color: "#15803d", fontWeight: 600 }}>
            {contactsCount} contactos cargados
          </span>
        )}
        {isLoading && <span>Cargando...</span>}
      </div>
    );
  }

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
      <h4>Configuraci\u00f3n de Base de Datos</h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontWeight: "bold" }}>Host</label>
        <input
          value={dbHost}
          onChange={(e) => setDbHost(e.target.value)}
          placeholder="localhost"
          style={{ height: "32px", padding: "6px" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ fontWeight: "bold" }}>Puerto</label>
        <input
          value={dbPort}
          onChange={(e) => setDbPort(e.target.value)}
          placeholder="3306"
          style={{ height: "32px", padding: "6px" }}
        />
      </div>

      {dbStep === "host" && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setDbStep("credentials")}
            style={buttonStyle()}
          >
            Siguiente
          </button>
        </div>
      )}

      {dbStep !== "host" && (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label style={{ fontWeight: "bold" }}>Usuario</label>
            <input
              value={dbUser}
              onChange={(e) => setDbUser(e.target.value)}
              placeholder="root"
              style={{ height: "32px", padding: "6px" }}
            />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label style={{ fontWeight: "bold" }}>Contrase\u00f1a</label>
            <input
              type="password"
              value={dbPassword}
              onChange={(e) => setDbPassword(e.target.value)}
              placeholder="********"
              style={{ height: "32px", padding: "6px" }}
            />
          </div>
          {dbStep === "credentials" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={testConnection} style={buttonStyle()}>
                Conectar
              </button>
              <button onClick={handleSaveConfig} style={buttonStyle(false)}>
                Guardar Configuraci\u00f3n
              </button>
            </div>
          )}
        </>
      )}

      {dbStep === "dbselect" && (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label style={{ fontWeight: "bold" }}>Base de datos</label>
            <select
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              style={{ height: "32px", padding: "6px" }}
            >
              <option value="">Seleccionar...</option>
              {databases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label style={{ fontWeight: "bold" }}>Tabla</label>
            <select
              value={dbTable}
              onChange={(e) => setDbTable(e.target.value)}
              style={{ height: "32px", padding: "6px" }}
            >
              <option value="">Seleccionar...</option>
              {tables.map((tbl) => (
                <option key={tbl} value={tbl}>
                  {tbl}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={loadDbData} style={buttonStyle()}>
              Sincronizar
            </button>
            <button onClick={handleSaveConfig} style={buttonStyle(false)}>
              Guardar Configuraci\u00f3n
            </button>
          </div>
        </>
      )}

      {saveMsg && (
        <span
          style={{
            color: "#22c55e",
            fontWeight: 600,
          }}
        >
          {saveMsg}
        </span>
      )}
      {dbStatus && (
        <span
          style={{
            color: dbConnected ? "#15803d" : "#b91c1c",
            fontWeight: 600,
          }}
        >
          {dbStatus}
        </span>
      )}
      {isLoading && <span>Cargando...</span>}
    </div>
  );
};
