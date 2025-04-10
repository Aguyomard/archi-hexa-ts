import {
  Followee,
  FolloweeRepository,
} from '../application/secondaryPorts/followee.repository'
import * as path from 'path'
import * as fs from 'fs'

export class FileSystemFolloweeRepository implements FolloweeRepository {
  constructor(
    private readonly followeesPath = path.join(__dirname, 'followee.json')
  ) {}
  async saveFollowee(followee: Followee): Promise<void> {
    const followees = await this.getFollowees()
    const actualUserFollowees = followees[followee.user] ?? []
    actualUserFollowees.push(followee.followee)
    followees[followee.user] = actualUserFollowees

    return fs.promises.writeFile(this.followeesPath, JSON.stringify(followees))
  }

  private async getFollowees(): Promise<{
    [user: string]: string[]
  }> {
    const data = await fs.promises.readFile(this.followeesPath)

    const followees = JSON.parse(data.toString()) as {
      [user: string]: string[]
    }

    return followees
  }

  async getFolloweesOf(user: string): Promise<string[]> {
    const followees = await this.getFollowees()
    return followees[user] ?? []
  }
}
