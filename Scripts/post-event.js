document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("postForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);

    fetch("/newpost", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.redirected) {
          window.location.href = response.url;
        } else {
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
