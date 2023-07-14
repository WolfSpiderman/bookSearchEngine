const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');
const axios = require('axios');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      try {
        if (context.user) {
          return User.findOne({ _id: context.user._id }).populate('savedBooks');
        }

        throw new AuthenticationError('Authentication required');
      } catch (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
    },
    books: async () => {
        try {
            const books = await Book.find();
            return books;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
  },
  Mutation: {
        createUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            try {
                console.log(context);
                const user = context.user;
                if (!user) {
                    throw new AuthenticationError('Authentication required');
                }
        
                console.log(args);
                
                // Add bookId validation
                if (!args.book) {
                    throw new Error('book is required');
                }

                let authors = args.book.authors.map(author => author || 'Unknown Author');
                
                let book = await Book.findById(args.book.bookId);
                if (!book) {
                    book = await Book.create({
                        bookId: args.book.bookId,
                        title: args.book.title,
                        authors: authors,
                        description: args.book.description,
                        link: args.book.link,
                        image: args.book.image
                    });
                }
        
                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true, runValidators: true }
                ).populate('savedBooks');
        
                return updatedUser;
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        deleteBook: async (parent, args, context) => {
          try {
            if (!context.user) {
              throw new AuthenticationError('Authentication required');
            }
        
            console.log(args.bookId);
            const updatedUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId: args.bookId } } },
              { new: true }
            ).populate('savedBooks');
        
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
    
    module.exports = resolvers;
    