import { Router } from 'express'
import { login, registerRoleUser } from '../controllers/auth.controller.js'

const router = Router()

router.post('/login', login)
router.post('/register', registerRoleUser)

export default router
