document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.booking-form').forEach(form => {
    const rentPrice = parseFloat(form.querySelector('.total-price').textContent);
    const daysInput = form.querySelector('input[name="days"]');
    const totalPriceEl = form.querySelector('.total-price');

    daysInput.addEventListener('input', () => {
      let days = parseInt(daysInput.value);
      if (isNaN(days) || days < 1) days = 1;
      totalPriceEl.textContent = (rentPrice * days).toFixed(2);
    });
  });
});
