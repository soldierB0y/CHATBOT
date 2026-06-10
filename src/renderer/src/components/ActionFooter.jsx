import { useState } from "react";

export const ActionFooter = ({
  sourceType,
  filteredData,
  file,
  isSending,
  sendMessages,
  sendResults,
  sendProgress,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSend = () => {
    if (sourceType === "excel" && !file) {
      alert("Debe seleccionar un archivo Excel primero");
      return;
    }
    if (filteredData.length === 0) {
      alert("No hay registros para enviar despues de aplicar los filtros");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = () => {
    setShowConfirm(false);
    sendMessages();
  };

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
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h3>Confirmar Env&iacute;o</h3>
            <p>
              Se enviar&aacute;n <strong>{filteredData.length}</strong>{" "}
              mensajes.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 24px",
                  cursor: "pointer",
                  background: "#e5e7eb",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmSend}
                style={{
                  padding: "8px 24px",
                  cursor: "pointer",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={isSending}
        style={{
          alignSelf: "flex-start",
          padding: "10px 40px",
          cursor: isSending ? "not-allowed" : "pointer",
          background: isSending ? "#9ca3af" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "16px",
        }}
      >
        {isSending ? "Enviando..." : "Enviar Mensajes"}
      </button>

      {isSending && (
        <div
          style={{
            padding: "12px",
            background: "#f3f4f6",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px",
              marginBottom: "10px",
              color: "#374151",
            }}
          >
            <span>
              Enviados {sendProgress.sent || 0} /{" "}
              {sendProgress.total || filteredData.length}
            </span>
            <span>
              {sendProgress.total
                ? Math.min(
                    100,
                    Math.round((sendProgress.sent / sendProgress.total) * 100),
                  )
                : 0}
              %
            </span>
          </div>
          <div
            style={{
              height: "10px",
              background: "#e5e7eb",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${
                  sendProgress.total
                    ? Math.min(
                        100,
                        Math.round(
                          (sendProgress.sent / sendProgress.total) * 100,
                        ),
                      )
                    : 0
                }%`,
                background: "#3b82f6",
                borderRadius: "5px",
                transition: "width 0.2s ease",
              }}
            />
          </div>
          <p style={{ fontSize: "13px", marginTop: "6px" }}>
            Enviando mensajes, por favor espere...
          </p>
        </div>
      )}

      {sendResults &&
        (sendResults.enviados?.length > 0 ||
          sendResults.fallidos?.length > 0 ||
          sendResults.error) && (
          <div
            style={{
              background: "#f7f7f7",
              padding: "16px",
              borderRadius: "6px",
              marginTop: "10px",
            }}
          >
            <h4>Resultado del env&iacute;o</h4>
            {sendResults.error && (
              <p style={{ color: "red" }}>Error: {String(sendResults.error)}</p>
            )}
            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "250px" }}>
                <h5>Enviados ({sendResults.enviados?.length || 0})</h5>
                {sendResults.enviados?.length > 0 ? (
                  <div
                    style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      background: "white",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    {sendResults.enviados.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: "12px",
                          padding: "2px 0",
                        }}
                      >
                        {s.name} - {s.number}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "12px" }}>Sin enviados</p>
                )}
              </div>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <h5>Fallidos ({sendResults.fallidos?.length || 0})</h5>
                {sendResults.fallidos?.length > 0 ? (
                  <div
                    style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      background: "white",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    {sendResults.fallidos.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: "12px",
                          padding: "2px 0",
                          color: "#dc2626",
                        }}
                      >
                        {f.name} - {f.reason}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "12px" }}>Sin fallidos</p>
                )}
              </div>
            </div>
          </div>
        )}

      <style>{`
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
