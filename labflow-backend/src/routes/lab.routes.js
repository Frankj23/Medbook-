import { Router } from 'express'
import { listLabOrders, getLabOrderById, createLabOrder, updateLabOrder, listLabResults, getLabResultById, createLabResult, updateLabResult } from '../controllers/lab.controller.js'

const router = Router()

router.get('/orders', listLabOrders)
router.get('/orders/:id', getLabOrderById)
router.post('/orders', createLabOrder)
router.put('/orders/:id', updateLabOrder)

router.get('/results', listLabResults)
router.get('/results/:id', getLabResultById)
router.post('/results', createLabResult)
router.put('/results/:id', updateLabResult)

export default router
