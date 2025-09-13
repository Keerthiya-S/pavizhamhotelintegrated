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
