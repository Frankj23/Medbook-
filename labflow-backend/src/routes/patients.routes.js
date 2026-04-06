import { Router } from 'express'
import { listPatients, getPatientById, createPatient } from '../controllers/patient.controller.js'

const router = Router()

router.get('/', listPatients)
router.get('/:id', getPatientById)
router.post('/', createPatient)

export default router
