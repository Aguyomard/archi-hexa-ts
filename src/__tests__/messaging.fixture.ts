import { Message } from '../domain/message'
import {
  PostMessageCommand,
  PostMessageUseCase,
} from '../application/usecases/post-message.usecase'
import { StubDateProvider } from '../infra/stub-date-provider'
import { ViewTimelineUseCase } from '../application/usecases/view-timeline.usecase'
import {
  EditMessageCommand,
  EditMessageUseCase,
} from '../application/usecases/edit-message.usecase'
import { InMemoryMessageRepository } from '../infra/message.inmemory.repository'

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider()
  const messageRepository = new InMemoryMessageRepository()
  let thrownError: Error
  let timeline: {
    author: string
    text: string
    publicationTime: string
  }[]
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  )
  const editMessageUseCase = new EditMessageUseCase(messageRepository)
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider
  )
  return {
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages)
    },
    givenNowIs(now: Date) {
      dateProvider.now = now
    },
    async whenUserPostsAmessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand)
      } catch (err) {
        if (err instanceof Error) {
          thrownError = err
        } else {
          throw new Error('Caught non-Error value')
        }
      }
    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      try {
        await editMessageUseCase.handle(editMessageCommand)
      } catch (err) {
        if (err instanceof Error) {
          thrownError = err
        } else {
          throw new Error('Caught non-Error value')
        }
      }
    },
    async whenUserSeesTheTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user })
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const message = await messageRepository.getById(expectedMessage.id)
      expect(message).toEqual(expectedMessage)
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass)
    },
    thenUserShouldSee(
      expectedTimeline: {
        author: string
        text: string
        publicationTime: string
      }[]
    ) {
      expect(timeline).toEqual(expectedTimeline)
    },
    messageRepository,
  }
}

export type MessagingFixture = ReturnType<typeof createMessagingFixture>
