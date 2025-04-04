import { Message } from './message'
import { MessageRepository } from './message.repository'

export class InMemoryMessageRepository implements MessageRepository {
  messages = new Map<string, Message>()
  save(msg: Message): Promise<void> {
    this.messages.set(msg.id, msg)
    return Promise.resolve()
  }

  getMessageById(id: string) {
    return this.messages.get(id)
  }

  givenExistingMessages(messages: Message[]) {
    messages.forEach(this._save.bind(this))
  }

  getAllOfUser(user: string): Promise<Message[]> {
    return Promise.resolve(
      [...this.messages.values()].filter((msg) => msg.author === user)
    )
  }

  private _save(msg: Message) {
    this.messages.set(msg.id, msg)
  }
}
