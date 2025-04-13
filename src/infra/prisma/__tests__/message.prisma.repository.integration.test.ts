import { randomUUID } from 'crypto'
import { PrismaClient } from '../generated/client'
import { PrismaMessageRepository } from '../message.prisma.repository'
import { Message } from '../../../domain/message'
import { execSync } from 'child_process'
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

describe('PrismaMessageRepository Integration Tests', () => {
  let container: StartedTestContainer
  let prisma: PrismaClient
  let repository: PrismaMessageRepository
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
    repository = new PrismaMessageRepository()

    // Créer un utilisateur de test dans la base de données
    await prisma.user.create({
      data: {
        name: 'testUser',
      },
    })
  }, 60000) // Augmenter le timeout pour le démarrage du conteneur

  afterAll(async () => {
    await prisma.$disconnect()
    await container.stop()
  })

  beforeEach(async () => {
    // Nettoyer les messages avant chaque test
    await prisma.message.deleteMany()
  })

  it('should save a new message and retrieve it by id', async () => {
    // Arrange
    const messageId = randomUUID()
    const message = Message.fromData({
      id: messageId,
      author: 'testUser',
      text: 'Hello, this is a test message',
      publishedAt: new Date(),
    })

    // Act
    await repository.save(message)
    const retrievedMessage = await repository.getById(messageId)

    // Assert
    expect(retrievedMessage.id).toBe(message.id)
    expect(retrievedMessage.author).toBe(message.author)
    expect(retrievedMessage.text).toBe(message.text)
    expect(retrievedMessage.publishedAt.getTime()).toBe(
      message.publishedAt.getTime()
    )
  })

  it('should update an existing message', async () => {
    // Arrange
    const messageId = randomUUID()
    const message = Message.fromData({
      id: messageId,
      author: 'testUser',
      text: 'Original message',
      publishedAt: new Date(),
    })

    // Act - Save the original message
    await repository.save(message)

    // Modify and save again
    message.editText('Updated message')
    await repository.save(message)

    // Retrieve the updated message
    const retrievedMessage = await repository.getById(messageId)

    // Assert
    expect(retrievedMessage.text).toBe('Updated message')
  })

  it('should throw error when getting a non-existent message', async () => {
    // Act & Assert
    await expect(repository.getById('non-existent-id')).rejects.toThrow(
      'Message with id non-existent-id not found'
    )
  })

  it('should retrieve all messages of a user', async () => {
    // Arrange
    const messageId1 = randomUUID()
    const messageId2 = randomUUID()

    const message1 = Message.fromData({
      id: messageId1,
      author: 'testUser',
      text: 'First message',
      publishedAt: new Date(),
    })

    const message2 = Message.fromData({
      id: messageId2,
      author: 'testUser',
      text: 'Second message',
      publishedAt: new Date(),
    })

    // Act
    await repository.save(message1)
    await repository.save(message2)

    const messages = await repository.getAllOfUser('testUser')

    // Assert
    expect(messages).toHaveLength(2)
    expect(messages.map((m) => m.id)).toEqual(
      expect.arrayContaining([messageId1, messageId2])
    )
  })

  it('should return an empty array when user has no messages', async () => {
    // Act
    const messages = await repository.getAllOfUser('userWithNoMessages')

    // Assert
    expect(messages).toHaveLength(0)
  })
})
