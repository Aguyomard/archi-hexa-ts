import { PrismaClient } from './generated/client'
import {
  Followee,
  FolloweeRepository,
} from '../../application/secondaryPorts/followee.repository'

export class PrismaFolloweeRepository implements FolloweeRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async saveFollowee(followee: Followee): Promise<void> {
    // Assurer que les deux utilisateurs existent
    await this.prisma.user.upsert({
      where: { name: followee.user },
      update: {},
      create: { name: followee.user },
    })

    await this.prisma.user.upsert({
      where: { name: followee.followee },
      update: {},
      create: { name: followee.followee },
    })

    // Établir la relation de following
    await this.prisma.user.update({
      where: { name: followee.user },
      data: {
        following: {
          connect: { name: followee.followee },
        },
      },
    })
  }

  async getFolloweesOf(user: string): Promise<string[]> {
    const userData = await this.prisma.user.findUnique({
      where: { name: user },
      include: {
        following: true,
      },
    })

    if (!userData) {
      return []
    }

    return userData.following.map((followee) => followee.name)
  }
}
