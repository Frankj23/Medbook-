import { adminDb } from '../firebase/firebase-admin.js'

function getCollectionRef(name) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK is not initialized. Check your Firebase environment variables.')
  }
  return adminDb.collection(name)
}

export async function getCollection(name) {
  const snapshot = await getCollectionRef(name).get()
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getDocument(name, id) {
  const doc = await getCollectionRef(name).doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

export async function createDocument(name, data = {}) {
  const collection = getCollectionRef(name)
  const id = data.id || collection.doc().id
  const payload = { ...data, id, createdAt: data.createdAt || new Date().toISOString() }
  await collection.doc(id).set(payload)
  return payload
}

export async function updateDocument(name, id, updates = {}) {
  const docRef = getCollectionRef(name).doc(id)
  const document = await docRef.get()
  if (!document.exists) return null
  const updatedPayload = { ...updates, updatedAt: new Date().toISOString() }
  await docRef.update(updatedPayload)
  const updatedDoc = await docRef.get()
  return { id: updatedDoc.id, ...updatedDoc.data() }
}

export async function deleteDocument(name, id) {
  const docRef = getCollectionRef(name).doc(id)
  const document = await docRef.get()
  if (!document.exists) return false
  await docRef.delete()
  return true
}

export async function queryCollection(name, field, op, value) {
  const snapshot = await getCollectionRef(name).where(field, op, value).get()
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
