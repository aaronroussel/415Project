document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("accountForm");
  const modal = document.getElementById("accountModal");
  const span = document.getElementsByClassName("close")[0];
  const createAccountButton = document.getElementById("create_account_button");

  createAccountButton.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Button clicked");
    window.location.href = "/create_account";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);

    fetch("/login", {
      method: "POST",
      body: formData,
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

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});
