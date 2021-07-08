const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const Route = require("./routes");

app.use(cors());

Route(app); // Routes

app.listen(PORT, () => {
  console.log("Listening at", PORT);
});
