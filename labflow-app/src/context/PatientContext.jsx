import { createContext, useContext, useState } from 'react'
import { getById, query } from '../services/db'

const PatientContext = createContext(null)

export function PatientProvider({ children }) {
  const [patient, setPatient] = useState(null)
  const [consultation, setConsultation] = useState({ symptoms: '', diagnosis: '', selectedTests: [] })

  const setPatientFromId = (id) => {
    const found = getById('patients', id)
    if (!found) return

    const triage = query('triages', t => t.patientId === id)[0]
    const vitals = triage ? {
      bp: triage.bp ? `${triage.bp} mmHg` : undefined,
      temp: triage.temp ? `${triage.temp}°C` : undefined,
      hr: triage.pulse ? `${triage.pulse} bpm` : undefined,
      weight: triage.weight ? `${triage.weight} kg` : undefined,
      spo2: triage.spo2 ? `${triage.spo2}%` : undefined,
    } : found.vitals

    setPatient({ ...found, vitals })
  }

  return (
    <PatientContext.Provider value={{ patient, setPatient, setPatientFromId, consultation, setConsultation }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() { return useContext(PatientContext) }
