import {
  WallOutputDTO,
  WallMessageDTO,
} from '../../../application/dtos/wall.dto'

export type ViewWallResult = {
  author: string
  text: string
  publicationTime: string
}[]

export interface WallPresenterResult {
  user: string
  messages: WallMessageDTO[]
  following: string[]
}

export class WallPresenter {
  present(
    data: ViewWallResult,
    user: string,
    following: string[]
  ): WallOutputDTO {
    const messages: WallMessageDTO[] = data.map((msg) => ({
      messageId: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: msg.author,
      text: msg.text,
      timestamp: new Date(),
    }))

    return {
      user,
      messages,
      following,
    }
  }
}
