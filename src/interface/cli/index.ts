#!/usr/bin/env node
import { Command } from 'commander'
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '../../application/usecases/post-message.usecase'
import { FileSystemMessageRepository } from '../../infra/message.fs.repository'
import { DateProvider } from '../../application/secondaryPorts/dateProvider'
import {
  EditMessageCommand,
  EditMessageUseCase,
} from '../../application/usecases/edit-message.usecase'
import { ViewTimelineUseCase } from '../../application/usecases/view-timeline.usecase'

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date()
  }
}

import * as path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const testMessagesPath = path.join(__dirname, './message.json')

const messageRepository = new FileSystemMessageRepository(testMessagesPath)
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
