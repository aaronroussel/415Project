document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("accountForm");
  const modal = document.getElementById("accountModal");
  const createAccountButton = document.getElementById("create_account_button");

  // Move this outside and directly inside the DOMContentLoaded listener
  createAccountButton.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Create account button clicked");
    window.location.href = "/create_account";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const username = formData.get("username"); // Ensure 'username' matches your form's input name attribute
    const password = formData.get("password"); // Ensure 'password' matches your form's input name attribute

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Indicating JSON data being sent
      },
      body: JSON.stringify({ username, password }), // Convert formData to JSON
    })
      .then((response) => {
        if (response.redirected) {
          window.location.href = response.url;
        } else {
          modal.style.display = "block";
          return response.text();
        }
      })
      .then((data) => {
        if (data) {
          document.getElementById("httpResponse").textContent = data;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
