import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePatient } from "../../context/PatientContext";
import { insert, generateId } from "../../services/db";

const ALL_TESTS = [
  "Full Blood Count",
  "Malaria Test",
  "Urinalysis",
  "Blood Sugar (Fasting)",
  "Liver Function",
  "Typhoid (Widal)",
  "HIV Screening",
  "Hepatitis B",
  "Kidney Function",
  "Lipid Profile",
  "HbA1c",
  "Thyroid Panel (TSH, T3, T4)",
];

export default function ActiveConsultation() {
  const { user } = useAuth();
  const { patient, setConsultation } = usePatient();
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [selected, setSelected] = useState([]);
  const [customTests, setCustomTests] = useState("");
  const [stat, setStat] = useState(false);
  const navigate = useNavigate();

  const toggle = (t) =>
    setSelected((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const handleReviewAndConfirm = () => {
    const allTests = [
      ...selected,
      ...(customTests.trim() ? customTests.split(',').map(t => t.trim()).filter(Boolean) : [])
    ];
    setConsultation({ symptoms, diagnosis, selectedTests: allTests });
    const consultId = generateId("CONS");
    const orderId = generateId("ORD");
    const doctorId = user?.id || "DR-1024";
    const doctorName = user?.name || "Dr. Sarah Jenkins";

    insert("consultations", {
      id: consultId,
      patientId: patient.id,
      doctorId,
      doctorName,
      symptoms,
      diagnosis,
      selectedTests: allTests,
      createdAt: new Date().toISOString(),
      status: "lab_requested",
    });

    insert("lab_orders", {
      id: orderId,
      patientId: patient.id,
      consultationId: consultId,
      tests: allTests,
      requestedBy: doctorName,
      requestedAt: new Date().toISOString(),
      status: "pending_collection",
      stat,
      accessionId: null,
      collectedBy: null,
      collectedAt: null,
    });

    navigate("/doctor/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6fafa",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: "64px",
          background: "#fff",
          borderBottom: "1px solid #e8f2f2",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => navigate("/doctor/dashboard")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#005454",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Dashboard
          </button>
          <span style={{ color: "#dde9e9" }}>|</span>
          <span
            style={{ fontSize: "18px", fontWeight: "700", color: "#1a2b2b" }}
          >
            Active Consultation
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{ fontSize: "14px", fontWeight: "500", color: "#5a7272" }}
          >
            Dr. Sarah Jenkins
          </span>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#e0f2f2",
              border: "2px solid #b0d8d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: "700",
              color: "#005454",
            }}
          >
            SJ
          </div>
        </div>
      </nav>

      <div
        style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div className="lf-card" style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  background: "#e0f2f2",
                  color: "#005454",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                MedBook+
              </span>
            </div>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#c8e8e8,#a0cece)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "700",
                color: "#005454",
                marginBottom: "14px",
              }}
            >
              {patient.initials}
            </div>
            <h3
              style={{
                fontSize: "19px",
                fontWeight: "700",
                color: "#1a2b2b",
                margin: "0 0 4px",
              }}
            >
              {patient.name}
            </h3>
            <p
              style={{ color: "#5a7272", fontSize: "14px", margin: "0 0 2px" }}
            >
              {patient.age} yrs • {patient.gender}
            </p>
            <p
              style={{ color: "#8fa8a8", fontSize: "13px", margin: "0 0 20px" }}
            >
              ID: {patient.id}
            </p>
            <div
              style={{
                background: "#f0f7f7",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#5a7272",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 14px",
                }}
              >
                RECENT VITALS
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  rowGap: "14px",
                }}
              >
                {[
                  ["BP", patient.vitals?.bp || "—"],
                  ["Heart Rate", patient.vitals?.hr || "—"],
                  ["Temp", patient.vitals?.temp || "—"],
                  ["Weight", patient.vitals?.weight || "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#5a7272",
                        marginBottom: "3px",
                      }}
                    >
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#1a2b2b",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lf-card" style={{ padding: "28px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1a2b2b",
                margin: "0 0 24px",
              }}
            >
              Consultation Details
            </h2>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#5a7272",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Presenting Symptoms
              </label>
              <textarea
                className="lf-textarea"
                placeholder="Describe presenting symptoms..."
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#5a7272",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Preliminary Diagnosis
              </label>
              <input
                className="lf-input"
                type="text"
                placeholder="Enter preliminary diagnosis..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#5a7272",
                  }}
                >
                  Lab Tests Requested
                </label>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#005454",
                  }}
                >
                  {selected.length} selected
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                {ALL_TESTS.map((t) => (
                  <label
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#1a2b2b",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(t)}
                      onChange={() => toggle(t)}
                      style={{
                        accentColor: "#005454",
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                    {t}
                  </label>
                ))}
              </div>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#5a7272",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Other Tests (if not listed above)
                </label>
                <textarea
                  className="lf-textarea"
                  placeholder="Enter custom test names, separated by commas (e.g. COVID-19 PCR, D-Dimer)"
                  rows={2}
                  value={customTests}
                  onChange={(e) => setCustomTests(e.target.value)}
                  style={{ fontSize: "14px" }}
                />
              </div>
            </div>
            {/* STAT toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                padding: "12px 14px",
                borderRadius: "10px",
                background: stat ? "#fff0f0" : "#f8fbfb",
                border: `1.5px solid ${stat ? "#c62828" : "#e0ecec"}`,
                marginBottom: "20px",
              }}
            >
              <div
                onClick={() => setStat(!stat)}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "5px",
                  border: `2px solid ${stat ? "#c62828" : "#dde9e9"}`,
                  background: stat ? "#c62828" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {stat && (
                  <svg
                    width="10"
                    height="10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: stat ? "#c62828" : "#1a2b2b",
                  }}
                >
                  Mark as STAT (urgent)
                </span>
                <p style={{ fontSize: "11px", color: "#8fa8a8", margin: 0 }}>
                  Prioritises this order at the top of the lab queue
                </p>
              </div>
            </label>
            <div
              style={{
                height: "1px",
                background: "#e8f2f2",
                marginBottom: "20px",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn-amber"
                onClick={handleReviewAndConfirm}
                disabled={selected.length === 0 && !customTests.trim()}
                style={{ opacity: selected.length === 0 && !customTests.trim() ? 0.5 : 1 }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Review &amp; Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
}
