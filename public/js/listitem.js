document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("listForm");

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.name || !data.rentPrice) {
      alert("❌ Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("/items/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Your item has been listed!");
       
        window.location.href = "/";
      } else {
        const errorText = await response.text();
        alert(" Error: " + errorText);
      }
    } catch (err) {
      alert(" Network error: " + err.message);
    }
  });
});