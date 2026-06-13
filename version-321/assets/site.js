(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-slide") || 0);
        show(next);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var input = document.querySelector(".page-search");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-buttons button"));
    if (!input && !buttons.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    var filter = "all";
    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-text") + " " + card.getAttribute("data-title"));
        var type = card.getAttribute("data-type") || "";
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = filter === "all" || type === filter;
        card.style.display = matchesQuery && matchesType ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        filter = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
    apply();
  }

  window.setupPlayer = function (videoId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var hls = null;
    var loaded = false;

    if (!video || !layer || !streamUrl) {
      return;
    }

    function load() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
        });
      }
      video.src = streamUrl;
      return Promise.resolve();
    }

    function play() {
      layer.classList.add("is-hidden");
      load().then(function () {
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            layer.classList.remove("is-hidden");
          });
        }
      });
    }

    layer.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      layer.classList.add("is-hidden");
    });
  };

  ready(function () {
    initNavigation();
    initHeroSlider();
    initFilters();
  });
})();
