import { MessageRepository } from './message.repository'
import { DateProvider } from './post-message.usecase'

const ONE_MINUTE = 60 * 1000
export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle({ user }: { user: string }): Promise<
    {
      author: string
      text: string
      publicationTime: string
    }[]
  > {
    const messagesOfUser = await this.messageRepository.getAllOfUser(user)

    messagesOfUser.sort((a, b) => {
      return b.publishedAt.getTime() - a.publishedAt.getTime()
    })

    return messagesOfUser.map((message) => ({
      author: message.author,
      text: message.text.value,
      publicationTime: this.publicationTime(message.publishedAt),
    }))
  }

  private publicationTime(publishedAt: Date): string {
    const now = this.dateProvider.getNow()
    const diff = now.getTime() - publishedAt.getTime()
    const minutes = Math.floor(diff / ONE_MINUTE)
    if (minutes < 1) {
      return 'less than a minute ago'
    }
    if (minutes < 2) {
      return '1 minute ago'
    }
    return `${minutes} minutes ago`
  }
}
