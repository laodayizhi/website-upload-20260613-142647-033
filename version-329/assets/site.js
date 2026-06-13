(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupSiteSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./all.html";

        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }

        window.location.href = target;
      });
    });
  }

  function setupCatalogSearch() {
    var input = document.querySelector("[data-catalog-search]");
    var catalog = document.querySelector("[data-catalog]");
    var noResult = document.querySelector("[data-no-result]");

    if (!input || !catalog) {
      return;
    }

    var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (initialQuery) {
      input.value = initialQuery;
    }

    function filter() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;

        card.classList.toggle("is-filtered-out", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (noResult) {
        noResult.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", filter);
    filter();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      var hls = null;
      var started = false;

      if (!video) {
        return;
      }

      function start() {
        var stream = video.getAttribute("data-stream");

        if (!stream) {
          return;
        }

        if (!started) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else {
            video.src = stream;
          }

          started = true;
        }

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSiteSearch();
    setupCatalogSearch();
    setupPlayers();
  });
})();
