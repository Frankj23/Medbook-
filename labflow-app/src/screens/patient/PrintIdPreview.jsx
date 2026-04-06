import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatient } from "../../context/PatientContext";
import QRCode from "qrcode";
import jsPDF from "jspdf";

// Badge size in mm (CR80 Access Badge standard)
const BADGE_W_MM = 98.5;
const BADGE_H_MM = 67;

export default function PrintIdPreview() {
  const navigate = useNavigate();
  const { patient } = usePatient();
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);

  const patientName = patient?.name || "Unknown Patient";
  const patientNameUpper = patientName.toUpperCase();
  const patientId = patient?.id || "PT-0000";

  // Generate QR code data URL tied to the patient's unique ID
  useEffect(() => {
    if (!patientId) return;
    QRCode.toDataURL(`LABFLOW:${patientId}:${patientNameUpper}`, {
      width: 200,
      margin: 1,
      color: { dark: "#005454", light: "#ffffff" },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR generation failed", err));
  }, [patientId, patientName]);

  // Draw the badge onto an offscreen canvas so we can snapshot it for PDF
  useEffect(() => {
    if (!qrDataUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Work at 300 dpi equivalent for a 98.5×67mm badge
    const DPI = 300;
    const MM_TO_INCH = 1 / 25.4;
    const W = Math.round(BADGE_W_MM * MM_TO_INCH * DPI);
    const H = Math.round(BADGE_H_MM * MM_TO_INCH * DPI);
    canvas.width = W;
    canvas.height = H;

    // Full badge background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Top stripe
    ctx.fillStyle = "#005454";
    ctx.fillRect(0, 0, W, H * 0.16);

    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.round(H * 0.065)}px Inter, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let stripeName = patientNameUpper;
    const stripeMaxWidth = W * 0.9;
    while (
      ctx.measureText(stripeName).width > stripeMaxWidth &&
      stripeName.length > 4
    ) {
      stripeName = stripeName.slice(0, -1);
    }
    ctx.fillText(stripeName, W * 0.05, H * 0.08);

    ctx.font = `500 ${Math.round(H * 0.04)}px Inter, sans-serif`;
    ctx.fillText("Patient ID Badge", W * 0.05, H * 0.125);

    // Main content columns
    const leftX = W * 0.05;
    const leftW = W * 0.55;
    const rightX = W * 0.63;
    const rightW = W * 0.32;

    // LabFlow circular badge
    const circleX = leftX + Math.round(H * 0.08);
    const circleY = H * 0.27;
    const circleR = H * 0.09;
    ctx.fillStyle = "#005454";
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.round(H * 0.085)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("L", circleX, circleY);

    ctx.fillStyle = "#1a2b2b";
    ctx.font = `700 ${Math.round(H * 0.05)}px Inter, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("LabFlow", leftX + circleR * 2 + H * 0.03, H * 0.23);
    ctx.fillStyle = "#8fa8a8";
    ctx.font = `500 ${Math.round(H * 0.035)}px Inter, sans-serif`;
    ctx.fillText("Patient", leftX + circleR * 2 + H * 0.03, H * 0.28);

    // Patient ID label
    ctx.fillStyle = "#8fa8a8";
    ctx.font = `600 ${Math.round(H * 0.036)}px Inter, sans-serif`;
    ctx.fillText("Patient ID", leftX, H * 0.44);

    // Patient ID label
    ctx.fillStyle = "#8fa8a8";
    ctx.font = `600 ${Math.round(H * 0.04)}px Inter, sans-serif`;
    ctx.fillText("Patient ID", leftX, H * 0.45);

    // Patient ID value
    ctx.fillStyle = "#005454";
    ctx.font = `700 ${Math.round(H * 0.085)}px Inter, sans-serif`;
    ctx.fillText(patientId, leftX, H * 0.475);

    // QR card area
    const qrCardY = H * 0.22;
    const qrCardH = H * 0.52;
    ctx.fillStyle = "#f4f8f8";
    ctx.fillRect(rightX, qrCardY, rightW, qrCardH);
    ctx.strokeStyle = "#e0ecec";
    ctx.lineWidth = 2;
    ctx.strokeRect(rightX, qrCardY, rightW, qrCardH);

    // QR code title
    ctx.fillStyle = "#5a7272";
    ctx.font = `700 ${Math.round(H * 0.038)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Scan", rightX + rightW / 2, qrCardY + H * 0.035);

    // QR code
    if (qrDataUrl) {
      const qrImg = new Image();
      qrImg.onload = () => {
        const qrSize = Math.min(rightW * 0.78, qrCardH * 0.68);
        const qrX = rightX + (rightW - qrSize) / 2;
        const qrY = qrCardY + (qrCardH - qrSize) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      };
      qrImg.src = qrDataUrl;
    }

    // Footer text
    ctx.textAlign = "left";
    ctx.fillStyle = "#8fa8a8";
    ctx.font = `500 ${Math.round(H * 0.035)}px Inter, sans-serif`;
    ctx.fillText("Port City General Hospital", leftX, H * 0.85);
    ctx.fillText(`Issued: ${new Date().toLocaleDateString()}`, leftX, H * 0.9);
  }, [qrDataUrl, patientName, patientId]);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const canvas = canvasRef.current;
      // Wait a tick for the QR image to render
      await new Promise((r) => setTimeout(r, 400));
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Try exact badge size first
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [BADGE_W_MM, BADGE_H_MM],
      });
      doc.addImage(imgData, "JPEG", 0, 0, BADGE_W_MM, BADGE_H_MM);
      doc.save(`${patientId}-badge.pdf`);

      // Redirect to success after download
      setTimeout(
        () => navigate("/register/success", { state: { fromPrint: true } }),
        500,
      );
    } catch (err) {
      // Fallback: center on A4
      try {
        const canvas = canvasRef.current;
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });
        const pageW = 297;
        const pageH = 210;
        const x = (pageW - BADGE_W_MM) / 2;
        const y = (pageH - BADGE_H_MM) / 2;
        doc.addImage(imgData, "JPEG", x, y, BADGE_W_MM, BADGE_H_MM);
        doc.save(`${patientId}-badge.pdf`);
        setTimeout(
          () => navigate("/register/success", { state: { fromPrint: true } }),
          500,
        );
      } catch (e2) {
        console.error("PDF download failed", e2);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#c8d8d8",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: "56px",
          background: "linear-gradient(135deg,#005454,#0b6e6e)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span style={{ color: "#fff", fontSize: "16px", fontWeight: "700" }}>
            LabFlow
          </span>
        </div>
        <span
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
        </span>
      </nav>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          className="lf-card"
          style={{ width: "100%", maxWidth: "560px", overflow: "hidden" }}
        >
          <div style={{ padding: "28px 28px 24px" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#1a2b2b",
                    margin: "0 0 4px",
                  }}
                >
                  Patient Badge Preview
                </h3>
                <p style={{ color: "#5a7272", fontSize: "13px", margin: 0 }}>
                  {patientName} —{" "}
                  <strong style={{ color: "#005454" }}>{patientId}</strong>
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5a7272",
                  fontSize: "20px",
                  lineHeight: 1,
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "6px",
                }}
              >
                ×
              </button>
            </div>

            {/* Badge live preview — scaled down from canvas */}
            <div
              style={{
                border: "1.5px solid #e0ecec",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,84,84,0.12)",
                marginBottom: "24px",
                background: "#fff",
              }}
            >
              {/* Scaled canvas preview */}
              <canvas
                ref={canvasRef}
                style={{ width: "100%", display: "block" }}
              />
            </div>

            {/* Info chips */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  background: "#e6f4f4",
                  color: "#005454",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontWeight: "600",
                }}
              >
              </span>
              <span
                style={{
                  fontSize: "11px",
                  background: "#e6f4f4",
                  color: "#005454",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontWeight: "600",
                }}
              >
              </span>
              <span
                style={{
                  fontSize: "11px",
                  background: "#e6f4f4",
                  color: "#005454",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontWeight: "600",
                }}
              >
              </span>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button className="btn-ghost" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button
                id="btn-download-badge-pdf"
                className="btn-primary"
                onClick={downloadPdf}
                disabled={downloading || !qrDataUrl}
                style={{ opacity: downloading || !qrDataUrl ? 0.7 : 1 }}
              >
                {downloading ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Downloading…
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Badge PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
