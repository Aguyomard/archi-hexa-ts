export interface CreateUserCommand {
  name: string
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async handle(command: CreateUserCommand): Promise<void> {
    await this.userRepository.createUser(command.name)
  }
}

export interface UserRepository {
  createUser(name: string): Promise<void>
}
