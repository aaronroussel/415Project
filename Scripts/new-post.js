document
  .getElementById("newPostForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const postTitle = document.getElementById("postTitle").value;
    const postContent = document.getElementById("postContent").value;

    // Create the post object
    const postData = {
      postTitle: postTitle,
      postContent: postContent,
    };

    // Send the post request
    fetch("/newpost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json()) // Assuming the server sends back JSON
      .then((data) => {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl; // Perform the redirection
        }
      })
      .catch((error) => console.error("Error creating post:", error));
  });
