document.addEventListener("DOMContentLoaded", function () {
  fetchSubscribedPosts();
});

function fetchSubscribedPosts() {
  // Set the user ID in the headers to fetch subscribed posts
  fetch("/getSubscribedPosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => displayPosts(data)) // Use the same display function
    .catch((error) => console.error("Error fetching subscribed posts:", error));
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
    subscribeButton.textContent = "Unsubscribe";
    subscribeButton.className = "subscribe";

    // Attach the event listener directly after creating the button
    subscribeButton.addEventListener("click", function () {
      console.log("Subscribe button clicked."); // Debug message
      unsubscribeToPost(post._id);
    });

    // Append all elements to the card
    card.appendChild(titleDiv);
    card.appendChild(authorDiv);
    card.appendChild(contentDiv);
    card.appendChild(subscribeButton);
    card.appendChild(commentSectionDiv);

    // Append the card to the feed
    feed.appendChild(card);
  });
}

// Retrieve the user ID from the cookie
function getUserIdFromCookie() {
  const cookies = document.cookie.split("; ");
  const userCookie = cookies.find((cookie) => cookie.startsWith("userId="));
  return userCookie ? userCookie.split("=")[1] : null;
}

function unsubscribeToPost(postId) {
  console.log("subscribe initiated"); // Debug line to check if function is called
  const userId = getUserIdFromCookie();
  if (!userId) {
    console.error("User ID not found in cookies.");
    return;
  }
  // Send a POST request to the server to subscribe to the post
  fetch("/unsubscribeToPost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId, userId }),
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
