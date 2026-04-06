import { Router } from 'express'
import { listPrescriptions, getPrescriptionById, createPrescription, updatePrescription } from '../controllers/prescription.controller.js'

const router = Router()

router.get('/', listPrescriptions)
router.get('/:id', getPrescriptionById)
router.post('/', createPrescription)
router.put('/:id', updatePrescription)

export default router
