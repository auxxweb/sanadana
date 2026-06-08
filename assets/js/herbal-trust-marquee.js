(function () {
  "use strict";

  var MQ = "(max-width: 991px)";

  function buildMarquee(strip) {
    if (strip.dataset.marqueeBuilt === "1") return;

    var items = Array.prototype.slice.call(
      strip.querySelectorAll(":scope > .herbal-trust-strip__item")
    );
    if (!items.length) return;

    var viewport = document.createElement("div");
    viewport.className = "herbal-trust-strip__viewport";

    var track = document.createElement("div");
    track.className = "herbal-trust-strip__track";

    items.forEach(function (item) {
      track.appendChild(item);
    });

    items.forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.classList.add("herbal-trust-strip__item--clone");
      clone.setAttribute("aria-hidden", "true");
      clone.removeAttribute("role");
      track.appendChild(clone);
    });

    viewport.appendChild(track);
    strip.appendChild(viewport);
    strip.classList.add("herbal-trust-strip--marquee");
    strip.dataset.marqueeBuilt = "1";
  }

  function destroyMarquee(strip) {
    if (strip.dataset.marqueeBuilt !== "1") return;

    var track = strip.querySelector(".herbal-trust-strip__track");
    if (!track) return;

    var items = Array.prototype.slice.call(
      track.querySelectorAll(
        ".herbal-trust-strip__item:not(.herbal-trust-strip__item--clone)"
      )
    );

    items.forEach(function (item) {
      strip.appendChild(item);
    });

    var viewport = strip.querySelector(".herbal-trust-strip__viewport");
    if (viewport) viewport.remove();

    strip.classList.remove("herbal-trust-strip--marquee");
    delete strip.dataset.marqueeBuilt;
  }

  function syncAll() {
    var mobile = window.matchMedia(MQ).matches;
    var strips = document.querySelectorAll(".herbal-trust-strip");

    for (var i = 0; i < strips.length; i++) {
      if (mobile) {
        buildMarquee(strips[i]);
      } else {
        destroyMarquee(strips[i]);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncAll);
  } else {
    syncAll();
  }

  var mqList = window.matchMedia(MQ);
  if (typeof mqList.addEventListener === "function") {
    mqList.addEventListener("change", syncAll);
  } else if (typeof mqList.addListener === "function") {
    mqList.addListener(syncAll);
  }
})();
