#!/usr/bin/env node
import { Command } from 'commander'
import {
  DateProvider,
  PostMessageCommand,
  PostMessageUseCase,
} from './post-message.usecase'
import { FileSystemMessageRepository } from './message.fs.repository'
import { ViewTimelineUseCase } from './view-timeline.usecase'
import { EditMessageCommand, EditMessageUseCase } from './edit-message.usecase'

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date()
  }
}

const messageRepository = new FileSystemMessageRepository()
const dateProvider = new RealDateProvider()
const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
)
const editMessageUseCase = new EditMessageUseCase(messageRepository)
const viewTimelineUseCase = new ViewTimelineUseCase(
  messageRepository,
  dateProvider
)

const program = new Command()
program
  .version('1.0.0')
  .description('Crafty social network')
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
          console.log('✅ Message posté')
          console.table(messageRepository)

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

async function main() {
  await program.parseAsync()
}

main()
