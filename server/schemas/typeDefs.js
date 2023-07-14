const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]!
  }

  type Book {
    authors: [String]!
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
  }

  input BookInput {
    bookId: String!
    title: String!
    authors: [String]!
    description: String!
    image: String
    link: String
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
    books: [Book]!
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): Auth
    saveBook(book: BookInput!): User!
    deleteBook(bookId: String!): User
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
