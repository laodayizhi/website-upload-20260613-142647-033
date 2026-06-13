(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs('.js-menu-button');
        var panel = qs('.js-mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            document.body.classList.toggle('is-menu-open');
        });
        qsa('a', panel).forEach(function (link) {
            link.addEventListener('click', function () {
                document.body.classList.remove('is-menu-open');
            });
        });
    }

    function setupSearchForms() {
        qsa('.js-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                    return;
                }
                input.value = input.value.trim();
            });
        });
    }

    function setupHero() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        var prev = qs('.js-hero-prev');
        var next = qs('.js-hero-next');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupImageFallback() {
        qsa('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-error');
            }, { once: true });
        });
    }

    function setupHeaderShadow() {
        var header = qs('.site-header');
        if (!header) {
            return;
        }
        function update() {
            header.classList.toggle('has-shadow', window.scrollY > 8);
        }
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupImageFallback();
        setupHeaderShadow();
    });
})();
