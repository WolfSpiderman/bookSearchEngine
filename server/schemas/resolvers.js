const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    getUser: async (parent, { _id }) => {
        try {
          const user = await User.find({ _id }).populate('savedBooks');
  
          if (!user) {
            throw new Error('User not found');
          }
  
          return user;
        } catch (error) {
          throw new Error(`Failed to fetch user: ${error.message}`);
        }
      },
    searchBooks: async (parent, { query }) => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await response.json();
        
        // Extract relevant information from the response and return as SearchResult objects
        const searchResults = data.items.map(item => {
          const volumeInfo = item.volumeInfo;
          return {
            title: volumeInfo.title,
            authors: volumeInfo.authors || [],
            description: volumeInfo.description || '',
            bookId: item.id,
            image: volumeInfo.imageLinks?.thumbnail || '',
            link: volumeInfo.infoLink || ''
          };
        });
        
        return searchResults;
      } catch (error) {
        throw new Error('Failed to fetch books from Google Books API');
      }
    }
  },
  Mutations: {
    createUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user }
    },
    saveBook: async (parent, args, context) => {
        try {
            // Access the authenticated user from the context (provided by authMiddleware)
            const user = context.user;
            if (!user) {
              throw new Error('Authentication required.');
            }
        
            const { body } = args;
        
            const updatedUser = await User.findOneAndUpdate(
              { _id: user._id },
              { $addToSet: { savedBooks: body } },
              { new: true, runValidators: true }
            );
        
            return updatedUser;
          } catch (err) {
            console.log(err);
            throw err;
          }
    },
    deleteBook: async (parent, { userId, bookId }, {user}) => {
        try {
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            if (!updatedUser) {
                throw new Error("Couldn't find a user with that id!");
            }
            return updatedUser;
        } catch (err) {
            throw new Error(err.message);
        }
    },
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('No user found with this email address');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
  
        return { token, user };
      }
  }
};

export default resolvers;
