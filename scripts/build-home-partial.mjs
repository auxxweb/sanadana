import fs from "fs";

const index = fs.readFileSync("index.html", "utf8");
const aboutHtml = fs.readFileSync("about.html", "utf8");
const testimonialHtml = fs.readFileSync("testimonial.html", "utf8");

function sliceBetween(source, start, end) {
  const s = source.indexOf(start);
  const e = source.indexOf(end, s);
  if (s < 0 || e < 0) throw new Error(`Missing: ${start}`);
  return source.slice(s, e + end.length);
}

function productSlide(cat, img, alt, category, title, tagline, desc, bullets, url) {
  const highlights = bullets
    .map((b) => `                            <li><i class="fas fa-check" aria-hidden="true"></i>${b}</li>`)
    .join("\n");
  return `                <div class="solution-product-slide">
                <article class="solution-product-card ${cat}">
                    <div class="solution-product-card__inner">
                        <figure class="solution-product-card__media">
                            <img src="${img}" alt="${alt}" loading="lazy" decoding="async">
                        </figure>
                        <div class="solution-product-card__body">
                            <span class="solution-product-card__category">${category}</span>
                            <h3><a href="${url}">${title}</a></h3>
                            <p class="solution-product-card__tagline">${tagline}</p>
                            <p class="solution-product-card__desc">${desc}</p>
                            <ul class="solution-product-card__highlights">
${highlights}
                            </ul>
                            <a href="${url}" class="theme-btn-one solution-product-card__cta"><span>Shop now</span></a>
                        </div>
                    </div>
                </article>
                </div>`;
}

const slides = [
  productSlide(
    "digestive_care",
    "https://shop.sanadanaherbals.com/cdn/shop/files/2_5a88ca36-07e8-4e00-ae03-b87dd6769404.jpg?v=1752082653",
    "Arshopilecare ayurvedic medicine for piles relief",
    "Digestive Care",
    "Arshopilecare – Ayurvedic Medicine for Piles Relief",
    "Classical herbal support for comfort and daily digestive balance.",
    "A trusted Ayurvedic formulation for piles-related discomfort and long-term digestive wellness.",
    ["Natural herbal ingredients", "GMP-certified manufacturing", "Root-cause focused care"],
    "https://shop.sanadanaherbals.com/products/arshopilecare"
  ),
  productSlide(
    "respiratory_care",
    "https://shop.sanadanaherbals.com/cdn/shop/files/2_ae32359b-7dbf-4ac9-97e0-d000c3b61e3b.jpg?v=1752586105",
    "Sand-Cof herbal cough syrup",
    "Respiratory Care",
    "Sand-Cof – Ayurvedic Herbal Cough Syrup",
    "Soothing herbal cough care with a pleasant taste.",
    "Plant-based ingredients to support respiratory comfort without harsh chemicals.",
    ["Herbal cough syrup formula", "Family-friendly wellness", "Ayurvedic respiratory support"],
    "https://shop.sanadanaherbals.com/collections/new-products/products/sand-cof"
  ),
  productSlide(
    "wellness_products",
    "https://shop.sanadanaherbals.com/cdn/shop/files/1_6c3f7cda-7ccc-4295-ab36-4502381c950d.jpg?v=1755514247",
    "SD Himo Plus ayurvedic iron tonic",
    "Wellness Products",
    "SD Himo Plus – Herbal Iron Replenishment Tonic",
    "Ayurvedic iron support for energy and vitality.",
    "Supports blood health and daily energy using time-tested herbal tonics.",
    ["Iron replenishment support", "Ayurvedic tonic tradition", "Daily wellness use"],
    "https://shop.sanadanaherbals.com/collections/new-products/products/sd-himo-plus"
  ),
  productSlide(
    "immunity_care",
    "https://shop.sanadanaherbals.com/cdn/shop/files/1_95339362-4f56-4219-b248-ffa8fffae66b.jpg?v=1755514308",
    "Aminohit ayurvedic digestive wellness tonic",
    "Immunity & Digestion",
    "Aminohit – Ayurvedic Digestive Wellness Tonic",
    "Herbal digestive care for everyday comfort.",
    "Supports digestion and internal balance as part of holistic wellness.",
    ["Digestive wellness support", "Natural herbal actives", "GMP-quality production"],
    "https://shop.sanadanaherbals.com/products/aminohit"
  ),
  productSlide(
    "herbal_supplements",
    "https://shop.sanadanaherbals.com/cdn/shop/files/1_d8fd68da-d6b5-4a30-a4c1-52d4ab81dda8.jpg?v=1755514678",
    "Dhathriarishtam classical ayurvedic tonic",
    "Herbal Supplements",
    "Dhathriarishtam – Classical Ayurvedic Wellness Tonic",
    "Traditional rasayana-style daily wellness support.",
    "A classical Ayurvedic tonic for holistic vitality and long-term herbal nourishment.",
    ["Classical Ayurvedic formula", "Daily wellness tonic", "Trusted herbal tradition"],
    "https://shop.sanadanaherbals.com/products/dhathriarishtam"
  ),
].join("\n\n");

