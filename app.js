const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Require static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Database Setup
mongoose
  .connect("mongodb://localhost/Forget")
  .then(() => {
    console.log("Connect Sucess");
  })
  .catch((err) => console.log(err));

// Tmporarry Data
let user = {
  id: "xxxxx",
  email: "xxx@xxx.com",
  password: "123456",
};

//Temporary JWT Secret
const SCRET = "sUPER";

app.get("/", (req, res) => {
  res.send("Heelo World    ");
});
app.post("/hello", (req, res) => {
  res.send("Hello");
});
app.get("/forget-password", (req, res, next) => {
  res.render("forgot-password");
});

app.post("/forget-password", (req, res, next) => {
  const { email } = req.body;

  // Chekc Database
  if (email !== user.email) {
    return res.send("User Not Registered");
  }

  // User exsist . Create Link

  const newSecret = SCRET + user.password;
  const payload = {
    email: user.email,
    id: user.id,
  };

  const token = jwt.sign(payload, newSecret, {
    expiresIn: "15m",
  });

  const link = `http://localhost:3000/reset-password/${user.id}/${token}`;
  console.log(link);
  res.send("Password Link Sent");
});

app.get("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;

  //chek id
  if (id !== user.id) {
    return res.send("Invalid id");
  }

  // valid id
  const newScret1 = SCRET + user.password;

  try {
    const payload = jwt.verify(token, newScret1);
    res.render("reset-password", { email: user.email });
  } catch (error) {
    console.log(error.message);
    return res.send(error.message);
  }
});

app.post("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  //chek id
  if (id !== user.id) {
    return res.send("Invalid id");
  }

  const newScret1 = SCRET + user.password;
  try {
    const payload = jwt.verify(token, newScret1);
    console.log(payload);

    user.password = password;
    res.send(user);
  } catch (error) {
    console.log(error.message);
    return res.send(error.message);
  }
});

app.listen(3000, () => {
  console.log("Server is running at 3000");
});
