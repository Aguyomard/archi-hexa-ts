import { InMemoryMessageRepository } from '../message.inmemory.repository'
import { ViewTimelineUseCase } from '../view-timeline.usecase'
import { Message } from '../message'

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
          publishedAt: new Date('2023-01-19T19:00:00.000Z'),
        },
        {
          author: 'Bob',
          text: 'Hello World 2',
          id: 'message-id-2',
          publishedAt: new Date('2023-01-19T19:00:00.000Z'),
        },
        {
          author: 'Alice',
          text: 'Hello World 3',
          id: 'message-id-3',
          publishedAt: new Date('2023-01-20T19:00:00.000Z'),
        },
      ])

      fixture.givenNowIs(new Date('2023-01-20T19:00:00.000Z'))

      await fixture.whenUserSeesTheTimelineOf('Alice')

      fixture.thenUserShouldSee([
        {
          author: 'Alice',
          text: 'Hello World 1',
          publicationTime: '2 minutes ago',
        },
        {
          author: 'Alice',
          text: 'Hello World 3',
          publicationTime: '2 minutes ago',
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
  const messageRepository = new InMemoryMessageRepository()
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository)

  return {
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages)
    },
    givenNowIs(now: Date) {},
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
