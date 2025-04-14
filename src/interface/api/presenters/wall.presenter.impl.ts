import {
  WallOutputDTO,
  WallMessageDTO,
} from '../../../application/dtos/wall.dto'
import {
  WallPresenterPort,
  WallDTO,
} from '../../../application/secondaryPorts/wall.presenter.port'

export class WallPresenterImpl implements WallPresenterPort {
  present(dto: WallDTO): WallOutputDTO {
    // Transformation des messages du format interne vers le format API
    const messages: WallMessageDTO[] = dto.messages.map((msg) => ({
      messageId: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: msg.author,
      text: msg.text,
      timestamp: new Date(),
    }))

    // Construction du DTO de sortie
    return {
      user: dto.user,
      messages,
      following: dto.following,
    }
  }
}
