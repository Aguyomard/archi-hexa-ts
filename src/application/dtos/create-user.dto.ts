export interface CreateUserInputDTO {
  name: string
}

export interface CreateUserOutputDTO {
  id: string
  name: string
  createdAt: Date
}
