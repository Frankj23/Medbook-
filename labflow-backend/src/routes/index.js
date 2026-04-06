import authRoutes from './auth.routes.js'
import patientRoutes from './patients.routes.js'
import userRoutes from './users.routes.js'
import labRoutes from './lab.routes.js'
import consultationRoutes from './consultations.routes.js'
import triageRoutes from './triages.routes.js'
import prescriptionRoutes from './prescriptions.routes.js'

export default function mountRoutes(app) {
  app.use('/api/auth', authRoutes)
  app.use('/api/patients', patientRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/lab', labRoutes)
  app.use('/api/consultations', consultationRoutes)
  app.use('/api/triages', triageRoutes)
  app.use('/api/prescriptions', prescriptionRoutes)
}
