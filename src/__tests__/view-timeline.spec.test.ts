import { InMemoryMessageRepository } from '../message.inmemory.repository'
import { ViewTimelineUseCase } from '../view-timeline.usecase'
import { Message } from '../message'
import { StubDateProvider } from '../stub-date-provider'

describe('Feature: Viewing a personnal timeline', () => {
  let fixture: Fixture

  beforeEach(() => {
    fixture = createFixture()
  })

  describe('Rule: Messages are shown in reverse chronological order', () => {
    test('Alice can view the 2 messages she published in her timeline', async () => {
      fixture.givenTheFollowingMessagesExist([
        {
          author: 'Alice',
          text: 'Hello World 1',
          id: 'message-id-1',
          publishedAt: new Date('2023-01-20T19:28:00.000Z'),
        },
        {
          author: 'Bob',
          text: 'Hello World 2',
          id: 'message-id-2',
          publishedAt: new Date('2023-01-20T19:29:00.000Z'),
        },
        {
          author: 'Alice',
          text: 'Hello World 3',
          id: 'message-id-3',
          publishedAt: new Date('2023-01-20T19:30:00.000Z'),
        },
        {
          author: 'Alice',
          text: 'My last message',
          id: 'message-id-4',
          publishedAt: new Date('2023-01-20T19:30:30.000Z'),
        },
      ])

      fixture.givenNowIs(new Date('2023-01-20T19:31:00.000Z'))

      await fixture.whenUserSeesTheTimelineOf('Alice')

      fixture.thenUserShouldSee([
        {
          author: 'Alice',
          text: 'My last message',
          publicationTime: 'less than a minute',
        },
        {
          author: 'Alice',
          text: 'Hello World 3',
          publicationTime: '1 minutes ago',
        },
        {
          author: 'Alice',
          text: 'Hello World 1',
          publicationTime: '3 minutes ago',
        },
      ])
    })
  })
})

const createFixture = () => {
  let timeline: {
    author: string
    text: string
    publicationTime: string
  }[]
  const dateProvider = new StubDateProvider()

  const messageRepository = new InMemoryMessageRepository()
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
    async whenUserSeesTheTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user })
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
  }
}

type Fixture = ReturnType<typeof createFixture>
