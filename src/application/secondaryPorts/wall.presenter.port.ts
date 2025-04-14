import { WallOutputDTO } from '../dtos/wall.dto'

// Type correspondant au retour du use case
export type ViewWallResult = {
  author: string
  text: string
  publicationTime: string
}[]

// DTO interne utilisé par l'application
export interface WallDTO {
  user: string
  messages: ViewWallResult
  following: string[]
}

// Interface du presenter (port secondaire)
export interface WallPresenterPort {
  present(dto: WallDTO): WallOutputDTO
}
