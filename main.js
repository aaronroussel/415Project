const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const http = require("http");
const formidable = require("express-formidable");
const DBconnection = require("./Controllers/DatabaseController");
const client = DBconnection.getInstance().client;
const cookieParser = require("cookie-parser");
const server = http.createServer(app);
const User = require("./Controllers/UserController");
const Post = require("./Controllers/PostController");
const Comment = require("./Controllers/CommentController");
const Notification = require("./Controllers/NotificationController");
const cookieAuth = require("./Controllers/AuthController").cookieAuth;
const cookie = require("cookie");

// Static files
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

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
  let cookie = req.cookies;
  let auth = await cookieAuth(cookie, client);
  if (auth) {
    res.sendFile(path.join(__dirname, "/Pages/posttest.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/login", async (req, res) => {
  let cookie = req.cookies;
  let auth = await cookieAuth(cookie, client);
  if (auth) {
    res.redirect("/home");
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

app.get("/home", async (req, res) => {
  let cookie = req.cookies;
  let auth = await cookieAuth(cookie, client);
  if (auth) {
    res.sendFile(path.join(__dirname, "/Pages/home.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/login");
});

/* app.get("/post/:postId", async (req, res) => {
  res.sendFile(path.join(__dirname, "Pages/post.html"));
});
*/

app.get("/post/:postId", async (req, res) => {
  let cookie = req.cookies;
  let auth = await cookieAuth(cookie, client);
  if (auth) {
    try {
      const postId = req.params.postId;
      const post = await Post.fetchPost(client, postId); // Fetch your post based on postId
      console.log(post);
      comments = await Comment.getComments(client, postId); // Fetch comments based on postId
      for (let comment of comments) {
        post.comments.push(comment.commentContent);
      }

      // Convert MongoDB ObjectId to string
      const formattedPost = {
        ...post,
        _id: post._id.toString(), // Convert ObjectId to string
        postAuthor: post.postAuthor.toString(), // Assuming postAuthor is an ObjectId
      };

      // Serve HTML with embedded post data
      const responseHtml = `
      <!doctype html>
      <html lang="en">
          <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Post Details</title>
              <link rel="stylesheet" href="/Styles/post-style.css" />
          </head>
          <body>
              <nav class="menu-bar">
                  <button onclick="location.href='/myfeed'">My Feed</button>
                  <button onclick="location.href='/home'">Home</button>
                  <button onclick="location.href='/notifications'">
                      Notifications
                  </button>
                  <button onclick="location.href='/create-post'">
                      Create New Post
                  </button>
              </nav>
              <div id="post-container" class="card">
                  <!-- Placeholder for dynamically loaded post content -->
              </div>
              <!-- Comment Section and Form -->
              <div class="comment-section" id="comment-section">
                  <!-- Dynamically loaded comments will go here -->
              </div>
              <script>
                  const initialPostData = ${JSON.stringify(formattedPost)};
              </script>
              <script src="/Scripts/post.js"></script>
          </body>
      </html>

        `;
      res.send(responseHtml);
    } catch (error) {
      res.status(500).send("Error fetching post data");
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/addComment", async (req, res) => {
  const { postId, comment } = req.body;
  const userId = req.cookies.id;
  const newComment = await Comment.createComment(
    client,
    userId,
    postId,
    comment,
  );
  await Post.notifySubscribers(client, postId);
  res.json({ success: true, message: "Comment added successfully" });
});

app.get("/showcookies", (req, res) => {
  res.send(req.cookies);
});

app.get("/notifications", async (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/notifications.html"));
});

app.get("/myfeed", async (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/myfeed.html"));
});

app.get("/create-post", async (req, res) => {
  res.sendFile(path.join(__dirname, "/Pages/create-post.html"));
});

app.post("/newpost", async (req, res) => {
  console.log("Received create post request");
  console.log("Form Data:", req.body);
  const newPostData = {
    postTitle: req.body.postTitle,
    postContent: req.body.postContent,
    postAuthor: req.cookies.id,
  };
  const newPost = new Post(newPostData);
  const postCreated = await newPost.createPost(client);

  console.log("New Post Created ID:", postCreated);
  console.log("Redirecting client....");
  res.json({ redirectUrl: "/post/" + postCreated }); // Send the redirect URL in the response
});

app.post("/subscribeToPost", async (req, res) => {
  console.log("Subscribing to post...");
  console.log(req.body); // Log the request body to confirm the structure
  const { postId } = req.body; // Extract postId from the request body
  const userId = req.cookies.id; // Extract userId from the cookies
  console.log("Post ID:", postId, "User ID:", userId); // Log both IDs for verification

  try {
    // Ensure both userId and postId are passed to the subscribe method
    await Post.subscribe(client, userId, postId);
    res.json({ message: "Subscription successful" });
  } catch (error) {
    console.error("Error during subscription:", error);
    res.status(500).json({ error: true, message: "Error subscribing to post" });
  }
});

app.post("/unsubscribeToPost", async (req, res) => {
  const { postId } = req.body;
  const userId = req.cookies.id;
  try {
    await Post.unsubscribe(client, userId, postId);
    res.json({ message: "Unsubscription successful" });
  } catch (error) {
    console.error("Error during unsubscription:", error);
    res
      .status(500)
      .json({ error: true, message: "Error unsubscribing to post" });
  }
});

app.post("/getNotifications", async (req, res) => {
  const userId = req.cookies.id; // Ensure cookies are correctly parsed
  try {
    const notifications = await Notification.getNotifications(client, userId);
    console.log("notifications: ", notifications);
    res.send(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    res.status(500).send("Error fetching notifications");
  }
});

app.post("/login", async (req, res) => {
  let userData = {
    username: req.body.username, // changed from userName to username
    password: req.body.password,
    id: null,
  };
  console.log(userData);
  const user = new User(userData);
  const login = await user.login(client);
  if (login) {
    console.log("Setting user ID cookie:", user.id);
    res.cookie("id", user.id, { httpOnly: false, path: "/", sameSite: "lax" });
    res.redirect("/home");
  } else {
    res.send("Incorrect Login Information");
  }
});

app.post("/create_account", async (req, res) => {
  console.log("Received Post Request");
  console.log("Form Data:", req.body); // Changed from req.fields to req.body
  const newUserData = {
    username: req.body.username, // Note: Ensure the field names match the form input names
    password: req.body.password,
  };
  const newUser = new User(newUserData);
  const created = await newUser.createAccount(client);
  if (!created) {
    res.send("Account already exists");
  } else {
    console.log("Redirecting client....");
    res.redirect("/registration-successful");
  }
});

app.post("/newpost", async (req, res) => {
  console.log("Received create post request");
  console.log("Form Data:", req.body); // Changed from req.fields to req.body
  const newPostData = {
    postTitle: req.body.postTitle,
    postContent: req.body.postContent,
    postAuthor: req.cookies.id,
  };
  const newPost = new Post(newPostData);
  const postCreated = await newPost.createPost(client);
  // get the id of the new post

  console.log("Redirecting client....");
  res.redirect("/post/" + postCreated);
});

//create a route that fetches all posts from the database
app.get("/getPosts", async (req, res) => {
  const posts = await Post.fetchPosts(client);
  // loop through the posts and fetch comments for each post then add to post object
  for (let post of posts) {
    console.log("fetching comments");
    comments = await Comment.getComments(client, post._id);
    for (let comment of comments) {
      post.comments.push(comment.commentContent);
      console.log(comment.commentContent);
    }
  }
  console.log(posts);
  res.send(posts);
});

app.post("/fetchPost", async (req, res) => {
  let { postId } = req.body;
  const post = await Post.fetchPost(client, postId);
  comments = await Comment.getComments(client, postId);
  for (let comment of comments) {
    post.comments.push(comment.commentContent);
    console.log(comment.commentContent);
  }
  res.send(post);
});

app.post("/getSubscribedPosts", async (req, res) => {
  const userId = req.cookies.id;

  try {
    const posts = await Post.fetchSubscribedPosts(client, userId);
    for (let post of posts) {
      console.log("fetching comments");
      comments = await Comment.getComments(client, post._id);
      for (let comment of comments) {
        post.comments.push(comment.commentContent);
        console.log(comment.commentContent);
      }
    }
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: true, message: "Error fetching posts" });
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

// ------------------ End of Server ------------------

// Start of Socket.io
