import { FileSystemFolloweeRepository } from '../../infra/followee.fs.repository'
import * as path from 'path'
import * as fs from 'fs'

const testFolloweesPath = path.join(
  __dirname,
  './../../../tmp/followees-test.json'
)

describe('FileSystemFolloweeRepository', () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testFolloweesPath, JSON.stringify({}))
  })

  test('saveFollowee() should save a new followee', async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweesPath
    )

    await fs.promises.writeFile(
      testFolloweesPath,
      JSON.stringify({ Alice: ['Bob'], Bob: ['Charlie'] })
    )

    await followeeRepository.saveFollowee({
      user: 'Alice',
      followee: 'Charlie',
    })

    const followees = await fs.promises.readFile(testFolloweesPath)
    const followeesJSON = JSON.parse(followees.toString())

    expect(followeesJSON).toEqual({
      Alice: ['Bob', 'Charlie'],
      Bob: ['Charlie'],
    })
  })

  test('saveFollowee() should save a new followee when  there is no followees before', async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweesPath
    )

    await fs.promises.writeFile(
      testFolloweesPath,
      JSON.stringify({ Alice: [], Bob: ['Charlie'] })
    )

    await followeeRepository.saveFollowee({
      user: 'Alice',
      followee: 'Charlie',
    })

    const followees = await fs.promises.readFile(testFolloweesPath)
    const followeesJSON = JSON.parse(followees.toString())

    expect(followeesJSON).toEqual({
      Alice: ['Charlie'],
      Bob: ['Charlie'],
    })
  })

  test('getFolloweesOf should  return the user followees', async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweesPath
    )

    await fs.promises.writeFile(
      testFolloweesPath,
      JSON.stringify({ Alice: ['Bob', 'Charlie'], Bob: ['Charlie'] })
    )

    const followees = await followeeRepository.getFolloweesOf('Alice')

    expect(followees).toEqual(['Bob', 'Charlie'])
  })
})
