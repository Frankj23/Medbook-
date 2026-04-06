import { createDocument, getCollection, queryCollection } from '../services/firestore.service.js'
import { generateRoleId } from '../utils/idGenerator.js'

export async function login(req, res) {
  const { id, password } = req.body
  if (!id || !password) {
    return res.status(400).json({ error: 'ID and password are required' })
  }

  const users = await queryCollection('users', 'id', '==', id)
  const user = users[0]
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  return res.json({ user, token: `${user.id}.token` })
}

export async function registerRoleUser(req, res) {
  const { roleKey, name, email, password } = req.body
  if (!roleKey || !name || !email || !password) {
    return res.status(400).json({ error: 'roleKey, name, email, and password are required' })
  }

  const id = generateRoleId(roleKey)
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const user = await createDocument('users', {
    id,
    role: roleKey,
    name,
    email,
    initials,
    createdAt: new Date().toISOString(),
    password,
  })

  return res.status(201).json({ user })
}
