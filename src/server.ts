import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { apiRouter } from './interface/api'
import {
  errorMiddleware,
  notFoundMiddleware,
} from './middlewares/error.middleware'

// import connectDB from './config/db.js'
// import postgresPool from './config/postgres.js'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

// Middlewares
app.use(cors())
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'", // Nécessaire pour GraphiQL
          'https://unpkg.com', // Autoriser GraphiQL à charger ses scripts
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Nécessaire pour le CSS inline de GraphiQL
          'https://unpkg.com', // Autoriser GraphiQL à charger son CSS
        ],
        imgSrc: [
          "'self'",
          'data:', // Autoriser les images en base64
          'https://raw.githubusercontent.com', // Autoriser l'icône de GraphiQL
        ],
      },
    },
  })
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Routes
app.get('/test', (req, res) => {
  res.json({ result: 200 })
})

// Api routes
app.use('/api', apiRouter)

// Handle 404 errors
app.use(notFoundMiddleware)

// Handle all other errors
app.use(errorMiddleware)

const startServer = async () => {
  try {
    // await connectDB()

    // await postgresPool.query('SELECT 1')
    // console.log('✅ PostgreSQL connecté avec succès !')

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
      console.log(`📚 API is available at http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('❌ Échec du démarrage du serveur :', error)
    process.exit(1)
  }
}

startServer()
