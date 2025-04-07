import { MessageRepository } from '../application/secondaryPorts/message.repository'
import { Message } from '../domain/message'

export class InMemoryMessageRepository implements MessageRepository {
  messages = new Map<string, Message>()
  save(msg: Message): Promise<void> {
    this.messages.set(msg.id, msg)
    return Promise.resolve()
  }

  getById(messageId: string): Promise<Message> {
    const msg = this.getMessageById(messageId)
    if (!msg) {
      return Promise.reject(new Error(`Message with id ${messageId} not found`))
    }
    return Promise.resolve(msg)
  }

  getMessageById(id: string) {
    return this.messages.get(id)
  }

  givenExistingMessages(messages: Message[]) {
    messages.forEach(this._save.bind(this))
  }

  getAllOfUser(user: string): Promise<Message[]> {
    return Promise.resolve(
      [...this.messages.values()]
        .filter((msg) => msg.author === user)
        .map((m) =>
          Message.fromData({
            id: m.id,
            author: m.author,
            text: m.text,
            publishedAt: m.publishedAt,
          })
        )
    )
  }

  private _save(msg: Message) {
    this.messages.set(msg.id, msg)
  }
}
