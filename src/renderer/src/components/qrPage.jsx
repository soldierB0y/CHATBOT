import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "./LoadingScreen";

export const QRPage = () => {
  const navigator = useNavigate();
  const [QRvalue, setQRValue] = useState("");
  const [isQrLoading, setIsQrLoading] = useState(true);

  useEffect(() => {
    const checkInitialState = async () => {
      const currentQr = await window.api.getnewQR();
      const readyState = await window.api.getReadyState();
      if (readyState && readyState.ready) {
        navigator("/home");
        return;
      }
      if (currentQr) {
        setQRValue(currentQr);
        setIsQrLoading(false);
      }
    };
    checkInitialState();

    window.api.getQR((qr) => {
      setQRValue(qr);
      setIsQrLoading(false);
    });

    window.api.isReady((data) => {
      console.log(data);
      if (data.ready == true) navigator("/home");
    });
  }, []);

  if (isQrLoading) {
    return <LoadingScreen message="Iniciando WhatsApp..." />;
  }

  return (
    <section
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontWeight: 700 }}>
        Escanee este codigo para iniciar sesion:
      </p>
      {QRvalue != "" ? (
        <QRCodeCanvas value={QRvalue} size={500} />
      ) : (
        <div
          style={{
            width: 500,
            height: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
          }}
        >
          {" "}
        </div>
      )}
    </section>
  );
};
