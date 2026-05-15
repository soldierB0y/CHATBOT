export const ClientPreview = ({ filteredData, columns }) => {
  if (filteredData.length === 0) {
    return (
      <div style={{ width: "93vw", paddingLeft: "30px" }}>
        <p>
          No hay clientes para mostrar despu&eacute;s de aplicar los filtros.
        </p>
      </div>
    );
  }

  const displayCols = columns;

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
      <h4>Vista previa ({filteredData.length} clientes)</h4>
      <div
        style={{
          maxHeight: "350px",
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: "6px",
        }}
      >
        <table
          style={{
            width: "max-content",
            minWidth: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: "#f3f4f6",
              position: "sticky",
              top: 0,
            }}
          >
            <tr>
              {displayCols.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: "12px",
                    borderBottom: "1px solid #ddd",
                    whiteSpace: "nowrap",
                    background: "#f3f4f6",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i} style={{ background: i % 2 ? "#f9fafb" : "white" }}>
                {displayCols.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      borderBottom: "1px solid #eee",
                      whiteSpace: "nowrap",
                      maxWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={String(row[col] ?? "")}
                  >
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
