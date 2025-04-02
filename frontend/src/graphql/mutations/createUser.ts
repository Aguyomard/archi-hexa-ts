import { gql } from '@apollo/client/core'

export const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      user {
        id
        name
        email
        age
      }
      token
    }
  }
`
