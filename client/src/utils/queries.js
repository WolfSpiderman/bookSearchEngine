import { gql } from '@apollo/client';

export const QUERY_ME = gql`
  query {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        title
        description
        image
        link
        authors {
          author
        }
      }
    }
  }
`;

export const QUERY_BOOKS = gql`
  query getBooks {
    books {
      _id
      title
      description
      image
      link
      authors {
        author
      }
    }
  }
`;
