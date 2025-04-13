#!/usr/bin/env node
import { Command } from 'commander'
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '../../application/usecases/post-message.usecase'
import { DateProvider } from '../../application/secondaryPorts/dateProvider'
import {
  EditMessageCommand,
  EditMessageUseCase,
} from '../../application/usecases/edit-message.usecase'
import { ViewTimelineUseCase } from '../../application/usecases/view-timeline.usecase'
import {
  FollowUserCommand,
  FollowUserUseCase,
} from '../../application/usecases/follow-user.usecase'
import { ViewWallUseCase } from '../../application/usecases/view-wall.usecase'
import { PrismaMessageRepository } from '../../infra/prisma/message.prisma.repository'
import { PrismaFolloweeRepository } from '../../infra/prisma/followee.prisma.repository'
import {
  CreateUserCommand,
  CreateUserUseCase,
} from '../../application/usecases/create-user.usecase'
import { PrismaUserRepository } from '../../infra/prisma/user.prisma.repository'

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date()
  }
}

// Instances pour les commandes utilisant Prisma
const prismaMessageRepository = new PrismaMessageRepository()
const prismaFolloweeRepository = new PrismaFolloweeRepository()
const prismaUserRepository = new PrismaUserRepository()
const dateProvider = new RealDateProvider()

// Initialisation des cas d'utilisation avec les repositories Prisma
const postMessageUseCase = new PostMessageUseCase(
  prismaMessageRepository,
  dateProvider
)
const editMessageUseCase = new EditMessageUseCase(prismaMessageRepository)
const viewTimelineUseCase = new ViewTimelineUseCase(
  prismaMessageRepository,
  dateProvider
)
const followUserUseCase = new FollowUserUseCase(prismaFolloweeRepository)
const viewWallUseCase = new ViewWallUseCase(
  prismaMessageRepository,
  prismaFolloweeRepository,
  dateProvider
)
const createUserUseCase = new CreateUserUseCase(prismaUserRepository)

const program = new Command()
program
  .version('1.0.0')
  .description('Crafty social network with Prisma persistence')
  .addCommand(
    new Command('create-user')
      .argument('<name>', 'the name of the user to create')
      .action(async (name) => {
        const createUserCommand: CreateUserCommand = {
          name,
        }
        try {
          await createUserUseCase.handle(createUserCommand)
          console.log(`✅ User '${name}' created`)
          process.exit(0)
        } catch (err) {
          console.error('❌', err)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('post')
      .argument('<user>', 'the current user')
      .argument('<message>', 'the message to post')
      .action(async (user, message) => {
        const postMessageCommand: PostMessageCommand = {
          id: `${Math.floor(Math.random() * 10000)}`,
          author: user,
          text: message,
        }
        try {
          await postMessageUseCase.handle(postMessageCommand)
          console.log('✅ Message posté dans la base Prisma')
          process.exit(0)
        } catch (err) {
          console.error('❌', err)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('view')
      .argument('<user>', 'the user to view the timeline of')
      .action(async (user) => {
        try {
          const timeline = await viewTimelineUseCase.handle({ user })
          console.table(timeline)
          process.exit(0)
        } catch (err) {
          console.error(err)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('edit')
      .argument('<message-id>', 'the message id of the message to edit')
      .argument('<message>', 'the new text')
      .action(async (messageId, message) => {
        const editMessageCommand: EditMessageCommand = {
          messageId,
          text: message,
        }
        try {
          await editMessageUseCase.handle(editMessageCommand)
          console.log('✅ Message edité')
          process.exit(0)
        } catch (err) {
          console.error('❌', err)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('follow')
      .argument('<user>', 'the user to follow')
      .argument('<followee>', 'the user to follow')
      .action(async (user, followee) => {
        const followUserCommand: FollowUserCommand = {
          user,
          userToFollow: followee,
        }
        try {
          await followUserUseCase.handle(followUserCommand)
          console.log('✅ Followed')
          process.exit(0)
        } catch (err) {
          console.error('❌', err)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('wall')
      .argument('<user>', 'the user to view the wall of')
      .action(async (user) => {
        const wall = await viewWallUseCase.handle({ user })
        console.table(wall)
        process.exit(0)
      })
  )

async function main() {
  await program.parseAsync()
}

main()
