import { PrismaClient } from '../../infra/prisma/generated/client'
import { execSync } from 'child_process'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

export interface TestDatabase {
  container: StartedTestContainer
  prisma: PrismaClient
  connectionString: string
}

export async function setupTestDatabase(): Promise<TestDatabase> {
  // Démarrage d'un conteneur PostgreSQL pour les tests
  const container = await new GenericContainer('postgres:16')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER: 'testuser',
      POSTGRES_PASSWORD: 'testpass',
      POSTGRES_DB: 'testdb',
    })
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections')
    )
    .start()

  // Récupérer l'adresse et le port mappé
  const host = container.getHost()
  const port = container.getMappedPort(5432)

  // Construire la chaîne de connexion pour Prisma
  const connectionString = `postgresql://testuser:testpass@${host}:${port}/testdb`

  // Définir la variable d'environnement pour Prisma
  process.env.DATABASE_URL = connectionString

  // Créer les tables avec prisma db push
  try {
    execSync('npx prisma db push --force-reset', {
      env: process.env,
      stdio: 'inherit',
    })
  } catch (error) {
    console.error('Error running prisma db push:', error)
  }

  // Initialiser le client Prisma
  const prisma = new PrismaClient()

  return { container, prisma, connectionString }
}

export async function teardownTestDatabase(
  testDb: TestDatabase
): Promise<void> {
  await testDb.prisma.$disconnect()
  await testDb.container.stop()
}
