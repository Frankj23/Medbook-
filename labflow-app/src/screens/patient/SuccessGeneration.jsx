import { useNavigate } from "react-router-dom";
import { usePatient } from "../../context/PatientContext";
import { useEffect, useState } from "react";

const COUNTDOWN_SECONDS = 15;

export default function SuccessGeneration() {
  const navigate = useNavigate();
  const { patient } = usePatient();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [paused, setPaused] = useState(false);

  // 30-second auto-redirect to patient triage
  useEffect(() => {
    if (paused) return;
    if (countdown <= 0) {
      navigate("/nurse/triage");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, paused, navigate]);

  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f5f5",
        fontFamily: "Inter, sans-serif",
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span style={{ color: "#fff", fontSize: "17px", fontWeight: "700" }}>
            LabFlow
          </span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>
          Patient Registration
        </span>
      </nav>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 56px)",
          padding: "24px",
        }}
      >
        <div
          className="lf-card"
          style={{
            padding: "52px 48px",
            width: "100%",
            maxWidth: "520px",
            textAlign: "center",
          }}
        >
          {/* Checkmark */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#1a7a4a,#2ea86a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 6px 24px rgba(26,122,74,0.32)",
            }}
          >
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="3"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Badge ID */}
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#005454",
              letterSpacing: "-0.02em",
              marginTop: 0,
              marginBottom: "6px",
            }}
          >
            {patient?.id || "PT-0000"}
          </h2>
          <p
            style={{
              color: "#5a7272",
              fontSize: "14px",
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            MedBook+ record created for{" "}
            <strong style={{ color: "#1a2b2b" }}>
              {patient?.name || "Patient"}
            </strong>
          </p>

          {/* Patient details */}
          {patient && (
            <div
              style={{
                background: "#f0f7f7",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "28px",
                textAlign: "left",
              }}
            >
              {[
                ["Badge / Patient ID", patient.id],
                ["Full Name", patient.name],
                ["Gender", patient.gender],
                ["DOB", patient.dob],
                ["Blood Group", patient.bloodGroup],
                ["Contact", patient.phone || "—"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "0.5px solid #e0ecec",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#8fa8a8" }}>
                    {k}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1a2b2b",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Print ID */}
          <button
            id="btn-success-print-id"
            className="btn-amber"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "14px",
              marginBottom: "12px",
            }}
            onClick={() => navigate("/register/print")}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Download ID Badge
          </button>

          {/* Register button — with countdown */}
          <div style={{ position: "relative" }}>
            {/* Progress bar under button */}
            <div
              style={{
                height: "3px",
                background: "#e0ecec",
                borderRadius: "2px",
                marginBottom: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#005454,#0b6e6e)",
                  borderRadius: "2px",
                  transition: "width 1s linear",
                }}
              />
            </div>

            <button
              id="btn-register-another"
              className="btn-ghost"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => {
                setPaused(true);
                navigate("/register");
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Register Another Patient
            </button>

            {/* Countdown indicator */}
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: countdown <= 10 ? "#fff0f0" : "#f0fdf4",
                  border: `2px solid ${countdown <= 10 ? "#c62828" : "#1a7a4a"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "800",
                  color: countdown <= 10 ? "#c62828" : "#1a7a4a",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {countdown}
              </div>
              <span style={{ fontSize: "12px", color: "#8fa8a8" }}>
                Redirecting to Triage in{" "}
                <strong
                  style={{ color: countdown <= 10 ? "#c62828" : "#005454" }}
                >
                  {countdown}s
                </strong>
              </span>
              <button
                onClick={() => setPaused((p) => !p)}
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  border: "1px solid #dde9e9",
                  background: "#fff",
                  cursor: "pointer",
                  color: "#5a7272",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {paused ? "▶ Resume" : "⏸ Pause"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