const herbalTrust = `<!-- our-category-section -->
<section class="service-section service-section--herbal-trust">
    <div class="auto-container">
        <div class="sec-title mb_50 centred">
            <div class="sub-title">
                <motion class="icon-box"><img src="assets/images/svg-logo-1.png" style="width: 2rem;" alt="Ayurvedic herbal wellness icon"></div>
                <h5>Our Herbal Range</h5>
            </div>
            <h2>Explore our Ayurvedic <br />Herbal Product Categories</h2>
        </div>
        <div class="herbal-trust-strip" role="list">
            <div class="herbal-trust-strip__item" role="listitem">
                <div class="herbal-trust-strip__icon herbal-trust-strip__icon--natural" aria-hidden="true">
                    <span class="herbal-trust-strip__icon-small">100%</span>
                    <span class="herbal-trust-strip__icon-leaf"><i class="fas fa-leaf"></i></span>
                    <span class="herbal-trust-strip__icon-small">Natural</span>
                </div>
                <h3 class="herbal-trust-strip__title">100% NATURAL PRODUCT</h3>
                <span class="herbal-trust-strip__rule" aria-hidden="true"></span>
                <p class="herbal-trust-strip__desc">Pure nature, no chemicals.</p>
            </div>
            <div class="herbal-trust-strip__item" role="listitem">
                <motion class="herbal-trust-strip__icon herbal-trust-strip__icon--vegan" aria-hidden="true">
                    <span class="herbal-trust-strip__vegan-leaves"><i class="fas fa-leaf"></i><i class="fas fa-leaf"></i></span>
                    <span class="herbal-trust-strip__vegan-label">VEGAN</span>
                </div>
                <h3 class="herbal-trust-strip__title">Vegan Product</h3>
                <span class="herbal-trust-strip__rule" aria-hidden="true"></span>
                <p class="herbal-trust-strip__desc">100% vegan – no animal ingredients.</p>
            </div>
            <div class="herbal-trust-strip__item" role="listitem">
                <div class="herbal-trust-strip__icon" aria-hidden="true"><i class="fas fa-mortar-pestle"></i></div>
                <h3 class="herbal-trust-strip__title">Herbal Product</h3>
                <span class="herbal-trust-strip__rule" aria-hidden="true"></span>
                <p class="herbal-trust-strip__desc">Pure herbal formula. No side effects.</p>
            </div>
            <div class="herbal-trust-strip__item" role="listitem">
                <div class="herbal-trust-strip__icon" aria-hidden="true"><i class="fas fa-certificate"></i></div>
                <h3 class="herbal-trust-strip__title">GMP Certified</h3>
                <span class="herbal-trust-strip__rule" aria-hidden="true"></span>
                <p class="herbal-trust-strip__desc">Manufactured in GMP-certified facility.</p>
            </div>
        </div>
        <p class="herbal-trust-strip__cta-wrap centred">
            <a href="products.html" class="theme-btn-three"><span>View all products</span></a>
        </p>
    </motion>
</section>
<!-- our-category-section end -->`;

