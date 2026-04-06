import { createDocument, getCollection, queryCollection } from '../services/firestore.service.js'
import { generateRoleId } from '../utils/idGenerator.js'

function getCollectionByPrefix(id) {
  if (id.startsWith('DR-')) return 'doctors'
  if (id.startsWith('AD-')) return 'admins'
  if (id.startsWith('LB-')) return 'labtechs'
  if (id.startsWith('NS-')) return 'nurses'
  if (id.startsWith('PT-')) return 'patients'
  if (id.startsWith('RC-')) return 'receptionists'
  return null
}

function getRoleFromPrefix(id) {
  if (id.startsWith('DR-')) return 'doctor'
  if (id.startsWith('AD-')) return 'admin'
  if (id.startsWith('LB-')) return 'lab_tech'
  if (id.startsWith('NS-')) return 'nurse'
  if (id.startsWith('PT-')) return 'patient'
  if (id.startsWith('RC-')) return 'receptionist'
  return null
}

export async function login(req, res) {
  const { id, password } = req.body
  if (!id || !password) {
    return res.status(400).json({ error: 'ID and password are required' })
  }

  const collectionName = getCollectionByPrefix(id)
  if (!collectionName) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  const users = await queryCollection(collectionName, 'id', '==', id)
  const user = users[0]
  
  if (!user) {
    return res.status(404).json({ error: 'User ID not found' })
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  const role = getRoleFromPrefix(id)
  return res.json({ 
    user: {
      ...user,
      role,
      id: user.id,
      name: user.name,
      email: user.email || ''
    }, 
    token: `${user.id}.token` 
  })
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
