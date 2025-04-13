export interface TimelineMessageDTO {
  messageId: string
  user: string
  text: string
  timestamp: Date
}

export interface TimelineOutputDTO {
  user: string
  messages: TimelineMessageDTO[]
}
