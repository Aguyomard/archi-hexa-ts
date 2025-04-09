import { Message } from '../../domain/message'
const ONE_MINUTE = 60 * 1000

export class Timeline {
  constructor(
    private readonly messages: Message[],
    private readonly now: Date
  ) {}

  get data() {
    this.messages.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    )

    return this.messages.map((message) => ({
      author: message.author,
      text: message.text,
      publicationTime: this.publicationTime(message.publishedAt),
    }))
  }

  private publicationTime(publishedAt: Date): string {
    const diff = this.now.getTime() - publishedAt.getTime()
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
