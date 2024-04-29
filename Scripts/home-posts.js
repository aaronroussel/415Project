document.addEventListener("DOMContentLoaded", function () {
  fetchPosts();
});

function fetchPosts() {
  fetch("/getPosts")
    .then((response) => response.json())
    .then((data) => displayPosts(data))
    .catch((error) => console.error("Error fetching posts:", error));
}

function displayPosts(posts) {
  const feed = document.getElementById("feed");
  feed.innerHTML = ""; // Clear existing posts

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "card";

    // Create HTML for the post details
    const titleDiv = document.createElement("div");
    titleDiv.className = "title";
    titleDiv.textContent = post.postTitle;

    const authorDiv = document.createElement("div");
    authorDiv.className = "author";
    authorDiv.textContent = `Posted by ${post.postAuthor}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "content";
    contentDiv.textContent = post.postContent;

    // Create a container for comments
    const commentSectionDiv = document.createElement("div");
    commentSectionDiv.className = "comment-section";
    post.comments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      commentDiv.textContent = comment;
      commentSectionDiv.appendChild(commentDiv);
    });

    // Create the subscribe button
    const subscribeButton = document.createElement("button");
    subscribeButton.textContent = "Subscribe";
    subscribeButton.className = "subscribe";

    const viewPostButton = document.createElement("button");
    viewPostButton.textContent = "View Post";
    viewPostButton.className = "subscribe";

    viewPostButton.addEventListener("click", function () {
      console.log("View post button clicked."); // Debug message
      window.location.href = `/post/${post._id}`;
    });

    // Attach the event listener directly after creating the button
    subscribeButton.addEventListener("click", function () {
      console.log("Subscribe button clicked."); // Debug message
      console.log("post id: ", post._id);
      subscribeToPost(post._id);
    });

    // Append all elements to the card
    card.appendChild(titleDiv);
    card.appendChild(authorDiv);
    card.appendChild(contentDiv);
    card.appendChild(subscribeButton);
    card.appendChild(viewPostButton);
    card.appendChild(commentSectionDiv);

    // Append the card to the feed
    feed.appendChild(card);
  });
}

// Retrieve the user ID from the cookie
function getUserIdFromCookie() {
  console.log("Current cookies:", document.cookie); // Output all cookies

  if (!document.cookie) {
    console.log("No cookies found.");
    return null;
  }

  const cookies = document.cookie.split("; ").map((c) => c.trim());
  let userCookie = cookies.find((cookie) => cookie.startsWith("id="));

  if (userCookie) {
    console.log("Found user ID cookie:", userCookie);

    userCookie = decodeURIComponent(userCookie.split("=")[1]);

    if (userCookie.startsWith('"') && userCookie.endsWith('"')) {
      userCookie = userCookie.slice(1, -1);
    }

    console.log("Processed user ID:", userCookie);
    return userCookie;
  } else {
    console.log("User ID cookie not found.");
    return null;
  }
}

function subscribeToPost(postId) {
  /*
  console.log("subscribe initiated"); // Debug line to check if function is called
  const userId = getUserIdFromCookie();
  console.log(" user id found: ", userId);
  if (!userId) {
    console.error("User ID not found in cookies.");
    return;
  }
  */
  console.log("post id: ", postId);
  console.log("subscribe initiated");
  // Send a POST request to the server to subscribe to the post
  fetch("/subscribeToPost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        console.error(data.message);
      } else {
        console.log(`Subscription successful: ${data.message}`);
      }
    })
    .catch((error) => console.error("Error subscribing to post:", error));
}
