const {
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  GraphQLScalarType,
} = require("graphql");

const AddressType = new GraphQLObjectType({
  name: "Address",
  fields: () => ({
    country: { type: GraphQLString },
    city: { type: GraphQLString },
  }),
  resolve(parent) {
    return parent.address;
  },
});

const DateType = new GraphQLScalarType({
  name: "DateType",
  serialize(value) {
    return new Date(value).toDateString().split(" ").slice(1).join(" ");
  },
});

const PageInputType = new GraphQLInputObjectType({
  name: "PageInput",
  fields: {
    skip: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  },
});

const PublishedInputType = new GraphQLEnumType({
  name: "PublishInputType",
  values: {
    yes: { value: true },
    no: { value: false },
    all: { value: -1 },
  },
});

const SortInputType = new GraphQLEnumType({
  name: "SortInputType",
  values: {
    asc: { value: 1 },
    desc: { value: -1 },
  },
});

module.exports = {
  DateType,
  AddressType,
  PageInputType,
  PublishedInputType,
  SortInputType,
};
