const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]!
  }

  type Author {
    author: String
  }

  type Book {
    authors: [Author]
    description: String
    bookId: String!
    image: String
    link: String
    title: String
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
    saveBook(bookId: String!): User!
    deleteBook(bookId: String!): User
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
