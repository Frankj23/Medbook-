export const labOrderSchema = {
  id: 'string',
  patientId: 'string',
  consultationId: 'string',
  tests: ['string'],
  requestedBy: 'string',
  requestedAt: 'string',
  status: 'pending_collection|collected|completed',
  stat: 'boolean',
  accessionId: 'string|null',
  collectedBy: 'string|null',
  collectedAt: 'string|null',
}

export const labResultSchema = {
  id: 'string',
  labOrderId: 'string',
  patientId: 'string',
  results: [
    {
      test: 'string',
      value: 'string',
      unit: 'string',
      ref: 'string',
      flag: 'string',
    },
  ],
  techNotes: 'string',
  submittedBy: 'string',
  submittedAt: 'string',
  reviewedByDoctor: 'boolean',
}

export const labTechnicianUserSchema = {
  id: 'string',
  role: 'lab_tech',
  name: 'string',
  email: 'string',
  password: 'string',
  initials: 'string',
  createdAt: 'string',
}
