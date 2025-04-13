import { Request, Response } from 'express'
import {
  CreateUserCommand,
  CreateUserUseCase,
} from '../../../application/usecases/create-user.usecase'
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '../../../application/usecases/follow-user.usecase'
import { ViewTimelineUseCase } from '../../../application/usecases/view-timeline.usecase'
import { ViewWallUseCase } from '../../../application/usecases/view-wall.usecase'
import { PrismaUserRepository } from '../../../infra/prisma/user.prisma.repository'
import { PrismaFolloweeRepository } from '../../../infra/prisma/followee.prisma.repository'
import { PrismaMessageRepository } from '../../../infra/prisma/message.prisma.repository'
import { DateProvider } from '../../../application/secondaryPorts/dateProvider'

// Initialize repositories and provider
const prismaUserRepository = new PrismaUserRepository()
const prismaFolloweeRepository = new PrismaFolloweeRepository()
const prismaMessageRepository = new PrismaMessageRepository()
const dateProvider: DateProvider = {
  getNow: () => new Date(),
}

// Initialize use cases
const createUserUseCase = new CreateUserUseCase(prismaUserRepository)
const followUserUseCase = new FollowUserUseCase(prismaFolloweeRepository)
const viewTimelineUseCase = new ViewTimelineUseCase(
  prismaMessageRepository,
  dateProvider
)
const viewWallUseCase = new ViewWallUseCase(
  prismaMessageRepository,
  prismaFolloweeRepository,
  dateProvider
)

export class UserController {
  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.body

      if (!name) {
        return res.status(400).json({ error: 'Name is required' })
      }

      const createUserCommand: CreateUserCommand = { name }
      await createUserUseCase.handle(createUserCommand)

      return res
        .status(201)
        .json({ message: `User '${name}' created successfully` })
    } catch (err) {
      console.error('Error creating user:', err)
      return res.status(500).json({ error: 'Failed to create user' })
    }
  }

  async followUser(req: Request, res: Response): Promise<Response> {
    try {
      const { user } = req.params
      const { userToFollow } = req.body

      if (!userToFollow) {
        return res.status(400).json({ error: 'User to follow is required' })
      }

      const followUserCommand: FollowUserCommand = {
        user,
        userToFollow,
      }

      await followUserUseCase.handle(followUserCommand)

      return res
        .status(200)
        .json({ message: `${user} is now following ${userToFollow}` })
    } catch (err) {
      console.error('Error following user:', err)
      return res.status(500).json({ error: 'Failed to follow user' })
    }
  }

  async getTimeline(req: Request, res: Response): Promise<Response> {
    try {
      const { user } = req.params

      const timeline = await viewTimelineUseCase.handle({ user })

      return res.status(200).json({ timeline })
    } catch (err) {
      console.error('Error viewing timeline:', err)
      return res.status(500).json({ error: 'Failed to view timeline' })
    }
  }

  async getWall(req: Request, res: Response): Promise<Response> {
    try {
      const { user } = req.params

      const wall = await viewWallUseCase.handle({ user })

      return res.status(200).json({ wall })
    } catch (err) {
      console.error('Error viewing wall:', err)
      return res.status(500).json({ error: 'Failed to view wall' })
    }
  }
}
