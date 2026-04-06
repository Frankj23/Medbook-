import { useNavigate, Link } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext'

const BAR = Array.from({ length: 42 }, (_, i) =>
  [3, 2, 1, 3, 2, 1, 2, 3, 1, 2][i % 10]
)

function generateQrPattern(id) {
  return Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => ((row + col + id.length) % 2) === 0)
  )
}

export default function PrintIdPreview() {
  const navigate = useNavigate()
  const { patient } = usePatient()
  const qrPattern = generateQrPattern(patient?.id || 'PT0000')

  const handlePrint = () => {
    window.print()
  }

  const downloadCard = () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="330" height="520" viewBox="0 0 330 520" xmlns="http://www.w3.org/2000/svg">\n  <rect width="330" height="520" rx="24" fill="#ffffff" stroke="#005454" stroke-width="4"/>\n  <rect x="20" y="20" width="290" height="100" rx="18" fill="#005454"/>\n  <text x="35" y="55" font-family="Inter, sans-serif" font-size="18" fill="#fff">LabFlow ID Card</text>\n  <text x="35" y="82" font-family="Inter, sans-serif" font-size="12" fill="#d7f0f0">Port City General Hospital</text>\n  <text x="35" y="140" font-family="Inter, sans-serif" font-size="12" fill="#005454">PATIENT NAME</text>\n  <text x="35" y="165" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#1a2b2b">${patient?.name || 'Unknown Patient'}</text>\n  <text x="35" y="198" font-family="Inter, sans-serif" font-size="12" fill="#005454">PATIENT ID</text>\n  <text x="35" y="222" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#1a2b2b">${patient?.id || 'PT-0000'}</text>\n  <g transform="translate(35,250)">\n    ${qrPattern.map((row, r) => row.map((filled, c) => `<rect x="${c*18}" y="${r*18}" width="16" height="16" fill="${filled ? '#005454' : '#f6f6f6'}"/>`).join('')).join('')}\n  </g>\n  <text x="35" y="460" font-family="Inter, sans-serif" font-size="11" fill="#5a7272">Generated on ${new Date().toLocaleDateString()}</text>\n</svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${patient?.id || 'patient-id'}-card.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#c8d8d8', fontFamily: 'Inter, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @media print {
          body > *:not(#print-target) { display: none !important; }
          #print-target { display: block !important; position: static !important; }
          .back-to-index { display: none !important; }
        }
      `}</style>

      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '56px',
        background: 'linear-gradient(135deg,#005454,#0b6e6e)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>LabFlow</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500' }}>Patient Registration</span>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div id="print-target" className="lf-card" style={{ width: '100%', maxWidth: '520px', overflow: 'hidden' }}>

          {/* Modal body */}
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 4px' }}>
                  Print ID Card Preview
                </h3>
                <p style={{ color: '#5a7272', fontSize: '13px', margin: 0 }}>Verify layout before sending to printer.</p>
              </div>
              <button
                onClick={() => navigate('/register/success')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#5a7272', fontSize: '20px', lineHeight: 1, padding: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px',
                }}
              >×</button>
            </div>

            {/* ID Card preview */}
            <div style={{
              border: '1.5px solid #e0ecec', borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,84,84,0.10)', maxWidth: '340px', margin: '0 auto 24px',
            }}>
              {/* Card header */}
              <div style={{
                background: 'linear-gradient(135deg,#005454,#0b6e6e)',
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>LabFlow</span>
              </div>

              {/* Card body */}
              <div style={{ padding: '20px 18px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px' }}>
                      PATIENT NAME
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>{patient?.name || 'Unknown Patient'}</p>
                  </div>
                  {/* NFC icon */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#e8f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#005454" strokeWidth="2">
                      <path d="M20 12a8 8 0 0 0-8-8M16 12a4 4 0 0 0-4-4M12 12a0 0 0 0 0 0 0"/>
                      <circle cx="12" cy="12" r="1" fill="#005454"/>
                    </svg>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px' }}>
                    PATIENT ID
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#005454', letterSpacing: '0.04em', margin: '0 0 10px' }}>
                    {patient?.id || 'PT-0000'}
                  </p>
                  {/* Barcode */}
                  <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '36px' }}>
                    {BAR.map((h, i) => (
                      <div key={i} style={{
                        width: `${h}px`, height: '100%', background: '#1a2b2b', borderRadius: '1px',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-ghost" onClick={() => navigate('/register/success')}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handlePrint}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print ID Card
              </button>
            </div>
          </div>
        </div>
      </div>

      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

