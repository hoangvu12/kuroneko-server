const animeRoute = require("./anime");

module.exports = (app) => {
  app.use("/api/v1/anime", animeRoute);
};
