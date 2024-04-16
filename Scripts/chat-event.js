document.addEventListener("DOMContentLoaded", function () {
  var socket = io(); // Connect to the server
  const messageBox = document.getElementById("message-box");
  const sendButton = document.getElementById("send-btn");
  const logoutButton = document.getElementById("logout-btn");
  const ulElement = document.getElementById("users");
  // Handle incoming messages
  socket.on("chat message", function (data) {
    if (data.text) {
      var item = document.createElement("li");
      item.innerHTML =
        '<span class="username">' + data.user + ":</span> " + data.text;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
  socket.on("getUsers", function (userData) {
    var users = userData.users;
    var userList = document.getElementById("users");
    userList.innerHTML = "";
    users.forEach(function (user) {
      var item = document.createElement("li");
      item.innerHTML = '<span class="username">' + user + "</span> ";
      userList.appendChild(item);
    });
  });

  // Send message
  sendButton.addEventListener("click", function () {
    var messageText = messageBox.value;
    socket.emit("chat message", messageText); // Send message to server
    messageBox.value = ""; // Clear the input box
    return false;
  });

  messageBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action of the Enter key

      // Trigger click on send button or directly call the send message function
      document.getElementById("send-btn").click();
    }
  });

  logoutButton.addEventListener("click", function () {
    window.location.href = "/logout";
  });

  // Function to be executed when an li is clicked
  function liClicked() {
    var username = this.textContent.trim();
    messageBox.value = "@" + username + " "; // Add @ symbol before the username
    messageBox.focus(); // Set focus to the message box after inserting the username
  }

  // Event delegation for dynamically added li elements to the ul with ID 'users'
  ulElement.addEventListener("click", function (event) {
    // Check if the clicked element is an li
    if (event.target && event.target.tagName === "LI") {
      liClicked(event); // Call liClicked and pass the event
    }
    // Check if the clicked element is within an li (e.g., the span)
    else if (event.target && event.target.parentElement.tagName === "LI") {
      liClicked(event); // Call liClicked and pass the event
    }
  });
});
