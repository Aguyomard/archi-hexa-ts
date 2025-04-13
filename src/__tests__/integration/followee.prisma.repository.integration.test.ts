import { PrismaClient } from '../../infra/prisma/generated/client'
import { PrismaFolloweeRepository } from '../../infra/prisma/followee.prisma.repository'
import { Followee } from '../../application/secondaryPorts/followee.repository'
import {
  TestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from './test-utils'

describe('PrismaFolloweeRepository Integration Tests', () => {
  let testDb: TestDatabase
  let prisma: PrismaClient
  let repository: PrismaFolloweeRepository

  beforeAll(async () => {
    testDb = await setupTestDatabase()
    prisma = testDb.prisma
    repository = new PrismaFolloweeRepository()
  }, 60000) // Augmenter le timeout pour le démarrage du conteneur

  afterAll(async () => {
    await teardownTestDatabase(testDb)
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
