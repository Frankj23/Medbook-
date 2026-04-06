import { Router } from 'express'
import { listTriages, createTriage } from '../controllers/triage.controller.js'

const router = Router()

router.get('/', listTriages)
router.post('/', createTriage)

export default router
