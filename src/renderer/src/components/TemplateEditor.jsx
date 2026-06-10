export const TemplateEditor = ({
  messageTemplate,
  saveMessageTemplate,
  sourceType,
  columns,
  addFeedback,
  aggregationAliases,
}) => {
  const insertVariable = (variable) => {
    const ta = document.getElementById("template-textarea");
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newVal = before + "{" + variable + "}" + after;
    saveMessageTemplate(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(
        start + variable.length + 2,
        start + variable.length + 2,
      );
    });
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
      <h4>Mensaje</h4>
      <textarea
        id="template-textarea"
        value={messageTemplate}
        onChange={(e) => saveMessageTemplate(e.target.value)}
        style={{
          width: "100%",
          height: "100px",
          padding: "12px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          fontSize: "14px",
          lineHeight: "1.5",
          outline: "none",
          boxSizing: "border-box",
        }}
        placeholder="Escribe tu mensaje aqu&iacute;..."
      />
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <small style={{ color: "#666" }}>Variables:</small>
        {(sourceType === "contacts"
          ? columns.filter((c) => c !== "remainingDebt")
          : columns
        ).map((col) => (
          <span
            key={col}
            onClick={() => insertVariable(col)}
            style={{
              background: "#e0f2fe",
              color: "#0369a1",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600,
              border: "1px solid #bae6fd",
            }}
          >
            {`{${col}}`}
          </span>
        ))}
        {aggregationAliases && aggregationAliases.length > 0 && (
          <>
            {aggregationAliases.map((alias) => (
              <span
                key={alias}
                onClick={() => insertVariable(alias)}
                style={{
                  background: "#bbf7d0",
                  color: "#166534",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  border: "1px solid #86efac",
                }}
              >
                {`{${alias}}`}
              </span>
            ))}
          </>
        )}
      </div>
      <button
        onClick={() => {
          localStorage.setItem("msgTemplate", messageTemplate);
          if (addFeedback) addFeedback("Mensaje guardado", "success");
        }}
        style={{
          alignSelf: "flex-start",
          padding: "5px 16px",
          borderRadius: "6px",
          border: "none",
          background: "#22c55e",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        Guardar mensaje
      </button>
    </div>
  );
};
