export function generateRoleId(roleKey) {
  const prefix = {
    nurse: 'NS',
    doctor: 'DR',
    lab_tech: 'LB',
    admin: 'AD',
    patient: 'PT',
    receptionist: 'RC',
  }[roleKey] || 'US'

  const value = Math.floor(Math.random() * 900000) + 100000
  return `${prefix}-${value}`
}

export function generatePatientId() {
  return generateRoleId('patient')
}

export function generateAccessId() {
  return `ACC-${Math.floor(Math.random() * 900000) + 100000}`
}
