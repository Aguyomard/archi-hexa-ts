import { PrismaClient } from '../generated/client'
import { PrismaFolloweeRepository } from '../followee.prisma.repository'
import { execSync } from 'child_process'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'
import { Followee } from '../../../application/secondaryPorts/followee.repository'

describe('PrismaFolloweeRepository Integration Tests', () => {
  let container: StartedTestContainer
  let prisma: PrismaClient
  let repository: PrismaFolloweeRepository
  let connectionString: string

  beforeAll(async () => {
    // Démarrage d'un conteneur PostgreSQL pour les tests
    container = await new GenericContainer('postgres:16')
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
    connectionString = `postgresql://testuser:testpass@${host}:${port}/testdb`

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

    // Initialiser le client Prisma et le repository
    prisma = new PrismaClient()
    repository = new PrismaFolloweeRepository()
  }, 60000) // Augmenter le timeout pour le démarrage du conteneur

  afterAll(async () => {
    await prisma.$disconnect()
    await container.stop()
  })

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await prisma.user.deleteMany()
  })

  it('should save a new followee relationship', async () => {
    // Arrange
    const user = 'alice'
    const followeeUser = 'bob'
    const followee: Followee = { user, followee: followeeUser }

    // Act
    await repository.saveFollowee(followee)
    const followees = await repository.getFolloweesOf(user)

    // Assert
    expect(followees).toContain(followeeUser)
    expect(followees.length).toBe(1)
  })

  it('should handle multiple followees for a user', async () => {
    // Arrange
    const user = 'alice'
    const followee1 = 'bob'
    const followee2 = 'charlie'
    const followee3 = 'david'

    // Act
    await repository.saveFollowee({ user, followee: followee1 })
    await repository.saveFollowee({ user, followee: followee2 })
    await repository.saveFollowee({ user, followee: followee3 })

    const followees = await repository.getFolloweesOf(user)

    // Assert
    expect(followees).toContain(followee1)
    expect(followees).toContain(followee2)
    expect(followees).toContain(followee3)
    expect(followees.length).toBe(3)
  })

  it('should return empty array for user with no followees', async () => {
    // Arrange
    const user = 'lonelyUser'

    // Act
    const followees = await repository.getFolloweesOf(user)

    // Assert
    expect(followees).toEqual([])
  })

  it('should handle bidirectional following relationships', async () => {
    // Arrange
    const user1 = 'alice'
    const user2 = 'bob'

    // Act - Create bidirectional relationship
    await repository.saveFollowee({ user: user1, followee: user2 })
    await repository.saveFollowee({ user: user2, followee: user1 })

    const followeesOfUser1 = await repository.getFolloweesOf(user1)
    const followeesOfUser2 = await repository.getFolloweesOf(user2)

    // Assert
    expect(followeesOfUser1).toContain(user2)
    expect(followeesOfUser2).toContain(user1)
  })

  it('should not duplicate followee relationships', async () => {
    // Arrange
    const user = 'alice'
    const followeeUser = 'bob'
    const followee: Followee = { user, followee: followeeUser }

    // Act - Save the same relationship twice
    await repository.saveFollowee(followee)
    await repository.saveFollowee(followee)

    const followees = await repository.getFolloweesOf(user)

    // Assert - Only one relationship should exist
    expect(followees).toEqual([followeeUser])
    expect(followees.length).toBe(1)
  })
})
