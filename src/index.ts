#!/usr/bin/env node
import { Command } from 'commander'
import {
  DateProvider,
  PostMessageCommand,
  PostMessageUseCase,
} from './post-message.usecase'
import { FileSystemMessageRepository } from './message.fs.repository'

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
          id: 'some-message-id',
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

async function main() {
  await program.parseAsync()
}

main()
