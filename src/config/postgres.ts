import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
})

pool.on('connect', () => {
  console.log('✅ PostgreSQL connecté avec succès !')
})

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err)
  process.exit(1)
})

export default pool