const aboutPremium = `<!-- about-section -->
<section class="about-section about-sanadana-premium pt_90 pb_120" aria-labelledby="about-sanadana-heading">
    <div class="about-sanadana-premium__split">
        <div class="about-sanadana-premium__media">
            <picture>
                <source srcset="assets/images/about-sanadana-visual.png" type="image/png">
                <img class="about-sanadana-premium__media-img" src="assets/images/new/img (1).webp" alt="Sanadana Ayurvedic product with fresh herbs" width="1920" height="1080" loading="lazy" decoding="async">
            </picture>
            <div class="about-sanadana-premium__media-edge" aria-hidden="true"></div>
        </div>
        <div class="about-sanadana-premium__content">
            <div class="about-sanadana-premium__wash" aria-hidden="true"></div>
            <div class="auto-container about-sanadana-premium__container">
                <div class="about-sanadana-premium__main">
                    <div class="about-sanadana-premium__rating" role="group" aria-label="Customer rating">
                        <strong>A+ rating</strong><span>Average 5.00</span>
                        <div class="about-sanadana-premium__stars" aria-hidden="true">
                            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                        </div>
                    </div>
                    <p class="about-sanadana-premium__kicker">
                        <img src="assets/images/svg-logo-1.png" width="28" height="28" alt="" role="presentation"> About Sanadana
                    </p>
                    <h2 id="about-sanadana-heading">Reviving the Science of Ayurveda for Modern Wellness</h2>
                    <p class="about-sanadana-premium__lead">Sanadana Herbals is a Kerala-based Ayurvedic and herbal wellness brand focused on safe, effective solutions—from herbal cough care to Ayurvedic support for piles—using time-tested formulations crafted in GMP-certified facilities.</p>
                    <ul class="about-sanadana-premium__benefits">
                        <li><span class="about-sanadana-premium__benefit-icon" aria-hidden="true"><i class="fas fa-book-medical"></i></span><div><h3>Authentic Ayurvedic science</h3><p>Formulations guided by classical principles, adapted for modern digestive, respiratory, and circulatory care.</p></div></li>
                        <li><span class="about-sanadana-premium__benefit-icon" aria-hidden="true"><i class="fas fa-mortar-pestle"></i></span><div><h3>Natural &amp; herbal ingredients</h3><p>Plant-based ingredients and holistic support without relying on harsh chemicals.</p></div></li>
                        <li><span class="about-sanadana-premium__benefit-icon" aria-hidden="true"><i class="fas fa-certificate"></i></span><motion><h3>GMP-certified manufacturing</h3><p>Documented quality checks and clean manufacturing so every bottle meets the same standard.</p></div></li>
                    </ul>
                    <div class="about-sanadana-premium__foot"><a href="about.html" class="about-sanadana-premium__story">Read our full story</a></div>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- about-section end -->`;

const solutions = `<!-- our herbal-solutions-section -->
<section class="portfolio-section pt_120 pb_120">
    <div class="outer-container">
        <div class="sec-title centred mb_45">
            <div class="sub-title">
                <div class="icon-box"><img src="assets/images/svg-logo-1.png" style="width: 2rem;" alt="Ayurvedic solutions icon"></div>
                <h5>Our Solutions</h5>
            </div>
            <h2>Natural Healing Through <br />Ayurvedic &amp; Herbal Remedies</h2>
        </div>
        <div class="our-solutions-panel">
            <div class="filters centred mb_50">
                <ul class="filter-tabs filter-btns our-solutions-filters clearfix">
                    <li class="active filter" data-role="button" data-filter=".all" data-slide="0">All</li>
                    <li class="filter" data-role="button" data-filter=".wellness_products" data-slide="2">Wellness Products</li>
                    <li class="filter" data-role="button" data-filter=".herbal_supplements" data-slide="4">Herbal Supplements</li>
                    <li class="filter" data-role="button" data-filter=".immunity_care" data-slide="3">Immunity Care</li>
                    <li class="filter" data-role="button" data-filter=".respiratory_care" data-slide="1">Respiratory Care</li>
                    <li class="filter" data-role="button" data-filter=".digestive_care" data-slide="0">Digestive Care</li>
                </ul>
            </div>
            <div class="our-solutions-carousel-wrap">
                <div class="our-solutions-carousel owl-carousel owl-theme dots-style-one">
${slides}
                </div>
            </div>
        </div>
        <div class="more-btn centred pt_20">
            <a href="products.html" class="theme-btn-two"><span>View all products</span></a>
        </div>
    </div>
</section>
<!-- our herbal-solutions-section end -->`;

const testimonial = fs
  .readFileSync("scripts/recovery/line404-new.html", "utf8")
  .replace(/<\/?motion\b[^>]*>/g, (m) => (m.startsWith("</") ? "</div>" : "<div"));

