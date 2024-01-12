import { useState } from 'react';

import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { useQuery, useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';
import { searchGoogleBooks } from '../utils/API';
import { GET_ME } from '../utils/queries';
import { saveBookIds } from '../utils/localStorage';

const SearchBooks = async () => {

  const [saveBook] = useMutation(SAVE_BOOK);
  const {loading, data} = useQuery(GET_ME);
  const userData = data?.me||{};

  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  
    try {
      const response = await searchGoogleBooks();
      const books = response.items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(books); 
    } catch (err) {
      console.error(err);
    }

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    if (!searchInput) {
      return false;
    }

    SearchBooks(searchInput);

    setSearchInput('');

  };

  const handleSaveBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await saveBook({
        variables: {bookId}
      })
      saveBookIds(bookId);
    } catch (err) {
      console.error(err);
    }
  };

    // if data isn't here yet, say so
    if (loading) {
      return <h2>LOADING...</h2>;
    }

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
                  value={userData.searchInput}
                  onChange={(e) => userData.setSearchInput(e.target.value)}
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
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={userData.savedBookIds?.some((savedBookId) => savedBookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {userData.savedBookIds?.some((savedBookId) => savedBookId === book.bookId)
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
};

export default SearchBooks;
