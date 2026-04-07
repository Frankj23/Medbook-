import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  query,
  getById,
  getStats,
  fetchLabOrders,
  fetchPatients,
  fetchConsultations,
} from "../../services/db";
import { usePatient } from "../../context/PatientContext";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  {
    label: "Test Queue",
    active: true,
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    label: "Sample Collection",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 3H5a2 2 0 0 0-2 2v4" />
        <path d="M9 3v18m0 0h6M9 21H5a2 2 0 0 1-2-2V9" />
        <circle cx="16" cy="16" r="6" />
        <path d="M16 13v3l2 1" />
      </svg>
    ),
  },
  {
    label: "Archive",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="1 6 1 22 23 22 23 6" />
        <path d="M1 6l11 7 11-7M1 6h22" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function LabQueueDesktop() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setPatient } = usePatient();
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [labOrders, patients, consultations] = await Promise.all([
          fetchLabOrders(),
          fetchPatients(),
          fetchConsultations(),
        ]);

        const patientMap = new Map(patients.map((p) => [p.id, p]));
        const filteredLabOrders = labOrders.filter((r) =>
          ["pending_collection", "sample_collected", "processing"].includes(
            r.status,
          ),
        );

        const consultationRequests = consultations.filter(
          (c) =>
            c.status === "lab_requested" &&
            Array.isArray(c.selectedTests) &&
            c.selectedTests.length > 0,
        );

        const enrichedOrders = filteredLabOrders.map((r) => ({
          ...r,
          patient:
            r.patient ||
            patientMap.get(r.patientId) ||
            getById("patients", r.patientId),
          tests: r.tests || [],
        }));

        const ordersByConsultation = new Set(
          filteredLabOrders.map((r) => r.consultationId),
        );
        const enrichedConsultations = consultationRequests
          .filter((c) => !ordersByConsultation.has(c.id))
          .map((c) => ({
            ...c,
            patient:
              c.patient ||
              patientMap.get(c.patientId) ||
              getById("patients", c.patientId),
            tests: c.selectedTests || [],
            requestedBy: c.doctorName || "Doctor",
            requestedAt: c.createdAt,
            status: "pending_collection",
            priority: false,
            accessionNumber: null,
          }));

        setQueue([...enrichedOrders, ...enrichedConsultations]);
        setStats(getStats());
      } catch (error) {
        const labOrders = query("lab_orders", (r) =>
          ["pending_collection", "sample_collected", "processing"].includes(
            r.status,
          ),
        );
        const consultationRequests = query(
          "consultations",
          (c) =>
            c.status === "lab_requested" &&
            Array.isArray(c.selectedTests) &&
            c.selectedTests.length > 0,
        );

        const enrichedOrders = labOrders.map((r) => ({
          ...r,
          patient: getById("patients", r.patientId),
          tests: r.tests || [],
        }));

        const ordersByConsultation = new Set(
          labOrders.map((r) => r.consultationId),
        );
        const enrichedConsultations = consultationRequests
          .filter((c) => !ordersByConsultation.has(c.id))
          .map((c) => ({
            ...c,
            patient: getById("patients", c.patientId),
            tests: c.selectedTests || [],
            requestedBy: c.doctorName || "Doctor",
            requestedAt: c.createdAt,
            status: "pending_collection",
            priority: false,
            accessionNumber: null,
          }));

        setQueue([...enrichedOrders, ...enrichedConsultations]);
        setStats(getStats());
      }
    };

    load();
  }, []);

  const openResults = (req) => {
    if (req.patient) setPatient(req.patient);
    navigate("/lab/desktop/results");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        background: "#f6fafa",
      }}
    >
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{ fontSize: "18px", fontWeight: "800", color: "#005454" }}
            >
              LabFlow
            </span>
            <span style={{ color: "#dde9e9" }}>|</span>
            <span style={{ fontSize: "14px", color: "#5a7272" }}>
              Lab Portal
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1a2b2b",
                margin: 0,
              }}
            >
              {user?.name || "Alex Rivera"} · L3 Technician
            </p>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{
                padding: "10px 14px",
                border: "none",
                background: "#dc2626",
                color: "#fff",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              Logout
            </button>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#005454,#0b6e6e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: "#fff",
              }}
            >
              AR
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div
            className="lf-card"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#5a7272",
                  margin: "0 0 8px",
                }}
              >
                Ready to Process
              </p>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#1a2b2b",
                  margin: 0,
                }}
              >
                {queue.length}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#fff3dc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#fea619"
                strokeWidth="2"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </div>
          </div>
          <div
            className="lf-card"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#5a7272",
                  margin: "0 0 8px",
                }}
              >
                Resulted Today
              </p>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#1a2b2b",
                  margin: 0,
                }}
              >
                {stats.resultedToday || 0}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#e8f7ef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#1a7a4a"
                strokeWidth="2.5"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div
            className="lf-card"
            style={{
              padding: "20px",
              background: "linear-gradient(135deg,#005454,#0b6e6e)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: "0 0 6px",
                  }}
                >
                  Queue Status: Active
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.7)",
                    margin: 0,
                  }}
                >
                  {queue.filter((r) => r.priority === "stat").length} STAT ·{" "}
                  {queue.filter((r) => r.priority !== "stat").length} Routine
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#1a2b2b",
            margin: "0 0 4px",
          }}
        >
          Pending Tests Queue
        </h2>
        <p style={{ color: "#5a7272", fontSize: "13px", margin: "0 0 18px" }}>
          Samples collected — ready for processing
        </p>

        {queue.length === 0 ? (
          <div
            className="lf-card"
            style={{ padding: "40px", textAlign: "center" }}
          >
            <p style={{ color: "#8fa8a8", fontSize: "15px" }}>
              No samples ready to process.
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: "14px", justifyContent: "center" }}
              onClick={() => navigate("/sample-collection")}
            >
              Go to Sample Collection
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "16px",
            }}
          >
            {queue.map((item, i) => (
              <div
                key={item.id}
                className="lf-card"
                style={{
                  padding: "20px",
                  border:
                    item.priority === "stat" ? "2px solid #c62828" : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#1a2b2b",
                        margin: "0 0 3px",
                      }}
                    >
                      {item.patient?.name || "Unknown"}
                    </p>
                    <p
                      style={{ fontSize: "12px", color: "#8fa8a8", margin: 0 }}
                    >
                      ID: {item.patientId}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      alignItems: "flex-end",
                    }}
                  >
                    {item.priority === "stat" && (
                      <span
                        style={{
                          background: "#c62828",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: "800",
                        }}
                      >
                        STAT
                      </span>
                    )}
                    <span className="badge-pending">PENDING</span>
                  </div>
                </div>
                <div
                  style={{
                    background: "#f0f7f7",
                    borderRadius: "10px",
                    padding: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#5a7272",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      margin: "0 0 8px",
                    }}
                  >
                    TESTS
                  </p>
                  {item.tests?.map((t) => (
                    <div
                      key={t}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "3px",
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background:
                            item.priority === "stat" ? "#c62828" : "#005454",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "13px", color: "#1a2b2b" }}>
                        {t}
                      </span>
                    </div>
                  ))}
                </div>
                {item.accessionNumber && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#8fa8a8",
                      fontFamily: "monospace",
                      margin: "0 0 12px",
                    }}
                  >
                    ACC: {item.accessionNumber}
                  </p>
                )}
                <button
                  className="btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    fontSize: "13px",
                    padding: "11px",
                  }}
                  onClick={() => openResults(item)}
                >
                  Open &amp; Enter Results
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      {/* <Link to="/" className="back-to-index">← All screens</Link> */}
    </div>
  );
}
