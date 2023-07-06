const { gql } = require('apollo-server-express');

const typeDefs = gql`
type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]
}

type Author {
  type: String
}

type Book {
  authors: [Author]
  description: String!
  bookId: String!
  image: String
  link: String
  title: String!
}

type SearchBook {
  title: String
  authors: [String]
  description: String
  bookId: String
  image: String
  link: String
}

type Query {
    users(_id: String!): [User]
    searchBooks(title: String!): [SearchBook]
}

type Mutation {
    createUser(username: String!, email: String!, password: String!): User
    saveBook(bookId: String!): User
    deleteBook(bookId: String!): User
    login(email: String!, password: String!): User
}
`;

module.exports = typeDefs;