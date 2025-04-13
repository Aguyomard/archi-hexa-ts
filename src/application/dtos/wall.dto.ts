export interface WallMessageDTO {
  messageId: string
  user: string
  text: string
  timestamp: Date
}

export interface WallOutputDTO {
  user: string
  messages: WallMessageDTO[]
  following: string[]
}
