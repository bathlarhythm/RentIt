document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("listform");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("/items", {
        method: "POST",
        body: formData
      });

      const data = await response.json(); // ✅ Parse JSON

      if (response.ok) {
        alert(data.message); // "Item listed successfully"
        window.location.href = "/";
      } else {
        alert("Error: " + data.message); // Show backend error message
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  });
});
