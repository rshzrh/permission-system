import { makeExecutableSchema } from '@graphql-tools/schema'
import { tweetResolvers } from './resolvers/tweet'
import { groupResolvers } from './resolvers/group'
import { mergeResolvers } from '@graphql-tools/merge'
import { userResolvers } from './resolvers/user'

const typeDefs = `
  scalar DateTime

  type User {
    id: String!
  }
  type Group {
    id: String!
    userIds: [String!]!
    groupIds: [String!]!
  }

  input CreateGroup {
    userIds: [String!]
    groupIds: [String!]
  }
  
  input CreateUser {
    id: String!
  }

  enum TweetCategory {
    Sport
    Finance
    Tech
    News
  }

  input CreateTweet {
    authorId: String!
    content: String!
    hashtags: [String!]
    parentTweetId: String
    category: TweetCategory
    location: String
  }

  type Tweet {
    id: String!
    createdAt: DateTime!
    authorId: String!
    content: String!
    hashtags: [String!]
    parentTweetId: String
    category: TweetCategory
    location: String
  }

  type PaginatedTweet {
    nodes: [Tweet!]!
    hasNextPage: Boolean!
  }

  input FilterTweet {
    authorId: String
    hashtag: String
    parentTweetId: String
    category: TweetCategory
    location: String
  }

  input UpdateTweetPermissions {
    tweetId: String!
    inheritViewPermissions: Boolean!
    inheritEditPermissions: Boolean!
    viewPermissionsUsers: [String!]
    editPermissionsUsers: [String!]
    viewPermissionsGroups: [String!]
    editPermissionsGroups: [String!]

  }

  type Query {
    paginateTweets(userId: String!, limit: Int!, page: Int!): PaginatedTweet!
    canEditTweet(userId: String!, tweetId: String!): Boolean!
    getGroup(id: String!): Group!
    listAllGroups: [Group!]!
    listUserGroups(userId: String!): [Group!]!
  }

  type Mutation {
    createUser(input: CreateUser!): User!
    createGroup(input: CreateGroup!): Group!
    createTweet(input: CreateTweet!): Tweet!
    updateTweetPermissions(input: UpdateTweetPermissions!): Boolean!
  }


  type ValidationError {
    message: String!
    path: [String!]
  }

  

`

const resolvers = mergeResolvers([tweetResolvers, groupResolvers, userResolvers])

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})