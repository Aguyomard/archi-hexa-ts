import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { Message, MessageRepository } from './post-message.usecase'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class FileSystemMessageRepository implements MessageRepository {
  save(message: Message): Promise<void> {
    const filePath = path.join(__dirname, 'messages.json')
    return fs.promises.writeFile(filePath, JSON.stringify(message, null, 2))
  }
}
