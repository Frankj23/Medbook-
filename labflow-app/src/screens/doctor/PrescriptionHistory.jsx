import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getPrescriptions,
  getById,
  fetchPrescriptions,
  fetchPatients,
} from "../../services/db";
import { usePatient } from "../../context/PatientContext";

const INITIALS_BG = ["#005454", "#0b6e6e", "#1a5c5c", "#004545"];

export default function PrescriptionHistory() {
  const navigate = useNavigate();
  const { setPatientFromId } = usePatient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All Records");
  const [page, setPage] = useState(1);
  const [prescriptions, setPrescriptions] = useState([]);
  const [detailsPrescription, setDetailsPrescription] = useState(null);
  const [detailsPatient, setDetailsPatient] = useState(null);
  const TOTAL_PAGES = 32;

  useEffect(() => {
    const load = async () => {
      try {
        await fetchPatients();
        const prescriptionsData = await fetchPrescriptions();
        setPrescriptions(prescriptionsData);
      } catch (error) {
        setPrescriptions(getPrescriptions());
      }
    };

    load();
  }, []);

  const rows = prescriptions.map((rx) => {
    const patient = getById("patients", rx.patientId);
    return {
      ...rx,
      patientName: patient?.name || "Unknown Patient",
      patientId: rx.patientId || "N/A",
      medication:
        rx.medications?.map((m) => m.name).join(", ") ||
        "No medication entered",
      status: rx.status || "sent",
      date: rx.createdAt
        ? new Date(rx.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Unknown",
      patient,
    };
  });

  const filtered = rows.filter(
    (r) =>
      (r.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.medication || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.patientId || "").toLowerCase().includes(search.toLowerCase()),
  );

  const openDetails = (row) => {
    setDetailsPrescription(row);
    setDetailsPatient(row.patient);
  };

  const handleAddPrescription = (patientId) => {
    setPatientFromId(patientId);
    navigate("/doctor/prescription/entry");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        background: "#f6fafa",
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
        <span style={{ fontSize: "17px", fontWeight: "800", color: "#005454" }}>
          Prescription History
        </span>
        <button
          onClick={() => navigate("/doctor/dashboard")}
          style={{
            background: "none",
            border: "none",
            color: "#005454",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          ← Dashboard
        </button>
      </nav>

      <main
        style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}
      >
        <div style={{ marginBottom: "18px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#1a2b2b",
              margin: "0 0 6px",
            }}
          >
            Prescription History
          </h1>
          <p style={{ fontSize: "13px", color: "#5a7272", margin: 0 }}>
            Search and manage prescriptions for your active patients.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <svg
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8fa8a8",
              }}
              width="14"
              height="14"
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
              placeholder="Search by patient, medication or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "40px", width: "100%" }}
            />
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: "#fff",
              border: "1.5px solid #dde9e9",
              borderRadius: "12px",
              padding: "12px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              color: "#5a7272",
              fontFamily: "Inter, sans-serif",
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Date Range
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: "#fff",
              border: "1.5px solid #dde9e9",
              borderRadius: "12px",
              padding: "12px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              color: "#5a7272",
              fontFamily: "Inter, sans-serif",
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
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Status
          </button>
        </div>

        <div
          className="lf-card"
          style={{ overflow: "hidden", marginBottom: "20px" }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "#8fa8a8", margin: 0 }}>
                No prescriptions found. Use the patient search or create a new
                prescription.
              </p>
            </div>
          ) : (
            filtered.map((rec, i) => (
              <div
                key={rec.id || i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1.5fr 2fr 1.5fr 1.6fr",
                  alignItems: "center",
                  gap: "16px",
                  padding: "18px 22px",
                  borderBottom:
                    i < filtered.length - 1 ? "1px solid #f0f7f7" : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: INITIALS_BG[i % INITIALS_BG.length],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    {rec.patientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1a2b2b",
                        margin: "0 0 2px",
                      }}
                    >
                      {rec.patientName}
                    </p>
                    <p
                      style={{ fontSize: "12px", color: "#8fa8a8", margin: 0 }}
                    >
                      ID: {rec.patientId}
                    </p>
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#8fa8a8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 3px",
                    }}
                  >
                    DATE ISSUED
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1a2b2b",
                      margin: 0,
                    }}
                  >
                    {rec.date}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#8fa8a8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 3px",
                    }}
                  >
                    MEDICATIONS
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1a2b2b",
                      margin: 0,
                    }}
                  >
                    {rec.medication}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#8fa8a8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 6px",
                    }}
                  >
                    STATUS
                  </p>
                  <span
                    style={{
                      background:
                        rec.status === "sent"
                          ? "#fff3dc"
                          : rec.status === "picked_up"
                            ? "#e8f7ef"
                            : "#f0f7f7",
                      color: rec.status === "sent" ? "#855300" : "#1a7a4a",
                      padding: "5px 12px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {rec.status.replace("_", " ")}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleAddPrescription(rec.patientId)}
                    style={{
                      background: "#005454",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => openDetails(rec)}
                    style={{
                      background: "#f8fbfb",
                      border: "1px solid #dde9e9",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      color: "#005454",
                      cursor: "pointer",
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: "13px", color: "#5a7272", margin: 0 }}>
            Showing{" "}
            <strong>
              {filtered.length > 0 ? `1–${Math.min(filtered.length, 10)}` : "0"}
            </strong>{" "}
            of <strong>{filtered.length}</strong> prescriptions
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#fff",
                border: "1.5px solid #e0ecec",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5a7272",
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
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background:
                    page === p
                      ? "linear-gradient(135deg,#005454,#0b6e6e)"
                      : "#fff",
                  border: page !== p ? "1.5px solid #e0ecec" : "none",
                  color: page === p ? "#fff" : "#5a7272",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {p}
              </button>
            ))}
            <span style={{ color: "#8fa8a8", fontSize: "14px" }}>…</span>
            <button
              onClick={() => setPage(TOTAL_PAGES)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background:
                  page === TOTAL_PAGES
                    ? "linear-gradient(135deg,#005454,#0b6e6e)"
                    : "#fff",
                border: page !== TOTAL_PAGES ? "1.5px solid #e0ecec" : "none",
                color: page === TOTAL_PAGES ? "#fff" : "#5a7272",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {TOTAL_PAGES}
            </button>
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#fff",
                border: "1.5px solid #e0ecec",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5a7272",
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
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {detailsPrescription && detailsPatient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,20,20,0.6)",
            zIndex: 50,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "620px",
              background: "#fff",
              borderRadius: "18px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "22px 24px",
                borderBottom: "1px solid #e8f2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#1a2b2b",
                  }}
                >
                  Patient details
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "13px",
                    color: "#5a7272",
                  }}
                >
                  {detailsPatient.name} · {detailsPatient.id}
                </p>
              </div>
              <button
                onClick={() => setDetailsPrescription(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#8fa8a8",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "18px",
                }}
              >
                {[
                  ["Name", detailsPatient.name],
                  ["Patient ID", detailsPatient.id],
                  ["DOB", detailsPatient.dob || "—"],
                  ["Gender", detailsPatient.gender || "—"],
                  ["Blood Group", detailsPatient.bloodGroup || "—"],
                  ["Allergies", detailsPatient.allergies || "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: "11px",
                        color: "#8fa8a8",
                        textTransform: "uppercase",
                        fontWeight: "700",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#1a2b2b",
                        fontWeight: "600",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "14px" }}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "11px",
                    color: "#8fa8a8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Prescription Summary
                </p>
                <div
                  style={{
                    background: "#f8fbfb",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  {detailsPrescription.medications?.map((med, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom:
                          idx < detailsPrescription.medications.length - 1
                            ? "12px"
                            : 0,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#1a2b2b",
                        }}
                      >
                        {med.name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#5a7272",
                        }}
                      >
                        {med.detail ||
                          `${med.dosage || ""} ${med.frequency || ""}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => setDetailsPrescription(null)}
                  style={{
                    background: "#f8fbfb",
                    border: "1px solid #dde9e9",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    cursor: "pointer",
                    color: "#5a7272",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => handleAddPrescription(detailsPatient.id)}
                  style={{
                    background: "#005454",
                    border: "none",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                >
                  Create New Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
