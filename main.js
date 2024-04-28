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
const { Post, Comment } = require("./Controllers/PostController");
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
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.get("/create_account", (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/create_account.html"));
});

app.get("/newpost", async (req, res) => {
  /*const newPost = new Post("Test", "Test", req.cookies.id);
  try {
    const created = await newPost.createPost(client);
  } catch (error) {
    console.log(error);
  }*/
  res.sendFile(path.join(__dirname, "/Pages/posttest.html"));
});

app.get("/login", async (req, res) => {
  let cookie = req.cookies;
  let auth = await cookieAuth(cookie, client);
  if (auth) {
    res.redirect("/chat");
  } else {
    res.sendFile(path.join(__dirname, "/Pages/login.html"));
  }
});

app.get("/registration-successful", (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/registration-successful.html"));
});

app.get("/post-successful", (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/post-successful.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/chat.html"));
});

app.get("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/login");
});

app.post("/create_account", async (req, res) => {
  console.log("Received Post Request");
  console.log("Form Data:", req.fields);
  const newUserData = {
    username: req.fields.userName,
    password: req.fields.password,
  };
  const newUser = new User(newUserData);
  const created = await newUser.createAccount(client);
  if (!created) {
    res.send("account already exists");
  } else {
    console.log("Redirecting client....");
    res.redirect("/registration-successful");
  }
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

app.post("/newpost", async (req, res) => {
  console.log("Received create post request");
  console.log("Form Data:", req.fields);
  const newPostData = {
    postTitle: req.fields.postTitle,
    postContent: req.fields.postContent,
    postAuthor: req.cookies.id,
  };
  const newPost = new Post(newPostData);
  const postCreated = await newPost.createPost(client);
  console.log("Redirecting client....");
  res.redirect("/post-successful");
}
);
  

// ------------------ End of Routes ------------------
//

// ------------------ Start of Server ------------------
//

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// ------------------ End of Server ------------------

// Start of Socket.io
