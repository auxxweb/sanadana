/**
 * Premium footer — scroll-to-top visibility
 */
(function () {
  "use strict";

  var btn = document.getElementById("footer-scroll-top");
  if (!btn) {
    return;
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function toggleScrollTop() {
    if (window.scrollY > 400) {
      btn.classList.add("is-visible");
    } else {
      btn.classList.remove("is-visible");
    }
  }

  window.addEventListener("scroll", toggleScrollTop, { passive: true });
  toggleScrollTop();
})();
