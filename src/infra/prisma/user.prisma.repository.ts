import { PrismaClient } from './generated/client'
import { UserRepository } from '../../application/usecases/create-user.usecase'

export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async createUser(name: string): Promise<void> {
    await this.prisma.user.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
}
