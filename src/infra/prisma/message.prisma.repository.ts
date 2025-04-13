import { PrismaClient } from './generated/client'
import { Message } from '../../domain/message'
import { MessageRepository } from '../../application/secondaryPorts/message.repository'

export class PrismaMessageRepository implements MessageRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async save(message: Message): Promise<void> {
    await this.prisma.message.upsert({
      where: { id: message.id },
      update: {
        text: message.text,
      },
      create: {
        id: message.id,
        text: message.text,
        publishedAt: message.publishedAt,
        authorId: message.author,
      },
    })
  }

  async getById(messageId: string): Promise<Message> {
    const messageData = await this.prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!messageData) {
      throw new Error(`Message with id ${messageId} not found`)
    }

    return Message.fromData({
      id: messageData.id,
      author: messageData.authorId,
      text: messageData.text,
      publishedAt: messageData.publishedAt,
    })
  }

  async getAllOfUser(user: string): Promise<Message[]> {
    const messagesData = await this.prisma.message.findMany({
      where: { authorId: user },
    })

    return messagesData.map((messageData) =>
      Message.fromData({
        id: messageData.id,
        author: messageData.authorId,
        text: messageData.text,
        publishedAt: messageData.publishedAt,
      })
    )
  }
}
