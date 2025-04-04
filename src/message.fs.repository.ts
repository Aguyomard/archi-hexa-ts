import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { MessageRepository } from './message.repository'
import { Message } from './message'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class FileSystemMessageRepository implements MessageRepository {
  private readonly messagePath = path.join(__dirname, 'message.json')

  async save(message: Message): Promise<void> {
    const messages = await this.getMessages()
    messages.push(message)
    return fs.promises.writeFile(this.messagePath, JSON.stringify(messages))
  }

  private async getMessages(): Promise<Message[]> {
    const data = await fs.promises.readFile(this.messagePath)
    const messages = JSON.parse(data.toString()) as {
      id: string
      author: string
      text: string
      publishedAt: string
    }[]

    return messages.map((m) => ({
      id: m.id,
      author: m.author,
      text: m.text,
      publishedAt: new Date(m.publishedAt),
    }))
  }

  async getAllOfUser(user: string): Promise<Message[]> {
    const messages = await this.getMessages()

    return messages.filter((m) => m.author === user)
  }
}
