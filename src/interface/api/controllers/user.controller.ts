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
import {
  CreateUserInputDTO,
  CreateUserOutputDTO,
} from '../../../application/dtos/create-user.dto'
import {
  FollowUserInputDTO,
  FollowUserOutputDTO,
} from '../../../application/dtos/follow-user.dto'
import { UserParamDTO } from '../../../application/dtos/user-param.dto'
import {
  TimelineOutputDTO,
  TimelineMessageDTO,
} from '../../../application/dtos/timeline.dto'
import {
  WallOutputDTO,
  WallMessageDTO,
} from '../../../application/dtos/wall.dto'
import { validateDTO } from '../../../shared/validation/dto.validator'
import { createUserSchema } from '../../../application/dtos/validation/create-user.schema'
import { followUserSchema } from '../../../application/dtos/validation/follow-user.schema'
import { userParamSchema } from '../../../application/dtos/validation/user-param.schema'

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
      // Validation du DTO d'entrée
      const createUserInputDto = validateDTO<CreateUserInputDTO>(
        req.body,
        createUserSchema
      )

      const createUserCommand: CreateUserCommand = {
        name: createUserInputDto.name,
      }
      await createUserUseCase.handle(createUserCommand)

      const outputDto: CreateUserOutputDTO = {
        id: 'generated-id', // Dans un cas réel, cela viendrait du repository
        name: createUserInputDto.name,
        createdAt: new Date(),
      }

      return res.status(201).json(outputDto)
    } catch (err) {
      console.error('Error creating user:', err)

      // Si c'est une erreur de validation, retourner un code 400
      if (err instanceof Error && err.message.includes('Validation error')) {
        return res.status(400).json({ error: err.message })
      }

      return res.status(500).json({ error: 'Failed to create user' })
    }
  }

  async followUser(req: Request, res: Response): Promise<Response> {
    try {
      // Validation des DTOs d'entrée
      const userParamDto = validateDTO<UserParamDTO>(
        { user: req.params.user },
        userParamSchema
      )

      const followUserInputDto = validateDTO<FollowUserInputDTO>(
        req.body,
        followUserSchema
      )

      const followUserCommand: FollowUserCommand = {
        user: userParamDto.user,
        userToFollow: followUserInputDto.userToFollow,
      }

      await followUserUseCase.handle(followUserCommand)

      const outputDto: FollowUserOutputDTO = {
        success: true,
        follower: userParamDto.user,
        following: followUserInputDto.userToFollow,
        followedAt: dateProvider.getNow(),
      }

      return res.status(200).json(outputDto)
    } catch (err) {
      console.error('Error following user:', err)

      // Si c'est une erreur de validation, retourner un code 400
      if (err instanceof Error && err.message.includes('Validation error')) {
        return res.status(400).json({ error: err.message })
      }

      return res.status(500).json({ error: 'Failed to follow user' })
    }
  }

  async getTimeline(req: Request, res: Response): Promise<Response> {
    try {
      // Validation du DTO de paramètre
      const userParamDto = validateDTO<UserParamDTO>(
        { user: req.params.user },
        userParamSchema
      )

      const timeline = await viewTimelineUseCase.handle({
        user: userParamDto.user,
      })

      const messages: TimelineMessageDTO[] = timeline.map((msg) => ({
        messageId: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user: msg.author,
        text: msg.text,
        timestamp: new Date(),
      }))

      const outputDto: TimelineOutputDTO = {
        user: userParamDto.user,
        messages,
      }

      return res.status(200).json(outputDto)
    } catch (err) {
      console.error('Error viewing timeline:', err)

      // Si c'est une erreur de validation, retourner un code 400
      if (err instanceof Error && err.message.includes('Validation error')) {
        return res.status(400).json({ error: err.message })
      }

      return res.status(500).json({ error: 'Failed to view timeline' })
    }
  }

  async getWall(req: Request, res: Response): Promise<Response> {
    try {
      // Validation du DTO de paramètre
      const userParamDto = validateDTO<UserParamDTO>(
        { user: req.params.user },
        userParamSchema
      )

      const wallData = await viewWallUseCase.handle({
        user: userParamDto.user,
      })

      const messages: WallMessageDTO[] = wallData.map((msg) => ({
        messageId: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user: msg.author,
        text: msg.text,
        timestamp: new Date(),
      }))

      const following: string[] = []

      const outputDto: WallOutputDTO = {
        user: userParamDto.user,
        messages,
        following,
      }

      return res.status(200).json(outputDto)
    } catch (err) {
      console.error('Error viewing wall:', err)

      // Si c'est une erreur de validation, retourner un code 400
      if (err instanceof Error && err.message.includes('Validation error')) {
        return res.status(400).json({ error: err.message })
      }

      return res.status(500).json({ error: 'Failed to view wall' })
    }
  }
}
