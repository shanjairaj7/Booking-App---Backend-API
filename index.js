const { ApolloServer } = require("apollo-server");
const resolvers = require("./resolvers");
const typeDefs = require("./typeDefs");
const mongoose = require("mongoose");

const models = require("./models/index");

const dotenv = require("dotenv");
dotenv.config();

const { decryptJWT } = require("./helpers/userHelpers");
const { AuthenticationDirective, DateFormatDirective } = require("./directives/AuthDirectives");
const { makeExecutableSchema } = require("graphql-tools");

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives: {
      authenticated: AuthenticationDirective,
      formatDate: DateFormatDirective,
    },
  }),
  context({ req }) {
    const token = req.headers.authtoken;
    const user = decryptJWT(token);

    return {
      models,
      user,
    };
  },
});

mongoose
  .connect(process.env.MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("MongoDB Connected successfully");
  })
  .catch((err) => {
    console.log(`Error when connecting to MongoDB ${err}`);
  });

const port = process.env.PORT || 4000;

server
  .listen(port)
  .then(({ url }) => {
    console.log(`🚀 Server is running on ${url}`);
  })
  .catch((err) => {
    console.log(`❗️ Error when running server ${err}`);
  });
