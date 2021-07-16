const { gql } = require("apollo-server");

const typeDefs = gql`
  directive @authenticated on FIELD_DEFINITION
  directive @formatDate(format: String = "dd mmm yyyy") on FIELD_DEFINITION

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    bookings: [Event!]!
    events: [Event!]!
  }

  type SigninUser {
    id: ID!
    name: String!
    email: String!
    password: String!
    bookings: [Event!]!
    events: [Event!]!
    token: String!
  }

  type Event {
    id: ID!
    name: String!
    description: String!
    date: String! @formatDate
    creator: User!
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
  }

  input SigninInput {
    email: String!
    password: String!
  }

  input CreateEventInput {
    name: String!
    description: String!
    date: String!
  }

  input BookEventInput {
    eventId: ID!
  }

  input CancelBookingInput {
    eventId: ID!
  }

  input EventInput {
    id: ID!
  }

  type Query {
    events: [Event!]!
    bookings: [Event!]!
    event(input: EventInput!): Event!
  }

  type Mutation {
    signup(input: SignupInput!): User!
    signin(input: SigninInput!): SigninUser!
    createEvent(input: CreateEventInput!): Event! @authenticated
    bookEvent(input: BookEventInput!): User! @authenticated
    cancelBooking(input: CancelBookingInput!): User! @authenticated
  }
`;

module.exports = typeDefs;
