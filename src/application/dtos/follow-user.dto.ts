export interface FollowUserInputDTO {
  userToFollow: string
}

export interface FollowUserOutputDTO {
  success: boolean
  follower: string
  following: string
  followedAt: Date
}
