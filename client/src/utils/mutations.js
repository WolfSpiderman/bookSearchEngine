import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation createUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const SAVE_BOOK = gql`
  mutation saveBook(
    $bookId: String!
    $title: String!
    $authors: [String!]!
    $description: String!
    $image: String
    $link: String
  ) {
    saveBook(
      book: {
        bookId: $bookId
        title: $title
        authors: $authors
        description: $description
        image: $image
        link: $link
      }
    ) {
      _id
      username
      email
      savedBooks {
        bookId
        title
        authors
        description
        link
        image
      }
    }
  }
`;

export const DELETE_BOOK = gql`
  mutation deleteBook($bookId: String!) {
    deleteBook(bookId: $bookId) {
      _id
      username
      email
      savedBooks {
        bookId
        title
        authors
        description
        link
        image
      }
    }
  }
`;

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;