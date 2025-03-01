const errorAll = require("./error");
const FetchAll = require("./fetch");
const SimpleAll = require("./simple");

module.exports = {
  ...FetchAll,
  ...SimpleAll,
  ...errorAll
};
