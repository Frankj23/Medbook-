# 🏥 Medbook+ — Clinical Portal

> A full-featured clinical management frontend for doctors, lab technicians, and registration staff. Built for the **Stitch Soft Hackathon** using React + Vite + Tailwind CSS.

---

## 📋 Overview

LabFlow is a multi-role clinical portal that streamlines the patient journey from registration through lab testing to prescription. The interface is designed around the **"Clinical Sanctuary"** philosophy — a premium, calm, and authoritative medical UI that prioritizes clarity under pressure.

The project covers three distinct user roles across **14 fully implemented screens**:

| Role | Screens | Platform |
|------|---------|----------|
| 🩺 Doctor | Dashboard, Consultation, Lab Request, Prescription | Desktop |
| 📋 Registrar | Patient Registration, ID Generation, Print Preview | Mobile / Desktop |
| 🔬 Lab Technician | Test Queue, Results Entry | Mobile + Desktop |

---

## 🖥️ Screen Inventory

### Doctor Portal
| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard — Idle | `/doctor/dashboard` | Patient search entry point |
| Active Consultation | `/doctor/consultation` | Empty consultation form |
| Form Completion | `/doctor/consultation/notes` | Filled consultation + test selection |
| Request Confirmation | `/doctor/consultation/confirmed` | Lab request sent confirmation |

### Patient Registration
| Screen | Route | Description |
|--------|-------|-------------|
| Registration Form | `/register` | New patient form with live validation |
| Success — ID Generated | `/register/success` | MedBook+ record created |
| Print ID Card Preview | `/register/print` | ID card print dialog |

### Lab Technician — Mobile
| Screen | Route | Description |
|--------|-------|-------------|
| Pending Tests Queue | `/lab/queue` | Mobile queue list |
| Results Entry | `/lab/results` | Mobile results input |

### Lab Technician — Desktop
| Screen | Route | Description |
|--------|-------|-------------|
| Pending Tests Queue | `/lab/desktop/queue` | Desktop queue with sidebar |
| Results Entry | `/lab/desktop/results` | Desktop multi-field results input |

### Prescription Management
| Screen | Route | Description |
|--------|-------|-------------|
| Prescription Entry | `/doctor/prescription/entry` | Enter Rx from lab results |
| Prescription Confirmation | `/doctor/prescription/confirm` | Sent to pharmacy confirmation |
| Prescription History | `/doctor/prescription/history` | 24-month prescription archive |

---

## ⚙️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v3 + custom design tokens
- **Typography:** Inter (Google Fonts)
- **Icons:** Inline SVG (zero icon-library dependency)

---

## 🎨 Design System

The UI is built on a custom design token system called **"Soft Elevated"**:

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#005454` | Main teal — buttons, headers, active states |
| `primary-container` | `#0b6e6e` | Gradient partner for CTAs |
| `amber` | `#fea619` | Urgent actions only (Send to Lab, Print) |
| `background` | `#f6fafa` | App background — teal-tinted white |
| `surface` | `#ffffff` | Cards and panels |
| `surface-low` | `#f0f7f7` | Nested content zones |
| `on-surface` | `#1a2b2b` | Primary text |
| `on-muted` | `#5a7272` | Labels and secondary text |
| `danger` | `#c62828` | Validation errors |

**Key design rules:**
- No pure grey — all neutrals are tinted with teal
- No sharp corners — minimum `12px` border radius on all elements
- No dividers — surface-layer shifts define structure
- Amber is reserved for clinically urgent or action-critical buttons only

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/labflow-app.git

# 2. Navigate into the project
cd labflow-app

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

You will land on the **Screen Navigator** — a hub that links to all 14 screens for easy demo access.

### Build for Production

```bash
npm run build
```

Output is placed in the `dist/` folder, ready to deploy to any static host (Vercel, Netlify, etc.).

---

## 📁 Project Structure

