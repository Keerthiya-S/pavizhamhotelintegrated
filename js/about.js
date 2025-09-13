document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter");

  counters.forEach(counter => {
    counter.innerText = "0";

    const target = +counter.getAttribute("data-target");
    let current = 0;

    const step = target / 100; // divide into 100 steps for smoothness

    const updateCounter = () => {
      if (current < target) {
        current += step;
        counter.innerText = Math.floor(current);
        requestAnimationFrame(updateCounter); // smoother than setTimeout
      } else {
        counter.innerText = target; // final fix to exact number
      }
    };

    updateCounter();
  });
});
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