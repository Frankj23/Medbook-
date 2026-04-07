import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePatient } from "../../context/PatientContext";
import { getAll, getById, insert, update, generateId } from "../../services/db";

// Level 1 = Red (Immediate/Emergency), Level 2 = Yellow (Urgent), Level 3 = Green (Routine)
const CATEGORIES = [
  {
    key: "red",
    level: 1,
    label: "Level 1 — Immediate",
    sublabel: "Emergency",
    bg: "#fff0f0",
    border: "#c62828",
    text: "#c62828",
    dot: "#c62828",
    badge: "#c62828",
  },
  {
    key: "yellow",
    level: 2,
    label: "Level 2 — Urgent",
    sublabel: "Urgent",
    bg: "#fffbf0",
    border: "#d97706",
    text: "#854F0B",
    dot: "#d97706",
    badge: "#d97706",
  },
  {
    key: "green",
    level: 3,
    label: "Level 3 — Routine",
    sublabel: "Routine",
    bg: "#f0faf4",
    border: "#1a7a4a",
    text: "#1a7a4a",
    dot: "#1a7a4a",
    badge: "#1a7a4a",
  },
];

export default function NurseTriage() {
  const { user, logout } = useAuth();
  const { setPatient: setCtxPatient } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [patient, setPatient] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [vitals, setVitals] = useState({
    bp: "",
    temp: "",
    pulse: "",
    weight: "",
    height: "",
    spo2: "",
  });
  const [category, setCategory] = useState("green");
  const [saved, setSaved] = useState(null);

  // Auto-compute BMI when weight or height changes
  const bmi = (() => {
    const w = parseFloat(vitals.weight);
    const h = parseFloat(vitals.height) / 100; // cm → m
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return "";
  })();

  const handleSearch = () => {
    const q = search.trim().toUpperCase();
    const patients = getAll("patients");
    const found = patients.find(
      (p) =>
        p.id.toUpperCase() === q ||
        p.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (found) {
      setPatient(found);
      setNotFound(false);
    } else {
      setPatient(null);
      setNotFound(true);
    }
  };

  useEffect(() => {
    const patientId = location.state?.patientId;
    if (patientId) {
      const found = getById("patients", patientId);
      if (found) {
        setPatient(found);
        setSearch(found.id);
        setNotFound(false);
      }
    }
  }, [location.state]);

  const setV = (k) => (e) => setVitals((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = () => {
    const existingTriages = getAll("triages");
    const nextNum = existingTriages.length + 1;
    const cat = CATEGORIES.find((c) => c.key === category);

    const triageRecord = {
      id: generateId("TRI"),
      patientId: patient.id,
      bp: vitals.bp,
      temp: vitals.temp,
      pulse: vitals.pulse,
      weight: vitals.weight,
      height: vitals.height,
      spo2: vitals.spo2,
      bmi,
      category,
      level: cat.level,
      queueNumber: "A-" + String(nextNum).padStart(3, "0"),
      by: user ? user.name : "Nurse",
      createdAt: new Date().toISOString(),
    };

    const triage = insert("triages", triageRecord);

    // Update the patient record with latest vitals
    update("patients", patient.id, {
      vitals: {
        bp: vitals.bp,
        temp: vitals.temp,
        pulse: vitals.pulse,
        weight: vitals.weight,
        height: vitals.height,
        spo2: vitals.spo2,
        bmi,
      },
      triageCategory: category,
      triageLevel: cat.level,
      status: "triaged",
    });

    // Sync patient context so PrintID can use it
    const updatedPatient = getById("patients", patient.id);
    if (updatedPatient) setCtxPatient(updatedPatient);

    setSaved(triage);
  };

  const handlePrintId = () => {
    // Pass the current patient into context then navigate
    setCtxPatient(patient);
    navigate("/register/print");
  };

  const cat = CATEGORIES.find((c) => c.key === category);

  if (saved) {
    const savedCat = CATEGORIES.find((c) => c.key === saved.category);
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6fafa",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="lf-card"
          style={{
            padding: "52px 48px",
            maxWidth: "460px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#1a7a4a,#2ea86a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 6px 20px rgba(26,122,74,0.28)",
            }}
          >
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="3"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#1a2b2b",
              margin: "0 0 8px",
            }}
          >
            Triage Complete
          </h2>
          <p style={{ color: "#5a7272", fontSize: "14px", margin: "0 0 28px" }}>
            {patient.name} has been triaged and queued.
          </p>
          <div
            style={{
              background: "#f0f7f7",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "28px",
            }}
          >
            <p
              style={{ fontSize: "12px", color: "#8fa8a8", margin: "0 0 6px" }}
            >
              QUEUE NUMBER
            </p>
            <p
              style={{
                fontSize: "40px",
                fontWeight: "800",
                color: "#005454",
                margin: "0 0 14px",
                letterSpacing: "0.05em",
              }}
            >
              {saved.queueNumber}
            </p>
            <span
              style={{
                background: savedCat.bg,
                color: savedCat.text,
                border: `1.5px solid ${savedCat.border}`,
                padding: "4px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              {savedCat.label}
            </span>
          </div>
          {bmi && (
            <div
              style={{
                background: "#f0f7f7",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#8fa8a8",
                  fontWeight: "700",
                }}
              >
                BMI
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#005454",
                }}
              >
                {bmi}{" "}
                <span style={{ fontSize: "11px", color: "#8fa8a8" }}>
                  kg/m²
                </span>
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn-ghost"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => {
                setPatient(null);
                setSearch("");
                setVitals({
                  bp: "",
                  temp: "",
                  pulse: "",
                  weight: "",
                  height: "",
                  spo2: "",
                });
                setCategory("green");
                setSaved(null);
              }}
            >
              Next Patient
            </button>
            <button
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => navigate("/register")}
            >
              Register New
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          padding: "0 28px",
          height: "60px",
          background: "#fff",
          borderBottom: "1px solid #e8f2f2",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              border: "1px solid #e8f2f2",
              background: "#fff",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Go back"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#005454"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "linear-gradient(135deg,#005454,#0b6e6e)",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "#fff", fontSize: "13px", fontWeight: "800" }}
            >
              L
            </span>
          </div>
          <span
            style={{ fontSize: "17px", fontWeight: "700", color: "#1a2b2b" }}
          >
            LabFlow
          </span>
          <span style={{ color: "#dde9e9", margin: "0 4px" }}>|</span>
          <span style={{ fontSize: "14px", color: "#5a7272" }}>
            Nurse Triage
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: "#5a7272" }}>
            {user ? user.name : "Nurse"}
          </span>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#0b6e6e,#005454)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              color: "#fff",
            }}
          >
            {user ? user.initials : "NU"}
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              padding: "6px 12px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div
        style={{ padding: "28px 32px", maxWidth: "900px", margin: "0 auto" }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#1a2b2b",
            margin: "0 0 6px",
          }}
        >
          Patient Triage
        </h1>
        <p style={{ fontSize: "13px", color: "#5a7272", margin: "0 0 28px" }}>
          Search for a registered patient, capture vitals, and assign triage
          priority.
        </p>

        {/* Search */}
        <div
          className="lf-card"
          style={{ padding: "20px", marginBottom: "20px" }}
        >
          <label
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#5a7272",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Find Patient
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8fa8a8",
                }}
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="lf-input"
                placeholder="Patient ID or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ paddingLeft: "40px" }}
              />
            </div>
            <button className="btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
          <div style={{ marginTop: "10px" }}>
            <Link
              to="/register"
              style={{
                fontSize: "13px",
                color: "#005454",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              New patient? Register here
            </Link>
          </div>
          {notFound && (
            <p
              style={{ fontSize: "13px", color: "#c62828", margin: "10px 0 0" }}
            >
              No patient found. Please register the patient first.
            </p>
          )}
        </div>

        {patient && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: "20px",
            }}
          >
            {/* Patient card */}
            <div className="lf-card" style={{ padding: "20px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#005454,#0b6e6e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "12px",
                }}
              >
                {patient.initials}
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#1a2b2b",
                  margin: "0 0 4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {patient.name}
                {patient.isEmergency && (
                  <span
                    style={{
                      background: "#c62828",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "800",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Emergency
                  </span>
                )}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#5a7272",
                  margin: "0 0 2px",
                }}
              >
                {patient.age} yrs • {patient.gender}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#8fa8a8",
                  margin: "0 0 16px",
                }}
              >
                {patient.id}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                {[
                  ["Blood Group", patient.bloodGroup],
                  ["Allergies", patient.allergies],
                  ["Emergency Name", patient.emergencyName],
                  ["Emergency Contact", patient.emergencyContact],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      background: "#f0f7f7",
                      borderRadius: "8px",
                      padding: "10px 12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#8fa8a8",
                        margin: "0 0 2px",
                   //      textTransform: "uppercemergencyName                 fontWeight: "700",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {k}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1a2b2b",
                        margin: 0,
                      }}
                    >
                      {v || "—"}
                    </p>
                  </div>
                ))}
              </div>
              <button
                id="btn-print-patient-id"
                onClick={handlePrintId}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "linear-gradient(135deg,#005454,#0b6e6e)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Patient ID
              </button>
              {patient.isEmergency && (
                <button
                  onClick={() => navigate('/register', { state: { emergencyPatient: patient } })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "#c62828",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "8px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Complete Patient Details
                </button>
              )}
            </div>

            {/* Vitals form */}
            <div className="lf-card" style={{ padding: "24px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#1a2b2b",
                  margin: "0 0 20px",
                }}
              >
                Vital Signs
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                {[
                  {
                    key: "bp",
                    label: "Blood Pressure",
                    unit: "mmHg",
                    placeholder: "120/80",
                    type: "text",
                  },
                  {
                    key: "temp",
                    label: "Temperature",
                    unit: "°C",
                    placeholder: "36.5",
                    type: "number",
                  },
                  {
                    key: "pulse",
                    label: "Pulse Rate",
                    unit: "bpm",
                    placeholder: "72",
                    type: "number",
                  },
                  {
                    key: "weight",
                    label: "Weight",
                    unit: "kg",
                    placeholder: "70",
                    type: "number",
                  },
                  {
                    key: "height",
                    label: "Height",
                    unit: "cm",
                    placeholder: "170",
                    type: "number",
                  },
                  {
                    key: "spo2",
                    label: "SpO₂",
                    unit: "%",
                    placeholder: "98",
                    type: "number",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#5a7272",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      {f.label}
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="lf-input"
                        type={f.type}
                        placeholder={f.placeholder}
                        value={vitals[f.key]}
                        onChange={setV(f.key)}
                        style={{ paddingRight: "48px" }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#8fa8a8",
                        }}
                      >
                        {f.unit}
                      </span>
                    </div>
                  </div>
                ))}

                {/* BMI — auto-calculated */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#5a7272",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    BMI{" "}
                    <span style={{ fontWeight: "400", color: "#aac0c0" }}>
                      (auto-calculated: weight ÷ height²)
                    </span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="lf-input"
                      readOnly
                      value={bmi}
                      placeholder="Enter weight & height above"
                      style={{
                        paddingRight: "60px",
                        background: bmi ? "#f0fdf4" : "#f8f8f8",
                        color: bmi ? "#1a7a4a" : "#aac0c0",
                        fontWeight: bmi ? "700" : "400",
                        cursor: "default",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#8fa8a8",
                      }}
                    >
                      kg/m²
                    </span>
                  </div>
                  {bmi && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#5a7272",
                        margin: "4px 0 0",
                      }}
                    >
                      {parseFloat(bmi) < 18.5
                        ? "⚠ Underweight"
                        : parseFloat(bmi) < 25
                          ? "✓ Normal weight"
                          : parseFloat(bmi) < 30
                            ? "⚠ Overweight"
                            : "⚠ Obese"}
                    </p>
                  )}
                </div>
              </div>

              {/* Triage category */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#5a7272",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  Triage Severity Level
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCategory(c.key)}
                      style={{
                        flex: 1,
                        padding: "14px 8px",
                        borderRadius: "12px",
                        border: `2px solid ${category === c.key ? c.border : "#e0ecec"}`,
                        background: category === c.key ? c.bg : "#fff",
                        color: category === c.key ? c.text : "#5a7272",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Colored dot */}
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          background: c.dot,
                          display: "block",
                          boxShadow:
                            category === c.key ? `0 0 8px ${c.dot}88` : "none",
                          transition: "box-shadow 0.15s",
                        }}
                      />
                      {/* Level badge */}
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: category === c.key ? c.badge : "#e0ecec",
                          color: category === c.key ? "#fff" : "#8fa8a8",
                          letterSpacing: "0.04em",
                        }}
                      >
                        LEVEL {c.level}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: "700" }}>
                        {c.label.split("—")[1]?.trim()}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        {c.sublabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "#e8f2f2",
                  marginBottom: "20px",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-amber" onClick={handleSave}>
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
                  Assign Queue Number
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
