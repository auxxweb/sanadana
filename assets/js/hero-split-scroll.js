(function () {
  "use strict";

  /** Pin scroll distance per product transition (% of viewport, not ×100) */
  var SCROLL_PERCENT_PER_STEP = 78;
  /** Scroll past pin end to enter the next section (px) */
  var HERO_EXIT_SCROLL_PX = 12;
  /** Wheel / touch: one gesture → one product (ms between steps) */
  var STEP_INPUT_COOLDOWN_MS = 420;
  /** Animated transition between products */
  var STEP_ANIM_DURATION = 0.52;
  /** Manual scroll: display follows target quickly */
  var HERO_DISPLAY_LERP = 0.16;
  var HERO_DISPLAY_MAX_DELTA = 0.028;
  var HOLD_WEIGHT = 5;
  var TRANS_WEIGHT = 6;
  var BENEFITS_EXPAND_END = 0;
  var LEAF_TRAVEL_SPAN = 0.78;

  /** Stagger benefit labels after product + leaves (0–1 within each step) */
  var TEXT_ENTER_START = 0.32;
  var TEXT_ENTER_END = 0.95;
  var TEXT_EXIT_END = 0.4;

  /** Dead zone between benefit sets during product change (0–1 trans rawT) */
  var TRANS_BENEFIT_OUT_END = 0.38;
  var TRANS_BENEFIT_IN_START = 0.56;
  var TRANS_PRODUCT_IN_START = 0.3;
  var TRANS_PRODUCT_IN_END = 0.62;
  var TRANS_LEAF_START = 0.34;
  var TRANS_LEAF_END = 0.92;

  function clamp01(t) {
    return Math.min(1, Math.max(0, t));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - clamp01(t), 3);
  }

  function easeInOutCubic(t) {
    t = clamp01(t);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /** Apple-like smooth deceleration */
  function easeAppleOut(t) {
    t = clamp01(t);
    return 1 - Math.pow(1 - t, 4.2);
  }

  function easeAppleInOut(t) {
    t = clamp01(t);
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  function smoothReveal(t) {
    return easeAppleOut(t);
  }

  /** Elastic overshoot — text “explodes” from small to final size */
  function easeOutBack(t) {
    t = clamp01(t);
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function benefitBlurPx(st) {
    st = clamp01(st);
    return 13 * (1 - st) * (1 - st);
  }

  function phaseRange(amount, start, end) {
    if (amount <= start) return 0;
    if (amount >= end) return 1;
    return (amount - start) / (end - start);
  }

  /** Slower benefit reveal on product change — decoupled from fast scroll */
  function benefitEnterAmount(stepAmount) {
    return smoothReveal(phaseRange(clamp01(stepAmount), TEXT_ENTER_START, TEXT_ENTER_END));
  }

  function benefitExitAmount(stepAmount) {
    var t = clamp01(stepAmount);
    return smoothReveal(phaseRange(1 - t, 0, TEXT_EXIT_END));
  }

  function buildSegments(n, holdWeight, transWeight) {
    var segments = [];
    var totalUnits = n * holdWeight + (n - 1) * transWeight;
    var pos = 0;

    for (var i = 0; i < n; i++) {
      var holdLen = holdWeight / totalUnits;
      segments.push({ type: "hold", idx: i, start: pos, end: pos + holdLen });
      pos += holdLen;

      if (i < n - 1) {
        var transLen = transWeight / totalUnits;
        segments.push({
          type: "trans",
          from: i,
          to: i + 1,
          start: pos,
          end: pos + transLen,
        });
        pos += transLen;
      }
    }

    return segments;
  }

  function getHoldSnapPoints(segments) {
    var points = [];
    for (var i = 0; i < segments.length; i++) {
      if (segments[i].type === "hold") {
        points.push((segments[i].start + segments[i].end) / 2);
      }
    }
    return points;
  }

  function getStepState(progress, n, segments) {
    if (n <= 1) {
      return { mode: "hold", idx: 0 };
    }

    progress = Math.min(1, Math.max(0, progress));

    if (progress >= 1 - 1e-9) {
      return { mode: "hold", idx: n - 1 };
    }

    for (var s = 0; s < segments.length; s++) {
      var seg = segments[s];
      if (progress <= seg.end || s === segments.length - 1) {
        if (seg.type === "hold") {
          return { mode: "hold", idx: seg.idx };
        }

        var rawT = Math.min(1, Math.max(0, (progress - seg.start) / (seg.end - seg.start)));
        return {
          mode: "trans",
          from: seg.from,
          to: seg.to,
          t: easeInOutCubic(rawT),
          rawT: rawT,
          revealT: smoothReveal(rawT),
        };
      }
    }

    return { mode: "hold", idx: n - 1 };
  }

  function progressForStep(stepIndex, n, segments) {
    if (n <= 1) return 0;
    for (var i = 0; i < segments.length; i++) {
      if (segments[i].type === "hold" && segments[i].idx === stepIndex) {
        return (segments[i].start + segments[i].end) / 2;
      }
    }
    return stepIndex / (n - 1);
  }

  function stepIndexFromProgress(progress, n, segments) {
    if (n <= 1) return 0;
    var best = 0;
    var minDist = Infinity;
    for (var i = 0; i < n; i++) {
      var sp = progressForStep(i, n, segments);
      var dist = Math.abs(progress - sp);
      if (dist < minDist) {
        minDist = dist;
        best = i;
      }
    }
    return best;
  }

  function readLeafVar(el, name, fallback) {
    var raw = el.style.getPropertyValue(name) || getComputedStyle(el).getPropertyValue(name);
    if (!raw) return fallback;
    raw = String(raw).trim();
    if (name === "--rot") return raw;
    var num = parseFloat(raw);
    return isNaN(num) ? fallback : num;
  }

  function init() {
    if (typeof gsap === "undefined") {
      window.addEventListener("load", init, { once: true });
      return;
    }

    var ScrollTrigger = window.ScrollTrigger;
    if (!ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    var section = document.getElementById("hero-product-scroll");
    if (!section) return;

    var panels = gsap.utils.toArray(".hero-split__panel");
    var visuals = gsap.utils.toArray(".hero-split__viz-panel");
    var stepBtns = gsap.utils.toArray(".hero-split__step");
    var n = panels.length;
    if (!n || visuals.length !== n) return;

    var segments = buildSegments(n, HOLD_WEIGHT, TRANS_WEIGHT);
    var snapPoints = getHoldSnapPoints(segments);

    var progressRoot = document.getElementById("heroSplitProgress");
    var progressCurrentEl = document.getElementById("heroSplitProgressCurrent");
    var progressStops = progressRoot
      ? gsap.utils.toArray(progressRoot.querySelectorAll(".hero-split__progress-stop"))
      : [];

    function holdEndForStep(idx) {
      for (var hi = 0; hi < segments.length; hi++) {
        if (segments[hi].type === "hold" && segments[hi].idx === idx) {
          return segments[hi].end;
        }
      }
      return 1;
    }

    function activeStepForBar(p) {
      var st = getStepState(p, n, segments);
      if (st.mode === "hold") return st.idx;
      return st.rawT >= 0.48 ? st.to : st.from;
    }

    function layoutHeroProgressStops() {
      for (var si = 0; si < progressStops.length; si++) {
        var pos = progressForStep(si, n, segments) * 100;
        progressStops[si].parentElement.style.left = pos + "%";
      }
    }

    function applyHeroProgressUI(p) {
      if (!progressRoot) return;
      p = clamp01(p);
      progressRoot.style.setProperty("--hero-progress", String(p));
      var pct = Math.round(p * 100);
      progressRoot.setAttribute("aria-valuenow", String(pct));

      var cur = activeStepForBar(p);
      if (progressCurrentEl) {
        progressCurrentEl.textContent = String(cur + 1);
      }

      for (var pi = 0; pi < progressStops.length; pi++) {
        var btn = progressStops[pi];
        var isActive = pi === cur;
        var isPast = pi < cur;
        btn.classList.toggle("is-active", isActive);
        btn.classList.toggle("is-past", isPast);
        btn.setAttribute("aria-current", isActive ? "true" : "false");
      }
    }

    layoutHeroProgressStops();
    applyHeroProgressUI(0);

    var prefersReduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var benefitsScene = document.getElementById("heroBenefitsScene");
    var benefitsBg = document.getElementById("heroBenefitsBg");
    var benefitSets = gsap.utils.toArray(".hero-benefits__set");
    var leafBurstCache = new WeakMap();

    function cacheLeafBurst(vizPanel) {
      if (!vizPanel || leafBurstCache.has(vizPanel)) return leafBurstCache.get(vizPanel);
      var burst = vizPanel.querySelector(".hero-leaf-burst");
      if (!burst) return null;
      var data = gsap.utils.toArray(".hero-leaf", burst).map(function (leaf) {
        return {
          el: leaf,
          tx: readLeafVar(leaf, "--tx", 0),
          ty: readLeafVar(leaf, "--ty", 0),
          rotDeg: parseFloat(String(readLeafVar(leaf, "--rot", "0deg"))) || 0,
          sz: readLeafVar(leaf, "--sz", 1),
          delay: readLeafVar(leaf, "--delay", 0),
        };
      });
      leafBurstCache.set(vizPanel, { burst: burst, leaves: data });
      return leafBurstCache.get(vizPanel);
    }

    visuals.forEach(function (viz) {
      cacheLeafBurst(viz);
      gsap.set(viz, { force3D: true });
    });

    function setBenefitEl(el, st) {
      st = clamp01(st);
      var blurPx = benefitBlurPx(st);
      var bright = 0.72 + 0.28 * easeAppleOut(st);
      var filterStr = "none";
      if (blurPx > 0.35) {
        filterStr = "blur(" + blurPx + "px) brightness(" + bright + ")";
      } else if (bright < 0.998) {
        filterStr = "brightness(" + bright + ")";
      }

      var scaleRaw = 0.34 + 0.66 * easeOutBack(st);
      var sc = Math.min(scaleRaw, 1.055);
      var opacity = st < 0.04 ? 0 : Math.min(1, (st - 0.04) / 0.32);
      if (st >= 0.98) opacity = 1;

      var burst = 22;
      var pullIn = burst * (1 - easeAppleOut(st));

      if (el.classList.contains("hero-benefit--align-left")) {
        gsap.set(el, {
          opacity: opacity,
          scale: sc,
          x: pullIn,
          y: 0,
          yPercent: -50,
          transformOrigin: "0% 50%",
          filter: filterStr,
        });
      } else if (el.classList.contains("hero-benefit--align-right")) {
        gsap.set(el, {
          opacity: opacity,
          scale: sc,
          x: -pullIn,
          y: 0,
          yPercent: -50,
          xPercent: -100,
          transformOrigin: "100% 50%",
          filter: filterStr,
        });
      } else {
        gsap.set(el, {
          opacity: opacity,
          scale: sc,
          y: pullIn * 0.4,
          xPercent: -50,
          yPercent: -50,
          transformOrigin: "50% 50%",
          filter: filterStr,
        });
      }
    }

  /**
   * @param {HTMLElement} setEl
   * @param {number} stepAmount — overall step progress 0–1
   * @param {"enter"|"exit"|"hold"} mode
   */
    function animateBenefitSet(setEl, stepAmount, mode) {
      if (!setEl) return;
      stepAmount = clamp01(stepAmount);
      mode = mode || "enter";

      var benefitEls = gsap.utils.toArray(".hero-benefit", setEl);
      var textBase =
        mode === "exit"
          ? benefitExitAmount(stepAmount)
          : mode === "hold"
            ? 1
            : benefitEnterAmount(stepAmount);

      for (var b = 0; b < benefitEls.length; b++) {
        var textStagger = b * 0.1;
        var bt = clamp01((textBase - textStagger) / (1 - textStagger * 0.75));
        setBenefitEl(benefitEls[b], easeAppleOut(bt));
      }
    }

    function clearBenefitSet(setEl) {
      if (!setEl) return;
      var benefitEls = gsap.utils.toArray(".hero-benefit", setEl);
      benefitEls.forEach(function (el) {
        setBenefitEl(el, 0);
      });
      gsap.set(setEl, { autoAlpha: 0, visibility: "hidden", pointerEvents: "none" });
      setEl.setAttribute("aria-hidden", "true");
    }

    function showBenefitSet(setEl) {
      if (!setEl) return;
      gsap.set(setEl, { autoAlpha: 1, visibility: "visible", pointerEvents: "none" });
      setEl.setAttribute("aria-hidden", "false");
    }

    function setBenefitSetVisibility(setEl, visible) {
      if (!setEl) return;
      if (visible) {
        showBenefitSet(setEl);
      } else {
        clearBenefitSet(setEl);
      }
    }

    function applyProductReveal(vizEl, amount) {
      if (!vizEl) return;
      amount = Math.min(1, Math.max(0, amount));
      if (amount <= 0) {
        gsap.set(vizEl, {
          autoAlpha: 0,
          scale: 0.82,
          y: 26,
          filter: "blur(16px)",
          transformOrigin: "50% 88%",
        });
        return;
      }
      var e = smoothReveal(amount);
      var blurPx = 18 * (1 - e);
      gsap.set(vizEl, {
        autoAlpha: 0.06 + 0.94 * e,
        scale: 0.84 + 0.16 * e,
        y: 22 * (1 - e),
        filter: blurPx > 0.35 ? "blur(" + blurPx + "px)" : "none",
        transformOrigin: "50% 88%",
        force3D: true,
      });
    }

    function leafBurstOpacity(amount) {
      if (amount <= 0.14) return easeAppleOut(amount / 0.14) * 0.94;
      if (amount <= 0.62) return 0.94;
      return 0.94 * (1 - easeAppleOut((amount - 0.62) / 0.38));
    }

    function leafTravelProgress(amount, delay) {
      return clamp01((amount - delay) / LEAF_TRAVEL_SPAN);
    }

    function animateLeafBurst(vizPanel, amount) {
      if (!vizPanel) return;
      var cached = cacheLeafBurst(vizPanel);
      if (!cached || !cached.leaves.length) return;

      amount = clamp01(amount);
      var burst = cached.burst;
      var baseOpacity = leafBurstOpacity(amount);
      var travelE = easeAppleOut(Math.min(1, amount / 0.55));
      var outMult = 1.58;
      var fade = 1 - amount * 0.12;

      gsap.set(burst, { autoAlpha: baseOpacity > 0.02 ? 1 : 0, force3D: true });

      for (var i = 0; i < cached.leaves.length; i++) {
        var leaf = cached.leaves[i];
        var lp = leafTravelProgress(amount, leaf.delay);
        var se = easeAppleOut(lp);
        var dist = travelE * se;

        gsap.set(leaf.el, {
          x: leaf.tx * outMult * dist,
          y: leaf.ty * outMult * dist,
          rotation: leaf.rotDeg * dist,
          scale: (0.22 + 0.78 * dist) * leaf.sz * fade,
          opacity: baseOpacity * se,
          transformOrigin: "50% 50%",
          force3D: true,
        });
      }
    }

    function resetLeafBurst(vizPanel) {
      animateLeafBurst(vizPanel, 0);
    }

    function applyBenefitsExpand(progress) {
      if (!benefitsScene) return;

      /* No intro “expand” band at scroll 0 — keeps first product + labels visible on first paint */
      var inExpand = progress > 0 && progress < BENEFITS_EXPAND_END;
      var t = inExpand ? progress / BENEFITS_EXPAND_END : 1;
      var e = easeAppleInOut(t);

      gsap.set(benefitsScene, {
        scale: 0.92 + 0.08 * e,
        transformOrigin: "50% 48%",
        force3D: true,
      });

      if (benefitsBg) {
        gsap.set(benefitsBg, {
          scale: 0.38 + 0.62 * easeAppleOut(t),
          opacity: easeAppleOut(t),
        });
      }

      if (inExpand) {
        applyProductReveal(visuals[0], smoothReveal(t));
        animateLeafBurst(visuals[0], smoothReveal(t));
        for (var s = 0; s < benefitSets.length; s++) {
          if (s === 0) {
            showBenefitSet(benefitSets[s]);
            animateBenefitSet(benefitSets[s], smoothReveal(t), "enter");
          } else {
            clearBenefitSet(benefitSets[s]);
          }
        }
        for (var v = 1; v < visuals.length; v++) {
          applyProductReveal(visuals[v], 0);
          resetLeafBurst(visuals[v]);
        }
        return;
      }

      applyBenefitSetsForStep(progress);
    }

    function applyBenefitSetsForStep(progress) {
      if (!benefitSets.length) return;
      var st = getStepState(progress, n, segments);

      if (st.mode === "hold") {
        for (var i = 0; i < benefitSets.length; i++) {
          var on = i === st.idx;
          setBenefitSetVisibility(benefitSets[i], on);
          animateBenefitSet(benefitSets[i], on ? 1 : 0, on ? "hold" : "exit");
        }
        return;
      }

      var transRaw = st.rawT != null ? st.rawT : st.t;

      for (var j = 0; j < benefitSets.length; j++) {
        if (j === st.from) {
          setBenefitSetVisibility(benefitSets[j], true);
          animateBenefitSet(benefitSets[j], 1 - transRaw, "exit");
        } else if (j === st.to) {
          setBenefitSetVisibility(benefitSets[j], true);
          animateBenefitSet(benefitSets[j], transRaw, "enter");
        } else {
          setBenefitSetVisibility(benefitSets[j], false);
          animateBenefitSet(benefitSets[j], 0, "exit");
        }
      }
    }

    function setHoldVisible(targets) {
      gsap.set(targets, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        filter: "none",
        transformOrigin: "50% 50%",
      });
    }

    function setPastHidden(targets) {
      gsap.set(targets, {
        autoAlpha: 0,
        scale: 0.92,
        y: -28,
        filter: "blur(6px)",
        transformOrigin: "50% 50%",
      });
    }

    function setFutureHidden(targets) {
      gsap.set(targets, {
        autoAlpha: 0,
        scale: 0.88,
        y: 36,
        filter: "blur(10px)",
        transformOrigin: "50% 50%",
      });
    }

    function applyState(progress) {
      var st = getStepState(progress, n, segments);
      var activeIdx = st.mode === "hold" ? st.idx : st.to;
      var inExpand = progress > 0 && progress < BENEFITS_EXPAND_END;

      for (var i = 0; i < n; i++) {
        if (inExpand) {
          if (i === 0) {
            setHoldVisible([panels[0]]);
          } else {
            setFutureHidden([panels[i]]);
            applyProductReveal(visuals[i], 0);
            resetLeafBurst(visuals[i]);
          }
          continue;
        }

        if (st.mode === "hold") {
          if (i < st.idx) {
            setPastHidden([panels[i]]);
            applyProductReveal(visuals[i], 0);
            resetLeafBurst(visuals[i]);
          } else if (i > st.idx) {
            setFutureHidden([panels[i]]);
            applyProductReveal(visuals[i], 0);
            resetLeafBurst(visuals[i]);
          } else {
            setHoldVisible([panels[i]]);
            applyProductReveal(visuals[i], 1);
            resetLeafBurst(visuals[i]);
          }
        } else if (i === st.from) {
          var outRaw = st.rawT != null ? st.rawT : st.t;
          setPastHidden([panels[i]]);
          applyProductReveal(
            visuals[i],
            Math.max(0, 1 - smoothReveal(phaseRange(outRaw, 0, 0.48)))
          );
          resetLeafBurst(visuals[i]);
        } else if (i === st.to) {
          var inRaw = st.rawT != null ? st.rawT : st.t;
          setHoldVisible([panels[i]]);
          applyProductReveal(
            visuals[i],
            smoothReveal(
              phaseRange(inRaw, TRANS_PRODUCT_IN_START, TRANS_PRODUCT_IN_END)
            )
          );
          if (inRaw >= TRANS_LEAF_START) {
            animateLeafBurst(
              visuals[i],
              smoothReveal(
                phaseRange(inRaw, TRANS_LEAF_START, TRANS_LEAF_END)
              )
            );
          } else {
            resetLeafBurst(visuals[i]);
          }
        } else if (i < st.from) {
          setPastHidden([panels[i]]);
          applyProductReveal(visuals[i], 0);
          resetLeafBurst(visuals[i]);
        } else {
          setFutureHidden([panels[i]]);
          applyProductReveal(visuals[i], 0);
          resetLeafBurst(visuals[i]);
        }
      }

      for (var s = 0; s < stepBtns.length; s++) {
        stepBtns[s].setAttribute("aria-current", s === activeIdx ? "true" : "false");
      }
    }

    if (prefersReduced) {
      for (var j = 0; j < n; j++) {
        if (j === 0) {
          setHoldVisible([panels[j], visuals[j]]);
          resetLeafBurst(visuals[j]);
        } else {
          setFutureHidden([panels[j]]);
          applyProductReveal(visuals[j], 0);
        }
      }
      for (var t = 0; t < stepBtns.length; t++) {
        stepBtns[t].setAttribute("aria-current", t === 0 ? "true" : "false");
      }
      applyBenefitsExpand(1);
      applyHeroProgressUI(0);
      return;
    }

    for (var k = 0; k < n; k++) {
      if (k === 0) {
        setHoldVisible([panels[k]]);
        applyProductReveal(visuals[k], 0);
        resetLeafBurst(visuals[k]);
      } else {
        setFutureHidden([panels[k]]);
        applyProductReveal(visuals[k], 0);
        resetLeafBurst(visuals[k]);
      }
    }

    var scrollEnd =
      "+=" + Math.round(Math.max(n - 1, 1) * SCROLL_PERCENT_PER_STEP) + "%";

    function progressForStepNav(stepIndex) {
      if (stepIndex >= n - 1) {
        return holdEndForStep(n - 1);
      }
      return progressForStep(stepIndex, n, segments);
    }

    function isOnLastHeroStep() {
      var st = getStepState(heroDisplayProgress, n, segments);
      return st.mode === "hold" && st.idx === n - 1;
    }

    function exitHeroToNextSection() {
      if (!heroST) return;
      var y = (heroST.end || 0) + HERO_EXIT_SCROLL_PX;
      if (typeof ScrollTrigger.scroll === "function") {
        ScrollTrigger.scroll(y);
      } else {
        window.scrollTo({ top: y, behavior: "auto" });
      }
      setHeroProgressImmediate(holdEndForStep(n - 1));
    }

    var heroDisplayProgress = 0;
    var heroTargetProgress = 0;
    var activeStep = 0;
    var stepAnimBusy = false;
    var stepAnimTween = null;
    var lastStepInputAt = 0;

    function syncHeroUI(p) {
      applyBenefitsExpand(p);
      applyState(p);
      applyHeroProgressUI(p);
    }

    function setHeroProgressImmediate(p) {
      p = clamp01(p);
      heroTargetProgress = p;
      heroDisplayProgress = p;
      activeStep = stepIndexFromProgress(p, n, segments);
      syncHeroUI(p);
    }

    function scrollYForProgress(p) {
      if (!heroST) return 0;
      var start = heroST.start || 0;
      var end = heroST.end || start + 1;
      return start + clamp01(p) * (end - start);
    }

    function scrollToProgress(p, immediate) {
      p = clamp01(p);
      var y = scrollYForProgress(p);
      if (typeof ScrollTrigger.scroll === "function") {
        ScrollTrigger.scroll(y);
      } else if (immediate) {
        window.scrollTo(0, y);
      } else {
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      heroTargetProgress = heroST ? heroST.progress : p;
    }

    function animateHeroToStep(stepIndex) {
      if (!heroST) return;
      stepIndex = Math.max(0, Math.min(n - 1, stepIndex));
      if (stepAnimBusy && stepIndex === activeStep) return;

      var targetP = progressForStepNav(stepIndex);
      if (Math.abs(heroDisplayProgress - targetP) < 0.0004 && stepIndex === activeStep) {
        return;
      }

      if (stepAnimTween) {
        stepAnimTween.kill();
        stepAnimTween = null;
      }

      stepAnimBusy = true;
      activeStep = stepIndex;

      var anim = { p: heroDisplayProgress };
      stepAnimTween = gsap.to(anim, {
        p: targetP,
        duration: STEP_ANIM_DURATION,
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: function () {
          heroDisplayProgress = anim.p;
          heroTargetProgress = anim.p;
          scrollToProgress(anim.p, true);
          syncHeroUI(anim.p);
        },
        onComplete: function () {
          stepAnimBusy = false;
          stepAnimTween = null;
          setHeroProgressImmediate(targetP);
          scrollToProgress(targetP, true);
        },
      });
    }

    function scrollToStep(stepIndex) {
      if (!heroST) {
        setHeroProgressImmediate(progressForStepNav(stepIndex));
        return;
      }
      animateHeroToStep(stepIndex);
    }

    function tryStepByDirection(dir) {
      if (!heroST || !heroST.isActive) return false;
      if (stepAnimBusy) return true;

      var now = Date.now();
      if (now - lastStepInputAt < STEP_INPUT_COOLDOWN_MS) return true;

      if (dir > 0 && isOnLastHeroStep()) {
        lastStepInputAt = now;
        exitHeroToNextSection();
        return true;
      }

      if (dir < 0 && activeStep <= 0) return false;

      lastStepInputAt = now;
      animateHeroToStep(activeStep + dir);
      return true;
    }

    function tickHeroDisplaySmooth() {
      if (stepAnimBusy) return;

      var target = heroTargetProgress;
      var diff = target - heroDisplayProgress;
      var dr =
        typeof gsap.ticker.deltaRatio === "function"
          ? gsap.ticker.deltaRatio()
          : 1;

      if (Math.abs(diff) < 0.00012) {
        if (Math.abs(heroDisplayProgress - target) > 1e-6) {
          heroDisplayProgress = target;
          activeStep = stepIndexFromProgress(target, n, segments);
          syncHeroUI(heroDisplayProgress);
        }
        return;
      }

      var step = diff * HERO_DISPLAY_LERP * dr;
      var maxStep = HERO_DISPLAY_MAX_DELTA * dr;
      if (maxStep > 0 && Math.abs(step) > maxStep) {
        step = (diff > 0 ? 1 : -1) * maxStep;
      }
      heroDisplayProgress += step;
      syncHeroUI(heroDisplayProgress);
    }

    var heroST = null;
    var heroPinMounted = false;

    function mountHeroScrollPin() {
      if (heroPinMounted || prefersReduced) return;
      heroPinMounted = true;

      section.style.paddingBottom = "";

      if (window.scrollY > 0 && window.scrollY < 80) {
        window.scrollTo(0, 0);
      }

      heroST = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: scrollEnd,
        pin: true,
        pinSpacing: true,
        pinType: "fixed",
        scrub: false,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        snap:
          snapPoints.length > 1
            ? {
                snapTo: function (progress) {
                  var nearest = snapPoints[0];
                  var minDist = Math.abs(progress - nearest);
                  for (var p = 1; p < snapPoints.length; p++) {
                    var dist = Math.abs(progress - snapPoints[p]);
                    if (dist < minDist) {
                      minDist = dist;
                      nearest = snapPoints[p];
                    }
                  }
                  return nearest;
                },
                duration: { min: 0.32, max: 0.55 },
                delay: 0.06,
                ease: "power2.inOut",
              }
            : false,
        onUpdate: function (self) {
          if (stepAnimBusy) return;
          heroTargetProgress = self.progress;
          activeStep = stepIndexFromProgress(heroTargetProgress, n, segments);
        },
      });

      setHeroProgressImmediate(heroST.progress || 0);
      refreshHeroScrollTrigger();
    }

    function scheduleHeroScrollPin() {
      requestAnimationFrame(function () {
        requestAnimationFrame(mountHeroScrollPin);
      });
    }

    /* Visible hero on first paint; pin on next frame (no pin-spacer gap) */
    setHeroProgressImmediate(0);
    section.classList.add("hero-split--ready");
    gsap.ticker.add(tickHeroDisplaySmooth);
    scheduleHeroScrollPin();

    function onHeroWheel(e) {
      if (!heroST || !heroST.isActive || prefersReduced) return;
      if (Math.abs(e.deltaY) < 12) return;

      var dir = e.deltaY > 0 ? 1 : -1;
      if (tryStepByDirection(dir)) {
        e.preventDefault();
      }
    }

    section.addEventListener("wheel", onHeroWheel, { passive: false });

    var touchStartY = 0;
    var touchStartAt = 0;
    section.addEventListener(
      "touchstart",
      function (e) {
        if (!e.touches || !e.touches.length) return;
        touchStartY = e.touches[0].clientY;
        touchStartAt = Date.now();
      },
      { passive: true }
    );
    section.addEventListener(
      "touchend",
      function (e) {
        if (!heroST || !heroST.isActive || prefersReduced) return;
        if (!e.changedTouches || !e.changedTouches.length) return;
        if (Date.now() - touchStartAt > 700) return;

        var dy = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(dy) < 42) return;

        var dir = dy > 0 ? 1 : -1;
        if (tryStepByDirection(dir)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    requestAnimationFrame(function () {
      refreshHeroScrollTrigger();
      if (!stepAnimBusy) {
        setHeroProgressImmediate(heroST.progress || 0);
      }
    });
    setTimeout(function () {
      refreshHeroScrollTrigger();
      if (!stepAnimBusy) {
        setHeroProgressImmediate(heroST.progress || 0);
        layoutHeroProgressStops();
      }
    }, 150);

    stepBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var go = parseInt(btn.getAttribute("data-hero-goto"), 10);
        if (!isNaN(go)) scrollToStep(go);
      });
    });

    progressStops.forEach(function (pbtn) {
      pbtn.addEventListener("click", function () {
        var go = parseInt(pbtn.getAttribute("data-hero-goto"), 10);
        if (!isNaN(go)) scrollToStep(go);
      });
    });

    var vizWrap = document.getElementById("heroVizParallax");
    var frameEl = vizWrap ? vizWrap.querySelector(".hero-split__frame") : null;
    var vizEl = vizWrap ? vizWrap.querySelector(".hero-split__viz") : null;
    var tiltEls = [frameEl, vizEl].filter(Boolean);
    if (vizWrap && tiltEls.length) {
      gsap.set(tiltEls, { transformStyle: "preserve-3d" });
      vizWrap.addEventListener("mousemove", function (e) {
        var r = vizWrap.getBoundingClientRect();
        var mx = (e.clientX - r.left) / r.width - 0.5;
        var my = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(tiltEls, {
          rotationY: mx * 7,
          rotationX: -my * 5,
          duration: 0.55,
          ease: "power2.out",
          transformPerspective: 900,
          transformOrigin: "50% 55%",
        });
      });
      vizWrap.addEventListener("mouseleave", function () {
        gsap.to(tiltEls, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.75,
          ease: "power2.out",
        });
      });
    }

    function refreshHeroScrollTrigger() {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh(true);
      }
      if (heroPinMounted && heroST && !stepAnimBusy) {
        setHeroProgressImmediate(heroST.progress || 0);
      }
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        refreshHeroScrollTrigger();
        requestAnimationFrame(refreshHeroScrollTrigger);
      });
    }

    var heroResizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(heroResizeTimer);
      heroResizeTimer = setTimeout(refreshHeroScrollTrigger, 180);
    });

    /* Late pass: images/fonts/sticky header can settle after load — removes pin gap jitter */
    setTimeout(refreshHeroScrollTrigger, 420);

    window.addEventListener(
      "load",
      function () {
        if (!heroPinMounted) {
          scheduleHeroScrollPin();
        }
        layoutHeroProgressStops();
        refreshHeroScrollTrigger();
        requestAnimationFrame(refreshHeroScrollTrigger);
      },
      { once: true }
    );
  }

  init();
})();
