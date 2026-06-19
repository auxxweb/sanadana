(function () {
  "use strict";

  var AUTOPLAY_MS = 3000;
  var section = document.getElementById("hero-carousel");
  if (!section) return;

  var panels = Array.prototype.slice.call(section.querySelectorAll(".hero-split__panel"));
  var visuals = Array.prototype.slice.call(section.querySelectorAll(".hero-split__viz-panel"));
  var stepBtns = Array.prototype.slice.call(section.querySelectorAll(".hero-split__step"));
  var progressStops = Array.prototype.slice.call(section.querySelectorAll(".hero-split__progress-stop"));
  var progressFill = section.querySelector(".hero-split__progress-fill");
  var progressCurrent = document.getElementById("heroSplitProgressCurrent");
  var progressRoot = document.getElementById("heroSplitProgress");
  var prevBtn = section.querySelector(".hero-carousel__nav--prev");
  var nextBtn = section.querySelector(".hero-carousel__nav--next");

  var count = panels.length;
  if (!count) return;

  var index = 0;
  var timer = null;
  var paused = false;

  function goTo(i) {
    index = ((i % count) + count) % count;

    panels.forEach(function (el, n) {
      el.classList.toggle("is-active", n === index);
    });
    visuals.forEach(function (el, n) {
      el.classList.toggle("is-active", n === index);
    });
    stepBtns.forEach(function (btn, n) {
      btn.setAttribute("aria-current", n === index ? "true" : "false");
    });
    progressStops.forEach(function (btn, n) {
      btn.classList.toggle("is-active", n === index);
      btn.classList.toggle("is-past", n < index);
      btn.setAttribute("aria-current", n === index ? "true" : "false");
    });

    if (progressCurrent) {
      progressCurrent.textContent = String(index + 1);
    }
    if (progressRoot) {
      progressRoot.setAttribute("aria-valuenow", String(Math.round(((index + 1) / count) * 100)));
    }
    if (progressFill) {
      progressFill.style.width = ((index + 1) / count) * 100 + "%";
    }
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    if (paused) return;
    timer = window.setInterval(next, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function bindGotoButtons(nodes) {
    nodes.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = parseInt(btn.getAttribute("data-hero-goto"), 10);
        if (isNaN(target)) return;
        goTo(target);
        startAutoplay();
      });
    });
  }

  bindGotoButtons(stepBtns);
  bindGotoButtons(progressStops);

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      prev();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      next();
      startAutoplay();
    });
  }

  section.addEventListener("mouseenter", function () {
    paused = true;
    stopAutoplay();
  });

  section.addEventListener("mouseleave", function () {
    paused = false;
    startAutoplay();
  });

  section.addEventListener("focusin", function () {
    paused = true;
    stopAutoplay();
  });

  section.addEventListener("focusout", function (event) {
    if (!section.contains(event.relatedTarget)) {
      paused = false;
      startAutoplay();
    }
  });

  section.classList.add("hero-split--ready");
  goTo(0);
  startAutoplay();
})();
