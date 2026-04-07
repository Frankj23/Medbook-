import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePatient } from "../../context/PatientContext";
import { query, getAll, getById, formatTime } from "../../services/db";

export default function DashboardIdle() {
  const { user, logout } = useAuth();
  const { setPatientFromId } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [recentPatients, setRecentPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [pendingResults, setPendingResults] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const isRecent = (iso) => {
    if (!iso) return false;
    const date = new Date(iso);
    return date >= last24Hours;
  };

  const load = () => {
    const patients = query("patients", (p) => isRecent(p.createdAt)).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    setRecentPatients(patients);

    const recentPatientIds = new Set(patients.map((p) => p.id));
    const doctorCons = user
      ? query(
          "consultations",
          (c) => c.doctorId === user.id && recentPatientIds.has(c.patientId),
        )
      : [];

    setConsultations(
      doctorCons.map((c) => ({
        ...c,
        patient: getById("patients", c.patientId),
      })),
    );

    const unreviewed = query("lab_results", (r) => {
      if (r.reviewedByDoctor) return false;
      if (!recentPatientIds.has(r.patientId)) return false;
      const order = getById("lab_orders", r.labOrderId);
      const consult = order
        ? getById("consultations", order.consultationId)
        : null;
      return consult?.doctorId === user?.id;
    }).map((r) => ({ ...r, patient: getById("patients", r.patientId) }));
    setPendingResults(unreviewed);
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const patientEntries = recentPatients.map((patient) => ({
    patient,
    consultation: consultations.find((c) => c.patientId === patient.id) || null,
  }));

  const handleSearch = () => {
    const q = search.trim();
    if (!q) return;
    const patients = query(
      "patients",
      (p) =>
        p.id.toLowerCase().includes(q.toLowerCase()) ||
        p.name.toLowerCase().includes(q.toLowerCase()),
    );
    if (patients.length > 0) {
      setPatientFromId(patients[0].id);
      navigate("/doctor/consultation");
    }
  };

  const statusStyle = {
    results_ready: {
      label: "Results Ready",
      bg: "#fff0f0",
      color: "#c62828",
      dot: "#c62828",
    },
    collected: {
      label: "In Lab",
      bg: "#e6f4f4",
      color: "#005454",
      dot: "#005454",
    },
    pending_collection: {
      label: "Pending Collection",
      bg: "#fff3dc",
      color: "#854F0B",
      dot: "#d97706",
    },
    lab_requested: {
      label: "Lab Requested",
      bg: "#e6f4f4",
      color: "#005454",
      dot: "#005454",
    },
    prescribed: {
      label: "Prescribed",
      bg: "#e8f7ef",
      color: "#1a7a4a",
      dot: "#1a7a4a",
    },
    completed: {
      label: "Completed",
      bg: "#e8f7ef",
      color: "#1a7a4a",
      dot: "#1a7a4a",
    },
    new_patient: {
      label: "New Patient",
      bg: "#eff7f2",
      color: "#1a7a4a",
      dot: "#1a7a4a",
    },
  };

  const doctorLinks = [
    { label: "Dashboard", path: "/doctor/dashboard" },
    { label: "Active Consultation", path: "/doctor/consultation" },
    // { label: 'Review & Confirm',         path: '/doctor/consultation/notes' },
    // { label: 'Lab Request Sent',         path: '/doctor/consultation/confirmed' },
    { label: "Results Inbox", path: "/doctor/results-inbox" },
    { label: "Prescription Entry", path: "/doctor/prescription/entry" },
    { label: "Prescription Confirmed", path: "/doctor/prescription/confirm" },
    { label: "Prescription History", path: "/doctor/prescription/history" },
  ];

  const filtered = patientEntries.filter(
    (entry) =>
      !search ||
      entry.patient?.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.patient?.id?.toLowerCase().includes(search.toLowerCase()),
  );

  const statusFiltered = statusFilter
    ? filtered.filter(({ consultation }) => {
        if (statusFilter === "new_patient") return !consultation;
        return consultation?.status === statusFilter;
      })
    : filtered;

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
          }}
        >
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            style={{
              width: "40px",
              height: "40px",
              border: "1px solid #e8f2f2",
              background: "#fff",
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Toggle doctor menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#005454"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
          {sidebarOpen && (
            <div
              style={{
                position: "absolute",
                top: "52px",
                left: 0,
                width: "260px",
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 18px 40px rgba(0,84,84,0.12)",
                border: "1px solid #e8f2f2",
                padding: "16px",
                zIndex: 20,
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1a2b2b",
                  margin: "0 0 14px",
                }}
              >
                Doctor Menu
              </h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {doctorLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: "block",
                      padding: "11px 14px",
                      borderRadius: "12px",
                      background:
                        item.path === location.pathname ? "#e6f4f4" : "#f8fbfb",
                      border: "1px solid #e8f2f2",
                      color: "#1a2b2b",
                      fontWeight: item.path === location.pathname ? 700 : 600,
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
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
            Doctor Portal
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#5a7272" }}>
            {user ? user.name : "Dr. Sarah Jenkins"}
          </span>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#e0f2f2",
              border: "2px solid #b0d8d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              color: "#005454",
            }}
          >
            {user ? user.initials : "SJ"}
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              color: "#8fa8a8",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div
        style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}
      >
        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          {[
            {
              label: "Recent Patients",
              value: recentPatients.length,
              color: "#005454",
            },
            {
              label: "Doctor Consultations",
              value: consultations.length,
              color: "#005454",
            },
            {
              label: "In Lab",
              value: consultations.filter(
                (c) => c.status === "collected" || c.status === "lab_requested",
              ).length,
              color: "#854F0B",
            },
            {
              label: "Results Ready",
              value: pendingResults.length,
              color: pendingResults.length > 0 ? "#c62828" : "#1a7a4a",
            },
          ].map((s) => (
            <div key={s.label} className="lf-card" style={{ padding: "18px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#8fa8a8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 6px",
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: s.color,
                  margin: 0,
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Results inbox alert */}
        {pendingResults.length > 0 && (
          <div
            style={{
              background: "#fff0f0",
              border: "1.5px solid #fca5a5",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#c62828"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#c62828",
                  margin: 0,
                }}
              >
                {pendingResults.length} lab result
                {pendingResults.length > 1 ? "s" : ""} awaiting your review
              </p>
            </div>
            <button
              className="btn-primary"
              style={{
                background: "linear-gradient(135deg,#c62828,#e53935)",
                fontSize: "13px",
                padding: "10px 18px",
                position: "relative",
              }}
              onClick={() => navigate("/doctor/results-inbox")}
            >
              {pendingResults.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    left: "-12px",
                    top: "10px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "999px",
                    background: "#c62828",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "12px",
                    fontWeight: "800",
                  }}
                >
                  +
                </span>
              )}
              Review Now →
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1a2b2b",
                  margin: 0,
                }}
              >
                Patients in the Last 24 Hours
              </h2>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "12px" }}>
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
                placeholder="Search patient name or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ paddingLeft: "40px" }}
              />
            </div>

            {/* Status Filter */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "All", value: null },
                { label: "New Patient", value: "new_patient" },
                { label: "Lab Requested", value: "lab_requested" },
                { label: "Results Ready", value: "results_ready" },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setStatusFilter(value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e8f2f2",
                    background: statusFilter === value ? "#e6f4f4" : "#fff",
                    color: "#1a2b2b",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: statusFilter === value ? 700 : 600,
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {statusFiltered.length === 0 ? (
                <div
                  className="lf-card"
                  style={{ padding: "32px", textAlign: "center" }}
                >
                  <p style={{ color: "#8fa8a8", margin: 0 }}>
                    No recent patients found.
                  </p>
                </div>
              ) : (
                statusFiltered.map(({ patient, consultation }) => {
                  const ss = consultation
                    ? statusStyle[consultation.status] || statusStyle.completed
                    : statusStyle.new_patient;
                  return (
                    <div
                      key={patient.id}
                      className="lf-card"
                      style={{ padding: "16px", cursor: "pointer" }}
                      onClick={() => {
                        setPatientFromId(patient.id);
                        if (consultation?.status === "results_ready") {
                          navigate("/doctor/prescription/confirm");
                        } else {
                          navigate("/doctor/consultation");
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg,#005454,#0b6e6e)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            {patient?.initials || "??"}
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: "15px",
                                fontWeight: "700",
                                color: "#1a2b2b",
                                margin: "0 0 2px",
                              }}
                            >
                              {patient?.name || patient.id}
                            </p>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#8fa8a8",
                                margin: 0,
                              }}
                            >
                              {patient.id} · {formatTime(patient.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{
                              background: ss.bg,
                              color: ss.color,
                              padding: "4px 12px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: ss.dot,
                              }}
                            />
                            {ss.label}
                          </span>
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#8fa8a8"
                            strokeWidth="2"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Quick search / new */}
            <div className="lf-card" style={{ padding: "20px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1a2b2b",
                  margin: "0 0 12px",
                }}
              >
                Quick Patient Lookup
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  className="lf-input"
                  placeholder="ID or name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{ flex: 1, fontSize: "13px" }}
                />
                <button
                  className="btn-primary"
                  style={{ fontSize: "13px", padding: "10px 14px" }}
                  onClick={handleSearch}
                >
                  Go
                </button>
              </div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#8fa8a8",
                  margin: "8px 0 0",
                }}
              >
                Try: PT-8842, PT-9012
              </p>
            </div>

            {/* Pending results */}
            {pendingResults.length > 0 && (
              <div className="lf-card" style={{ padding: "20px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#c62828",
                    margin: "0 0 12px",
                  }}
                >
                  ⚠ Results Awaiting Review
                </h3>
                {pendingResults.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f7f7",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#fff0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#c62828",
                        flexShrink: 0,
                      }}
                    >
                      {r.patient?.initials || "??"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#1a2b2b",
                          margin: 0,
                        }}
                      >
                        {r.patient?.name}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#8fa8a8",
                          margin: 0,
                        }}
                      >
                        {r.results.length} results
                      </p>
                    </div>
                    <button
                      style={{
                        background: "#c62828",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                      onClick={() => navigate("/doctor/results-inbox")}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Navigate shortcuts */}
            <div className="lf-card" style={{ padding: "20px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1a2b2b",
                  margin: "0 0 12px",
                }}
              >
                Quick Links
              </h3>
              {[
                {
                  label: "Results Inbox",
                  path: "/doctor/results-inbox",
                  badge: pendingResults.length,
                },
                {
                  label: "Prescription History",
                  path: "/doctor/prescription/history",
                  badge: null,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    background: "#f8fbfb",
                    border: "1px solid #e8f2f2",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    marginBottom: "8px",
                    color: "#1a2b2b",
                    fontWeight: "600",
                  }}
                >
                  {item.label}
                  {item.badge > 0 && (
                    <span
                      style={{
                        background: statusStyle.results_ready.bg,
                        color: statusStyle.results_ready.color,
                        borderRadius: "999px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: statusStyle.results_ready.dot,
                        }}
                      />
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <Link to="/" className="back-to-index">← All screens</Link> */}
    </div>
  );
}