const blogInsights = `<!-- news-section -->
<section class="news-section blog-insights-premium pb_120" aria-labelledby="blog-insights-heading">
    <div class="blog-insights-premium__bg" aria-hidden="true"></motion>
    <div class="auto-container">
        <header class="blog-insights-premium__header centred">
            <p class="blog-insights-premium__kicker">
                <img src="assets/images/svg-logo-1.png" width="28" height="28" alt="" role="presentation">
                Ayurveda &amp; Wellness
            </p>
            <p class="blog-insights-premium__tagline">Expert insights on herbal medicine &amp; natural healing</p>
            <h2 id="blog-insights-heading">Ayurvedic Knowledge That Supports Real Wellness</h2>
            <p class="blog-insights-premium__intro">Practical guidance on piles care, immunity, digestion, and everyday herbal wellness.</p>
        </header>
        <div class="blog-insights-premium__grid">
            <article class="blog-insight-card">
                <a class="blog-insight-card__link" href="arshopile-blog.html">
                    <figure class="blog-insight-card__media">
                        <img src="https://shop.sanadanaherbals.com/cdn/shop/files/3_31f7d683-5fbe-4ea3-92fe-da1596a81166.jpg?v=1764832331" alt="Ayurvedic approach to managing piles naturally" loading="lazy" decoding="async">
                    </figure>
                    <div class="blog-insight-card__body">
                        <p class="blog-insight-card__meta"><i class="far fa-calendar-alt" aria-hidden="true"></i> 05 Feb</p>
                        <h3>Ayurvedic Approach to Managing Piles Naturally</h3>
                        <p class="blog-insight-card__excerpt">How classical Ayurveda supports digestive balance and comfort.</p>
                        <span class="blog-insight-card__read">Read article <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                    </div>
                </a>
            </article>
            <article class="blog-insight-card">
                <a class="blog-insight-card__link" href="sd-himo-plus-blog.html">
                    <figure class="blog-insight-card__media">
                        <img src="https://shop.sanadanaherbals.com/cdn/shop/files/SDHIMOPLUS_2_595af0d2-0ea2-4f42-8e19-cf8b87a6a053.jpg?v=1755514247" alt="Ayurvedic iron tonics for blood health" loading="lazy" decoding="async">
                    </figure>
                    <div class="blog-insight-card__body">
                        <p class="blog-insight-card__meta"><i class="far fa-calendar-alt" aria-hidden="true"></i> 07 Feb</p>
                        <h3>How Ayurvedic Iron Tonics Support Blood Health</h3>
                        <p class="blog-insight-card__excerpt">Herbal iron replenishment for energy, vitality, and daily wellness.</p>
                        <span class="blog-insight-card__read">Read article <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                    </div>
                </a>
            </article>
            <article class="blog-insight-card">
                <a class="blog-insight-card__link" href="aminohit-blog.html">
                    <figure class="blog-insight-card__media">
                        <img src="https://shop.sanadanaherbals.com/cdn/shop/files/5_5870fa25-e0a9-4e9d-ad5e-f99aa9692d30.jpg?v=1755514308" alt="Digestive wellness with Ayurvedic tonics" loading="lazy" decoding="async">
                    </figure>
                    <div class="blog-insight-card__body">
                        <p class="blog-insight-card__meta"><i class="far fa-calendar-alt" aria-hidden="true"></i> 12 Feb</p>
                        <h3>Digestive Wellness With Ayurvedic Herbal Tonics</h3>
                        <p class="blog-insight-card__excerpt">Support digestion and internal balance with plant-based care.</p>
                        <span class="blog-insight-card__read">Read article <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                    </div>
                </a>
            </article>
        </div>
        <div class="blog-insights-premium__footer centred">
            <a href="blog.html" class="theme-btn-two"><span>View all articles</span></a>
        </div>
    </div>
</section>
<!-- news-section end -->`;

const instagramPremium = sliceBetween(aboutHtml, "<!-- instagram-section -->", "<!-- instagram-section end -->");
const footerPremium = sliceBetween(testimonialHtml, "<!-- main-footer -->", "<!-- main-footer end -->");

let partial = [
  herbalTrust,
  aboutPremium,
  sliceBetween(index, "<!-- why-choose us-section -->", "<!-- why-choose us-section end -->"),
  sliceBetween(index, "<!-- why choose ayurveda-section -->", "<!-- why choose ayurveda-section end -->"),
  solutions,
  sliceBetween(index, "<!-- our commitment-section -->", "<!-- our commitment-section end -->"),
  sliceBetween(index, "<!-- faq-section -->", "<!-- faq-section end -->"),
  testimonial,
  blogInsights,
  sliceBetween(index, "<!-- clients-section -->", "<!-- clients-section end -->"),
  instagramPremium,
  footerPremium,
].join("\n\n");

partial = partial.replace(/<\/?motion\b[^>]*>/g, (m) => {
  if (m.startsWith("</")) return "</div>";
  return "<motion".replace("motion", "motion") === "<motion" ? "<div" : m.replace("<motion", "<motion");
});
partial = partial.replace(/<motion\b/g, "<div").replace(/<\/motion>/g, "</div>");

fs.mkdirSync("assets/partials", { recursive: true });
fs.writeFileSync("assets/partials/home-post-hero.html", partial);
console.log("Wrote partial", partial.length, "chars");
