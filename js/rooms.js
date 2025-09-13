window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  const hero = document.querySelector(".hero-section");

  if (window.scrollY > hero.offsetHeight - 80) {
    // after hero section is scrolled
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const priceSlider = document.getElementById('priceFilter');
  const priceValue = document.getElementById('priceValue');
  const roomTypeFilter = document.getElementById('roomTypeFilter');
  const starRadios = Array.from(document.querySelectorAll('#starFilter input[name="stars"]'));
  const cards = Array.from(document.querySelectorAll('#rooms-list .room-card'));

  function updatePriceLabel() {
    priceValue.textContent = Number(priceSlider.value).toLocaleString('en-IN');
  }

  function normalizeType(str) {
    return (str || '').toLowerCase().replace(/\s*(room|suite)$/i, '').trim();
  }

  function filterRooms() {
    const maxPrice = Number(priceSlider.value || 0);
    const selectedType = normalizeType(roomTypeFilter.value);
    const selectedStars = (document.querySelector('#starFilter input[name="stars"]:checked') || {}).value || '';

    cards.forEach(card => {
      const cardPrice = Number(card.dataset.price || 0);
      const cardType = normalizeType(card.dataset.type);
      const cardStars = (card.dataset.stars || '').trim();

      let show = true;

      if (cardPrice > maxPrice) show = false;
      if (selectedType && cardType !== selectedType) show = false;
      if (selectedStars && cardStars !== selectedStars) show = false;

      const col = card.closest('[class*="col-"]');
      if (col) col.style.display = show ? '' : 'none';
    });
  }

  priceSlider.addEventListener('input', () => { updatePriceLabel(); filterRooms(); });
  roomTypeFilter.addEventListener('change', filterRooms);
  starRadios.forEach(r => r.addEventListener('change', filterRooms));

  updatePriceLabel();
  filterRooms();
});


document.getElementById("bookingForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  const res = await fetch("http://localhost:3000/reserve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const msg = await res.text();
  document.getElementById("responseMessage").innerText = msg;

  // ✅ Clear form fields after submit
  this.reset();
});
