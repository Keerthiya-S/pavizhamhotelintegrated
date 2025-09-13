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
document.getElementById("contactForm").addEventListener("submit", async function(e) {
  e.preventDefault(); // stop default form submission

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("http://localhost:3000/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const msg = await res.text();
    document.getElementById("responseMsg").innerText = msg;

    this.reset(); // clear form
  } catch (err) {
    console.error(err);
    document.getElementById("responseMsg").innerText = "Something went wrong!";
  }
});

document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("toggleBtn");
    const extraContent = document.getElementById("extraContent");

    toggleBtn.addEventListener("click", function () {
      if (extraContent.style.display === "none") {
        extraContent.style.display = "block";
        toggleBtn.textContent = "Read Less";
      } else {
        extraContent.style.display = "none";
        toggleBtn.textContent = "Read More";
      }
    });
  });