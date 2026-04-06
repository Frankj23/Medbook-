import { createDocument, getCollection, queryCollection } from '../services/firestore.service.js'
import { generateRoleId } from '../utils/idGenerator.js'

export async function login(req, res) {
  const { roleKey, email } = req.body
  if (!roleKey) {
    return res.status(400).json({ error: 'roleKey is required' })
  }

  let users = []
  if (email) {
    users = await queryCollection('users', 'email', '==', email)
  } else {
    const allUsers = await getCollection('users')
    users = allUsers.filter(u => u.role === roleKey)
  }

  const user = users.find(u => u.role === roleKey) || users[0]
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
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
