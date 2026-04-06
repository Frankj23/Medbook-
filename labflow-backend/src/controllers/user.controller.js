import { createDocument, getCollection, getDocument, queryCollection, updateDocument, deleteDocument } from '../services/firestore.service.js'
import { generateRoleId } from '../utils/idGenerator.js'

export async function listUsers(req, res) {
  const role = req.params.role || req.query.role
  let users = await getCollection('users')
  if (role) {
    users = users.filter(u => u.role === role)
  }
  return res.json({ users })
}

export async function createUser(req, res) {
  const { role, name, email } = req.body
  if (!role || !name || !email) {
    return res.status(400).json({ error: 'Role, name, and email are required' })
  }

  const id = generateRoleId(role)
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const user = await createDocument('users', {
    id,
    role,
    name,
    email,
    initials,
    createdAt: new Date().toISOString(),
  })

  return res.status(201).json({ user })
}

export async function updateUserRole(req, res) {
  const { id } = req.params
  const { role } = req.body
  const user = await updateDocument('users', id, { role })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  return res.json({ user })
}

export async function deleteUser(req, res) {
  const { id } = req.params
  const deleted = await deleteDocument('users', id)
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' })
  }
  return res.status(204).end()
}
