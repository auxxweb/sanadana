/**
 * Premium testimonial slider — single slide + vertical nav
 */
(function ($) {
  "use strict";

  $(function () {
  var $carousel = $(".testimonial-premium__carousel");
  if (!$carousel.length || typeof $.fn.owlCarousel !== "function") {
    return;
  }

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var isNarrow = window.matchMedia("(max-width: 767px)").matches;

  $carousel.owlCarousel({
    loop: true,
    margin: 0,
    nav: false,
    dots: false,
    items: 1,
    smartSpeed: prefersReducedMotion ? 0 : 600,
    autoplay: !prefersReducedMotion,
    autoplayTimeout: 7000,
    autoplayHoverPause: true,
    animateOut: prefersReducedMotion || isNarrow ? false : "fadeOut",
    animateIn: prefersReducedMotion || isNarrow ? false : "fadeIn",
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    freeDrag: false,
    responsive: {
      0: { items: 1 },
      768: { items: 1 },
    },
  });

  var resizeTimer;
  $(window).on("resize.testimonialPremium", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if ($carousel.data("owl.carousel")) {
        $carousel.trigger("refresh.owl.carousel");
      }
    }, 150);
  });

  var $section = $carousel.closest(".testimonial-premium");
  $section.find(".testimonial-premium__nav-btn--prev").on("click", function () {
    $carousel.trigger("prev.owl.carousel");
  });
  $section.find(".testimonial-premium__nav-btn--next").on("click", function () {
    $carousel.trigger("next.owl.carousel");
  });
  });
})(window.jQuery);