```
labflow-app/
├── index.html                    # App entry with Google Fonts
├── vite.config.js
├── tailwind.config.js            # Custom design tokens
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                  # React root
    ├── App.jsx                   # Router + all routes
    ├── index.css                 # Global styles + Tailwind
    └── screens/
        ├── ScreenIndex.jsx               # Demo navigator
        ├── DashboardIdle.jsx             # Doctor: patient search
        ├── ActiveConsultation.jsx        # Doctor: consultation form
        ├── FormCompletion.jsx            # Doctor: filled notes
        ├── RequestConfirmation.jsx       # Doctor: lab request sent
        ├── PatientRegistration.jsx       # Registrar: new patient
        ├── SuccessGeneration.jsx         # Registrar: ID created
        ├── PrintIdPreview.jsx            # Registrar: print dialog
        ├── LabQueue.jsx                  # Lab tech: mobile queue
        ├── ResultsEntry.jsx              # Lab tech: mobile results
        ├── LabQueueDesktop.jsx           # Lab tech: desktop queue
        ├── ResultsEntryDesktop.jsx       # Lab tech: desktop results
        ├── PrescriptionEntry.jsx         # Doctor: write prescription
        ├── PrescriptionConfirmation.jsx  # Doctor: Rx sent
        └── PrescriptionHistory.jsx       # Doctor: Rx archive
```

---

## 🔌 Connecting to a Backend

Every screen that submits data has a clearly named handler function (`handleSearch`, `handleSubmit`, `handleSend`). Replace these with your API calls.

**Example — Active Consultation (`ActiveConsultation.jsx`):**

```js
// Before (navigation only)
const handleSend = () => navigate('/doctor/consultation/notes')

// After (with API call)
const handleSend = async () => {
  const res = await fetch('/api/consultations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: 'PT-8842',
      symptoms,
      diagnosis,
      tests: selected,
    }),
  })
  const data = await res.json()
  navigate(`/doctor/consultation/notes?id=${data.consultationId}`)
}
```

**Example — Patient Registration (`PatientRegistration.jsx`):**

```js
const handleSubmit = async () => {
  setSubmitted(true)
  if (hasErrors) return

  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  const data = await res.json()
  navigate(`/register/success?patientId=${data.id}`)
}
```

**Example — Submit Lab Results (`ResultsEntry.jsx`):**

```js
const handleSubmit = async () => {
  if (!reviewed) return

  await fetch(`/api/results/${caseId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ malariaResult, hemoglobin }),
  })
  navigate('/lab/queue')
}
```

---

## 🧩 Key Components & Patterns

### Reusable CSS Classes (defined in `index.css`)

| Class | Element |
|-------|---------|
| `.lf-card` | White card with teal-tinted shadow |
| `.lf-input` | Standard text input |
| `.lf-textarea` | Multi-line textarea |
| `.btn-primary` | Teal gradient button |
| `.btn-amber` | Amber CTA button (urgent actions) |
| `.btn-ghost` | Transparent teal text button |
| `.badge-pending` | Amber pill badge |
| `.badge-success` | Green pill badge |
| `.badge-active` | Teal pill badge |
| `.back-to-index` | Fixed "← All screens" dev nav pill |

### Shared Patterns

- **Two-column layouts** (patient card + form) used across Doctor Portal screens
- **Sidebar + main** pattern used across all Desktop screens
- **Teal topbar** used across all Registration and Lab mobile screens
- **White topbar** used across all Doctor Portal screens

---

## 🗺️ Planned / Next Steps

- [ ] Connect all screens to REST API or Supabase
- [ ] Add authentication (JWT / session-based)
- [ ] Persist patient state across consultation flow with Context API or Zustand
- [ ] Add loading states and error boundaries on all form submissions
- [ ] Make mobile screens fully responsive on tablet breakpoints
- [ ] Add notification system for real-time lab result alerts
- [ ] Implement barcode scanner integration on Print ID screen

---

## 🏆 Hackathon

Built for the **Stitch Soft Elevated Registration** hackathon track.

- **Design System:** The Clinical Sanctuary — Soft Elevated
- **Theme:** Premium, calm, authoritative clinical interface
- **Target Users:** Doctors, lab technicians, registration staff in clinical settings

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
