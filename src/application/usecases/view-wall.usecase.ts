import { Timeline } from '../services/timeline'
import { DateProvider } from '../secondaryPorts/dateProvider'
import { FolloweeRepository } from '../secondaryPorts/followee.repository'
import { MessageRepository } from '../secondaryPorts/message.repository'
import {
  WallDTO,
  WallPresenterPort,
} from '../secondaryPorts/wall.presenter.port'
import { WallOutputDTO } from '../dtos/wall.dto'

export class ViewWallUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository,
    private readonly dateProvider: DateProvider,
    private readonly wallPresenter: WallPresenterPort
  ) {}

  async handle({ user }: { user: string }): Promise<WallOutputDTO> {
    const followees = await this.followeeRepository.getFolloweesOf(user)

    const messages = (
      await Promise.all(
        [user, ...followees].map((author) =>
          this.messageRepository.getAllOfUser(author)
        )
      )
    ).flat()

    const timeline = new Timeline(messages, this.dateProvider.getNow())

    // Créer le DTO interne
    const wallDTO: WallDTO = {
      user,
      messages: timeline.data,
      following: followees,
    }

    // Utiliser le presenter pour transformer le DTO en format de sortie
    return this.wallPresenter.present(wallDTO)
  }
}
