import React, { useState, useEffect } from 'react';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import Auth from '../../utils/auth';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../../utils/mutations';
import { saveBookIds, getSavedBookIds } from '../../utils/localStorage';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [loading, setLoading] = useState(false);
  const token = Auth.loggedIn() ? Auth.getToken() : null;

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const searchGoogleBooks = async () => {
    try {
      setLoading(true); 
      
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchInput}`);
      const data = await response.json();

      const processedData = data.items.map((item) => ({
        bookId: item.id,
        authors: item.volumeInfo.authors || ['No author to display'],
        title: item.volumeInfo.title,
        description: item.volumeInfo.description,
        image: item.volumeInfo.imageLinks?.thumbnail,
      }));

      console.log(processedData);
      setSearchedBooks(processedData);
      setLoading(false); 
    } catch (err) {
      console.error(err);
    }
  };

  const [saveBook] = useMutation(SAVE_BOOK);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return;
    }

    try {
      searchGoogleBooks();
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // const handleSaveBook = async (book) => {
  //   const token = Auth.loggedIn() ? Auth.getToken() : null;

  //   console.log(book);
  //   if (!token) {
  //     return false;
  //   }

  //   try {
  //     await saveBook({
  //       variables: { input: { bookId: book.bookId, title: book.title, description: book.description, authors: book.authors, image: book.image } },
  //       context: { headers: { authorization: `Bearer ${token}` } }
  //     });

  //     setSavedBookIds([...savedBookIds, book]);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleSaveBook = async (clickedBook) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === clickedBook.bookId);

    if (!token) {
      return false;
    }

    console.log(savedBookIds);
    try {
      const response = await saveBook({
        variables: {
          bookId: bookToSave.bookId,
          title: bookToSave.title,
          authors: bookToSave.authors,
          description: bookToSave.description,
          image: bookToSave.image
        }
      });

      // Check if the mutation was successful
      if (response.data.saveBook) {
        // Check if the book is already saved by the user
        const existingBookIndex = savedBookIds.findIndex((id) => id === bookToSave.bookId);
        if (existingBookIndex === -1) {
          setSavedBookIds([...savedBookIds, bookToSave.bookId]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isBookSaved = (bookId) => savedBookIds.includes(bookId);

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
  
      <Container>
        <h2 className='pt-5'>
          {loading
            ? 'Loading...'
            : searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for the book "${book.title}"`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                      disabled={isBookSaved(book.bookId)}
                      variant='info'
                      className='btn-block'
                      onClick={() => handleSaveBook(book)}
                    >
                      {isBookSaved(book.bookId)
                        ? 'This book has already been saved!'
                        : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
}
  
export default SearchBooks;