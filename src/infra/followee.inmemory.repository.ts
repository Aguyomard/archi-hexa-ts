import {
  Followee,
  FolloweeRepository,
} from '../application/secondaryPorts/followee.repository'

export class InMemoryFolloweeRepository implements FolloweeRepository {
  followeesByUser = new Map<string, string[]>()

  async saveFollowee(followee: Followee): Promise<void> {
    this.addFollowee(followee)
    return Promise.resolve()
  }

  async givenExistingFollowees(followees: Followee[]): Promise<void> {
    followees.forEach((f) => {
      this.addFollowee(f)
    })
  }

  private addFollowee(followee: Followee): void {
    const existingFollowees = this.followeesByUser.get(followee.user) ?? []
    existingFollowees.push(followee.followee)
    this.followeesByUser.set(followee.user, existingFollowees)
  }

  getFolloweesOf(user: string): Promise<string[]> {
    return Promise.resolve(this.followeesByUser.get(user) ?? [])
  }
}
