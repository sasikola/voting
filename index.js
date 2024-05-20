const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

const db = require("./db");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send("Server is healthy!");
});

// Routes
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});
