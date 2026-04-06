import { Router } from 'express'
import { listUsers, createUser, updateUserRole, deleteUser } from '../controllers/user.controller.js'

const router = Router()

router.get('/', listUsers)
router.get('/:role', listUsers)
router.post('/', createUser)
router.put('/:id', updateUserRole)
router.delete('/:id', deleteUser)

export default router
