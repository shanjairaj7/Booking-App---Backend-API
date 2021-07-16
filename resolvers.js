const { hashPassword, generateToken, comparePassword } = require("./helpers/userHelpers");
const { createEventValidation } = require("./validation/eventValidation");
const { signupValidation, signInValidation } = require("./validation/userValidation");
const DataLoader = require("dataloader");

const { User, Event } = require("../backend/models/index");

const userLoader = new DataLoader((userIds) => User.find({ _id: { $in: userIds } }));
const eventLoader = new DataLoader((eventIds) => Event.find({ _id: { $in: eventIds } }));

const resolvers = {
  Query: {
    events: async (_, __, context) => {
      const events = await context.models.Event.find();
      return events;
    },
    bookings: async (_, __, context) => {
      const bookings = await context.models.Event.find({ creator: context.user.id });
      return bookings;
    },
    event: async (_, { input }, context) => {
      const event = await eventLoader.load(input.id);
      return event;
    },
  },
  Mutation: {
    signup: async (_, args, context) => {
      // Validate the input
      const { input } = args;
      const error = await signupValidation(input);
      if (error) {
        throw new Error(error.details[0].message);
      }

      //   Check if the user is already signed up
      const userExists = await context.models.User.findOne({ email: input.email });
      if (userExists) {
        throw new Error("User already exists");
      }

      //   Sign up the user
      const hashedPassword = await hashPassword(input.password);
      const newUser = new context.models.User({
        ...input,
        password: hashedPassword,
      });
      const user = await newUser.save();

      return user;
    },
    signin: async (_, args, context) => {
      // Validate the input
      const { input } = args;
      const error = await signInValidation(input);
      if (error) {
        throw new Error(error.details[0].message);
      }

      //   Check if the user has signed up
      const existingUser = await context.models.User.findOne({ email: input.email });
      if (!existingUser) {
        throw new Error("User does not exist");
      }

      const passwordMatches = await comparePassword(input.password, existingUser.password);
      if (!passwordMatches) {
        throw new Error("Password does not match");
      }

      const token = generateToken({ id: existingUser.id, name: existingUser.name });
      const result = { ...existingUser._doc, token, id: existingUser._id };
      return result;
    },
    createEvent: async (_, args, context) => {
      const { input } = args;
      const error = await createEventValidation(input);
      if (error) {
        throw new Error(error.details[0].message);
      }

      const newEvent = new context.models.Event({
        ...input,
        creator: context.user.id,
      });
      const event = await newEvent.save();

      return event;
    },
    bookEvent: async (_, { input }, context) => {
      const user = await context.models.User.findOne({
        _id: context.user.id,
        bookings: { $in: input.eventId },
      });
      if (user) {
        throw new Error("You have already booked this event");
      }

      const updatedUser = await context.models.User.findOneAndUpdate(
        { _id: context.user.id },
        { $push: { bookings: input.eventId } },
        { new: true }
      );

      return updatedUser;
    },
    cancelBooking: async (_, { input }, context) => {
      const user = await context.models.User.findOne({
        _id: context.user.id,
        bookings: { $in: input.eventId },
      });

      if (!user) {
        throw new Error("You have not booked this event");
      }

      const updatedUser = await context.models.User.findOneAndUpdate(
        { _id: context.user.id },
        { $pull: { bookings: input.eventId } },
        { new: true }
      );

      return updatedUser;
    },
  },
  Event: {
    creator: async (event, _, context) => {
      const user = await userLoader.load(event.creator.toString());
      return user;
    },
  },
  User: {
    password: () => {
      return "";
    },
    bookings: async (user, _, context) => {
      const booking = await user.bookings.map((userBooking) =>
        eventLoader.load(userBooking.toString())
      );
      return booking;
    },
  },
};

module.exports = resolvers;
