import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mountRoutes from './routes/index.js'
import { FRONTEND_URL, FRONTEND_URL_PROD } from './config.js'

const app = express()

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const allowedOrigins = [FRONTEND_URL, FRONTEND_URL_PROD, 'http://localhost:5173']
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true)
  }
  return callback(new Error('CORS policy does not allow this origin'))
}}))

mountRoutes(app)

app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }))

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

export default app;
