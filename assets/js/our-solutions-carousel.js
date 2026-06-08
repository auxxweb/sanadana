/**
 * Our Solutions — horizontal product carousel + category filter tabs
 */
(function ($) {
  "use strict";

  var slideFilters = [
    ".digestive_care",
    ".respiratory_care",
    ".wellness_products",
    ".immunity_care",
    ".herbal_supplements",
  ];

  var amazonCtasBound = false;

  function bindAmazonCtas($root) {
    if (amazonCtasBound) {
      return;
    }
    amazonCtasBound = true;

    $root.on(
      "mousedown.amazonCta touchstart.amazonCta",
      "a.solution-product-card__cta-amazon",
      function (e) {
        e.stopPropagation();
      }
    );

    $root.on("click.amazonCta", "a.solution-product-card__cta-amazon", function (e) {
      e.stopPropagation();
      var url = this.getAttribute("href");
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
      e.preventDefault();
    });
  }

  function initOurSolutionsCarousel() {
    var $carousel = $(".our-solutions-carousel");
    var $panel = $(".our-solutions-panel");
    var $filters = $panel.find(".our-solutions-filters li");

    if (!$carousel.length || typeof $.fn.owlCarousel !== "function") {
      return;
    }

    if ($carousel.hasClass("owl-loaded")) {
      return;
    }

    bindAmazonCtas($carousel);

    $carousel.owlCarousel({
      loop: true,
      margin: 24,
      nav: false,
      dots: false,
      items: 1,
      smartSpeed: 550,
      autoplay: false,
      mouseDrag: true,
      touchDrag: true,
      pullDrag: true,
      freeDrag: false,
      responsive: {
        0: { items: 1 },
        768: { items: 1 },
        1200: { items: 1 },
      },
    });

    $carousel.find(".owl-nav").remove();

    function setActiveFilter(index) {
      var selector = slideFilters[index];
      if (!selector) {
        return;
      }
      $filters.removeClass("active");
      $filters.filter('[data-filter="' + selector + '"]').addClass("active");
    }

    $carousel.on("changed.owl.carousel", function (event) {
      if (!event.namespace) {
        return;
      }
      var index = event.relatedTarget.normalize(event.item.index, true);
      if (
        index === 0 &&
        $filters.filter('[data-filter=".all"].active').length
      ) {
        return;
      }
      setActiveFilter(index);
    });

    $filters.on("click", function (e) {
      e.preventDefault();
      var $tab = $(this);
      var slide = parseInt($tab.attr("data-slide"), 10);

      $filters.removeClass("active");
      $tab.addClass("active");

      if (!isNaN(slide)) {
        $carousel.trigger("to.owl.carousel", [slide, 400, true]);
      }

      return false;
    });
  }

  $(initOurSolutionsCarousel);
  $(window).on("load", initOurSolutionsCarousel);
})(window.jQuery);
