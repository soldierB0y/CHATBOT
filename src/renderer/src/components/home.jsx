import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SourceSelector } from "./SourceSelector";
import { SourceConfig } from "./SourceConfig";
import { FilterEngine } from "./FilterEngine";
import { ClientPreview } from "./ClientPreview";
import { TemplateEditor } from "./TemplateEditor";
import { ActionFooter } from "./ActionFooter";
import { LoadingScreen } from "./LoadingScreen";
import { useClientSource } from "../hooks/useClientSource";
import icon from "../../../../resources/icon.png?asset";

export const Home = () => {
  const nav = useNavigate();
  const cs = useClientSource();
  const [isWsLoading, setIsWsLoading] = useState(false);
  const [wsLoadingMsg, setWsLoadingMsg] = useState("Iniciando WhatsApp...");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  useEffect(() => {
    window.api.onSessionClose((e, data) => {
      if (data === true) nav("/");
      else alert("error:" + data);
    });
    window.api.onWsLoading((e, loading) => {
      setIsWsLoading(Boolean(loading));
      if (loading) setWsLoadingMsg("Cargando WhatsApp...");
    });
  }, [nav]);

  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: "15px",
        width: "99vw",
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "100vw",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingRight: "90px",
          position: "relative",
          zIndex: 100,
        }}
      >
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: showUserMenu ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showUserMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                minWidth: "180px",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setShowUserInfo(true);
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  border: "none",
                  background: "#fff",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                Informacion de Usuario
              </button>
              <div style={{ height: "1px", background: "#eee" }} />
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  window.api.closeSession();
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  border: "none",
                  background: "#fff",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#dc2626",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fef2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                Cerrar Sesion
              </button>
            </div>
          )}
        </div>
      </div>

      {showUserInfo && (
        <div
          onClick={() => setShowUserInfo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              minWidth: "320px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>Informacion de Usuario</h3>
              <button
                onClick={() => setShowUserInfo(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#666",
                }}
              >
                &#10005;
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  Nombre
                </strong>
                <span>{cs.userInfo?.pushname || "—"}</span>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  Numero de WhatsApp
                </strong>
                <span>
                  {cs.userInfo?.phone ? `+${cs.userInfo.phone}` : "—"}
                </span>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  ID de WhatsApp
                </strong>
                <span>{cs.userInfo?.wid?._serialized || "—"}</span>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  Plataforma
                </strong>
                <span>{cs.userInfo?.platform || "—"}</span>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  Estado
                </strong>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                  Conectado
                </span>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  Fuente de datos
                </strong>
                <span>
                  {cs.sourceType === "db"
                    ? `Base de datos: ${cs.dbName || "No configurada"}`
                    : cs.sourceType === "contacts"
                      ? "Contactos de WhatsApp"
                      : `Excel: ${cs.fileUrl || "No cargado"}`}
                </span>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "4px" }}>
                  Filtros guardados
                </strong>
                <span>{cs.customFilters.length} filtros personalizados</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "80px 0 60px 0",
          width: "100%",
          background: "linear-gradient(to bottom, #fdfdfd, #ffffff)",
          position: "relative",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            padding: "12px",
            borderRadius: "20px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid #f1f5f9",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotate(5deg) scale(1.1)";
            e.currentTarget.style.boxShadow =
              "0 25px 30px -5px rgba(34, 197, 94, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
          }}
        >
          <img
            src={icon}
            alt="WBot Icon"
            style={{ width: "64px", height: "64px", objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1
            style={{
              fontSize: "64px",
              margin: "0 0 0 10px",
              color: "#22C55E",
            }}
          >
            WBot
          </h1>
        </div>
      </header>

      <SourceSelector
        sourceType={cs.sourceType}
        setSourceType={cs.setSourceType}
      />
      <SourceConfig
        sourceType={cs.sourceType}
        dbHost={cs.dbHost}
        setDbHost={cs.setDbHost}
        dbPort={cs.dbPort}
        setDbPort={cs.setDbPort}
        dbUser={cs.dbUser}
        setDbUser={cs.setDbUser}
        dbPassword={cs.dbPassword}
        setDbPassword={cs.setDbPassword}
        dbName={cs.dbName}
        setDbName={cs.setDbName}
        dbTable={cs.dbTable}
        setDbTable={cs.setDbTable}
        dbStep={cs.dbStep}
        setDbStep={cs.setDbStep}
        dbStatus={cs.dbStatus}
        databases={cs.databases}
        tables={cs.tables}
        testConnection={cs.testConnection}
        loadDbData={cs.loadDbData}
        saveDbConfig={cs.saveDbConfig}
        file={cs.file}
        setFile={cs.setFile}
        fileUrl={cs.fileUrl}
        setFileUrl={cs.setFileUrl}
        loadExcelFile={cs.loadExcelFile}
        addFeedback={cs.addFeedback}
        isLoading={cs.isLoading}
        loadWhatsAppContacts={cs.loadWhatsAppContacts}
        contactsCount={cs.contactsCount}
      />
      <FilterEngine
        sourceType={cs.sourceType}
        allCustomers={cs.allCustomers}
        excCustomers={cs.excCustomers}
        setExcCustomers={cs.setExcCustomers}
        updateExceptions={cs.updateExceptions}
        columns={cs.columns}
        customFilters={cs.customFilters}
        setCustomFilters={cs.setCustomFilters}
        saveCustomFilters={cs.saveCustomFilters}
        rawData={cs.rawData}
        addFeedback={cs.addFeedback}
      />
      <ClientPreview filteredData={cs.filteredData} columns={cs.columns} />
      <TemplateEditor
        messageTemplate={cs.messageTemplate}
        saveMessageTemplate={cs.saveMessageTemplate}
        sourceType={cs.sourceType}
        columns={cs.columns}
        addFeedback={cs.addFeedback}
      />
      <ActionFooter
        sourceType={cs.sourceType}
        filteredData={cs.filteredData}
        file={cs.file}
        isSending={cs.isSending}
        sendMessages={cs.sendMessages}
        sendResults={cs.sendResults}
      />

      {isWsLoading && <LoadingScreen message={wsLoadingMsg} />}

      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 10000,
          maxWidth: 360,
        }}
      >
        {cs.feedbacks.map((fb) => (
          <div
            key={fb.id}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              background:
                fb.type === "success"
                  ? "#16a34a"
                  : fb.type === "error"
                    ? "#dc2626"
                    : fb.type === "warning"
                      ? "#d97706"
                      : "#2563eb",
              animation: "slideIn 0.25s ease-out",
            }}
          >
            {fb.message}
          </div>
        ))}
      </div>
      <footer
        style={{
          width: "100%",
          padding: "40px 0",
          marginTop: "auto",
          textAlign: "center",
          borderTop: "1px solid #f1f5f9",
          color: "#94a3b8",
          fontSize: "13px",
          fontWeight: 500,
          background: "#fff",
        }}
      >
        &copy; {new Date().getFullYear()} Jefferson R. Batista V. - Todos los
        derechos reservados
      </footer>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
};
