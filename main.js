const express = require("express");
const path = require("path");
const app = express();
const port = 8000;
const http = require("http");
const formidable = require("express-formidable");
const DBconnection = require("./Controllers/DatabaseController");
const client = DBconnection.getInstance().client;
const cookieParser = require("cookie-parser");
const server = http.createServer(app);
const User = require("./Controllers/UserController");
const cookieAuth = require("./Controllers/AuthController").cookieAuth;
const cookie = require("cookie");

// Static files
app.use(express.static(__dirname));
app.use(formidable());
app.use(cookieParser());

// Routes
app.get("/", async (req, res) => {
  let cookie = req.cookies;
  let auth = await cookieAuth(cookie, client);
  if (auth) {
    res.redirect("/chat");
  } else {
    res.redirect("/login");
  }
});

app.get("/create_account", (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/create_account.html"));
});

app.get("/login", async (req, res) => {
  let cookie = req.cookies;
  let auth = await cookieAuth(cookie, client);
  if (auth) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "/Pages/login.html"));
  }
});

app.get("/registration-successful", (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/registration-successful.html"));
});

app.get("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  let userData = {
    username: req.fields.userName,
    password: req.fields.password,
    id: null,
  };
  const user = new User(userData);
  const login = await user.login(client);
  if (login) {
    res.cookie("id", user.id, {
      httpOnly: true,
    });
    res.redirect("/chat");
  } else {
    res.send("Incorrect Login Information");
  }
});

// ------------------ End of Routes ------------------
//

// ------------------ Start of Server ------------------
//

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
