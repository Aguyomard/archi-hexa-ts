import { Timeline } from '../services/timeline'
import { DateProvider } from '../secondaryPorts/dateProvider'
import { FolloweeRepository } from '../secondaryPorts/followee.repository'
import { MessageRepository } from '../secondaryPorts/message.repository'

export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository,
    private readonly dateProvider: DateProvider
  ) {}
  async handle({
    user,
  }: {
    user: string
  }): Promise<{ author: string; text: string; publicationTime: string }[]> {
    const followees = await this.followeeRepository.getFolloweesOf(user)
    const messages = (
      await Promise.all(
        [user, ...followees].map((author) =>
          this.messageRepository.getAllOfUser(author)
        )
      )
    ).flat()

    const timeline = new Timeline(messages, this.dateProvider.getNow())

    return timeline.data
  }
}
