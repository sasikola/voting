const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const db = require("./db");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server is healthy!");
});

// Routes
app.use("/auth", authRoute);
app.use("/user", userRoute);

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});