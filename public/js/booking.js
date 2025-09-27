document.addEventListener('DOMContentLoaded', () => {
  const messageBox = document.getElementById('messageBox');

  document.querySelectorAll('.booking-form').forEach(form => {
    const rentPrice = parseFloat(form.querySelector('.total-price').textContent);
    const daysInput = form.querySelector('input[name="days"]');
    const totalPriceEl = form.querySelector('.total-price');

    // Live update total price
    daysInput.addEventListener('input', () => {
      let days = parseInt(daysInput.value);
      if (isNaN(days) || days < 1) days = 1;
      totalPriceEl.textContent = (rentPrice * days).toFixed(2);
    });

    // Handle form submit with AJAX (JSON)
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        itemId: form.itemId.value,
        days: form.days.value
      };

      try {
        const response = await fetch("/rentals/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          messageBox.textContent = data.message || "Booking successful!";
          messageBox.style.backgroundColor = "#d4edda";
          messageBox.style.color = "#155724";
          messageBox.style.display = "block";
        } else {
          messageBox.textContent = data.message || "Booking failed!";
          messageBox.style.backgroundColor = "#f8d7da";
          messageBox.style.color = "#721c24";
          messageBox.style.display = "block";
        }
      } catch (err) {
        messageBox.textContent = "Network error: " + err.message;
        messageBox.style.backgroundColor = "#f8d7da";
        messageBox.style.color = "#721c24";
        messageBox.style.display = "block";
      }
    });
  });
});
