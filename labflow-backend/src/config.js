import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
export const FRONTEND_URL_PROD = process.env.FRONTEND_URL_PROD || 'https://your-hostinger-frontend-url.com'
export const BACKEND_URL_PROD = process.env.BACKEND_URL_PROD || 'https://your-hostinger-backend-url.com'
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY
