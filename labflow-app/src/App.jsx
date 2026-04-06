import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PatientProvider } from './context/PatientContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import ScreenIndex from './screens/ScreenIndex'
import Login from './screens/auth/Login'
import DashboardIdle from './screens/doctor/DashboardIdle'
import ActiveConsultation from './screens/doctor/ActiveConsultation'
import FormCompletion from './screens/doctor/FormCompletion'
import RequestConfirmation from './screens/doctor/RequestConfirmation'
import PatientRegistration from './screens/patient/PatientRegistration'
import SuccessGeneration from './screens/patient/SuccessGeneration'
import PrintIdPreview from './screens/patient/PrintIdPreview'
import NurseTriage from './screens/nurse/NurseTriage'
import SampleCollection from './screens/nurse/SampleCollection'
import LabQueue from './screens/lab/LabQueue'
import ResultsEntry from './screens/lab/ResultsEntry'
import LabQueueDesktop from './screens/lab/LabQueueDesktop'
import ResultsEntryDesktop from './screens/lab/ResultsEntryDesktop'
import DoctorResultsInbox from './screens/doctor/DoctorResultsInbox'
import PrescriptionEntry from './screens/doctor/PrescriptionEntry'
import PrescriptionConfirmation from './screens/doctor/PrescriptionConfirmation'
import PrescriptionHistory from './screens/doctor/PrescriptionHistory'
import AdminDashboard from './screens/admin/AdminDashboard'
import PatientDischarge from './screens/patient/PatientDischarge'

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoute><ScreenIndex /></ProtectedRoute>} />
            <Route path="/register" element={<ProtectedRoute><PatientRegistration /></ProtectedRoute>} />
            <Route path="/register/success" element={<ProtectedRoute><SuccessGeneration /></ProtectedRoute>} />
            <Route path="/register/print" element={<ProtectedRoute><PrintIdPreview /></ProtectedRoute>} />
            <Route path="/nurse/triage" element={<ProtectedRoute><NurseTriage /></ProtectedRoute>} />
            <Route path="/nurse/sample" element={<ProtectedRoute><SampleCollection /></ProtectedRoute>} />
            <Route path="/doctor/dashboard" element={<ProtectedRoute><DashboardIdle /></ProtectedRoute>} />
            <Route path="/doctor/consultation" element={<ProtectedRoute><ActiveConsultation /></ProtectedRoute>} />
            <Route path="/doctor/consultation/notes" element={<ProtectedRoute><FormCompletion /></ProtectedRoute>} />
            <Route path="/doctor/consultation/confirmed" element={<ProtectedRoute><RequestConfirmation /></ProtectedRoute>} />
            <Route path="/doctor/results-inbox" element={<ProtectedRoute><DoctorResultsInbox /></ProtectedRoute>} />
            <Route path="/doctor/prescription/entry" element={<ProtectedRoute><PrescriptionEntry /></ProtectedRoute>} />
            <Route path="/doctor/prescription/confirm" element={<ProtectedRoute><PrescriptionConfirmation /></ProtectedRoute>} />
            <Route path="/doctor/prescription/history" element={<ProtectedRoute><PrescriptionHistory /></ProtectedRoute>} />
            <Route path="/lab/queue" element={<ProtectedRoute><LabQueue /></ProtectedRoute>} />
            <Route path="/lab/results" element={<ProtectedRoute><ResultsEntry /></ProtectedRoute>} />
            <Route path="/lab/desktop/queue" element={<ProtectedRoute><LabQueueDesktop /></ProtectedRoute>} />
            <Route path="/lab/desktop/results" element={<ProtectedRoute><ResultsEntryDesktop /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/patient/discharge" element={<ProtectedRoute><PatientDischarge /></ProtectedRoute>} />
          </Routes>
        </Router>
      </PatientProvider>
    </AuthProvider>
  )
}
