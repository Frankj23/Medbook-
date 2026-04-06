import { Router } from 'express'
import { listConsultations, getConsultationById, createConsultation, updateConsultation } from '../controllers/consultation.controller.js'

const router = Router()

router.get('/', listConsultations)
router.get('/:id', getConsultationById)
router.post('/', createConsultation)
router.put('/:id', updateConsultation)

export default router
