document.addEventListener("DOMContentLoaded", function () {
  fetchNotifications(); // Fetch notifications when the document is loaded
});

function fetchNotifications() {
  fetch("/getNotifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // The body could be empty if you're just retrieving based on cookie
  })
    .then((response) => response.json())
    .then((notifications) => displayNotifications(notifications))
    .catch((error) => console.error("Error fetching notifications:", error));
}

function displayNotifications(notifications) {
  const feed = document.getElementById("feed");
  feed.innerHTML = ""; // Clear existing content

  notifications.forEach((notification) => {
    const card = document.createElement("div");
    card.className = "card";

    // Create HTML for the notification details
    const messageDiv = document.createElement("div");
    messageDiv.className = "content";
    messageDiv.textContent = notification.message;

    // Append all elements to the card
    card.appendChild(messageDiv);

    // Append the card to the feed
    feed.appendChild(card);
  });
}
