const { defaultFieldResolver, GraphQLString } = require("graphql");
const { SchemaDirectiveVisitor } = require("graphql-tools");
const formatDate = require("date-fns/format");

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.resolve = (root, args, context, info) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      return resolver(root, args, context, info);
    };
  }
}

class DateFormatDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    const { format: defaultFormat } = this.args;
    field.args.push({
      name: "format",
      type: GraphQLString,
    });

    field.resolve = (root, { format, ...rest }, context, info) => {
      try {
        const result = resolver(root, rest, context, info);
        return formatDate(result, format || defaultFormat);
      } catch (error) {
        return "";
      }
    };
  }
}

module.exports = {
  AuthenticationDirective,
  DateFormatDirective,
};
