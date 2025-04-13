import { Request, Response } from 'express'
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '../../../application/usecases/post-message.usecase'
import {
  EditMessageCommand,
  EditMessageUseCase,
} from '../../../application/usecases/edit-message.usecase'
import { PrismaMessageRepository } from '../../../infra/prisma/message.prisma.repository'
import { DateProvider } from '../../../application/secondaryPorts/dateProvider'

// Initialize repositories and provider
const prismaMessageRepository = new PrismaMessageRepository()
const dateProvider: DateProvider = {
  getNow: () => new Date(),
}

// Initialize use cases
const postMessageUseCase = new PostMessageUseCase(
  prismaMessageRepository,
  dateProvider
)
const editMessageUseCase = new EditMessageUseCase(prismaMessageRepository)

export class MessageController {
  async postMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { author, text } = req.body

      if (!author || !text) {
        return res.status(400).json({ error: 'Author and text are required' })
      }

      const postMessageCommand: PostMessageCommand = {
        id: `${Math.floor(Math.random() * 10000)}`,
        author,
        text,
      }

      await postMessageUseCase.handle(postMessageCommand)

      return res.status(201).json({ message: 'Message posted successfully' })
    } catch (err) {
      console.error('Error posting message:', err)
      return res.status(500).json({ error: 'Failed to post message' })
    }
  }

  async editMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { messageId } = req.params
      const { text } = req.body

      if (!text) {
        return res.status(400).json({ error: 'Text is required' })
      }

      const editMessageCommand: EditMessageCommand = {
        messageId,
        text,
      }

      await editMessageUseCase.handle(editMessageCommand)

      return res.status(200).json({ message: 'Message edited successfully' })
    } catch (err) {
      console.error('Error editing message:', err)
      return res.status(500).json({ error: 'Failed to edit message' })
    }
  }
}
