import { randomUUID } from 'crypto'
import { PrismaClient } from '../../infra/prisma/generated/client'
import { PrismaMessageRepository } from '../../infra/prisma/message.prisma.repository'
import { Message } from '../../domain/message'
import {
  TestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from './test-utils'

describe('PrismaMessageRepository Integration Tests', () => {
  let testDb: TestDatabase
  let prisma: PrismaClient
  let repository: PrismaMessageRepository

  beforeAll(async () => {
    testDb = await setupTestDatabase()
    prisma = testDb.prisma
    repository = new PrismaMessageRepository()

    // Créer un utilisateur de test dans la base de données
    await prisma.user.create({
      data: {
        name: 'testUser',
      },
    })
  }, 60000) // Augmenter le timeout pour le démarrage du conteneur

  afterAll(async () => {
    await teardownTestDatabase(testDb)
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
