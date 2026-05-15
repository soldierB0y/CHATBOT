import icon from "../../../../resources/icon.png?asset";

export const LoadingScreen = ({ message }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={icon}
            alt="WBot Icon"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.05))",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "2px solid #f0f0f0",
              borderTop: "2px solid #007bff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          {message && (
            <p
              style={{
                fontSize: "14px",
                color: "#555",
                margin: 0,
                fontWeight: 500,
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                letterSpacing: "0.2px",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          fontSize: "12px",
          color: "#aaa",
          textAlign: "center",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          fontWeight: 400,
        }}
      >
        &copy; Jefferson R. Batista V. 2026
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
