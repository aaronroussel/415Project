form.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(form);
  const username = formData.get("username"); // Match these names with your form input names
  const password = formData.get("password");

  fetch("/create_account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Sending as JSON
    },
    body: JSON.stringify({ username, password }), // Convert formData to JSON
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        return response.text();
      }
    })
    .then((data) => {
      modal.style.display = "block";
      document.getElementById("httpResponse").textContent = data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
