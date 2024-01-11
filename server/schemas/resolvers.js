const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (context.user) {
        const user = await User.findOne({ _id: context.user._id });
        return user;
      }
      throw AuthenticationError;
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async(_, { bookData }, context) => {
        if (context.user) {
            const user = await User.findByIdAndUpdate({_id: context.user._id}, {
                $push: {savedBooks: bookData}
            }, {
                runValidators: true,
                new: true
            })
            return user;
        }
        throw AuthenticationError;
    },
    deleteBook: async(_, { bookId }, context) => {
        if (context.user) {
            const user = await User.findByIdAndUpdate({_id: context.user._id}, {
                $pull: {savedBooks: {bookId}}
            }, {
                new: true
            })
            return user;
        }
        throw AuthenticationError;
    }
    
  },
};

module.exports = resolvers;
