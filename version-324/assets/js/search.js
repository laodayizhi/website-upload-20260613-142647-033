(function () {
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function movieCard(movie) {
        return [
            '<article class="movie-card" data-movie-card>',
            '<a href="./' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '<figure class="card-poster">',
            '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
            '<figcaption>' + escapeHtml(movie.type) + '</figcaption>',
            '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
            '</figure>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '<h2>' + escapeHtml(movie.title) + '</h2>',
            '<p>' + escapeHtml(movie.one_line) + '</p>',
            '<div class="card-tags"><span>' + escapeHtml(movie.score) + '分</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function setupSearch() {
        var input = document.getElementById('searchInput');
        var typeFilter = document.getElementById('typeFilter');
        var yearFilter = document.getElementById('yearFilter');
        var regionFilter = document.getElementById('regionFilter');
        var reset = document.getElementById('resetSearch');
        var results = document.getElementById('searchResults');
        var count = document.getElementById('searchCount');
        var empty = document.getElementById('searchEmpty');
        var movies = window.SEARCH_MOVIES || [];

        if (!input || !results) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        input.value = params.get('q') || '';

        function matches(movie) {
            var q = normalize(input.value);
            var typeValue = typeFilter ? typeFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var regionValue = regionFilter ? regionFilter.value : '';
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.one_line
            ].join(' '));

            if (q && haystack.indexOf(q) === -1) {
                return false;
            }
            if (typeValue && movie.type !== typeValue) {
                return false;
            }
            if (yearValue && String(movie.year) !== String(yearValue)) {
                return false;
            }
            if (regionValue && movie.region !== regionValue) {
                return false;
            }
            return true;
        }

        function render() {
            var filtered = movies.filter(matches).slice(0, 96);
            results.innerHTML = filtered.map(movieCard).join('');
            count.textContent = '搜索结果：' + filtered.length + ' 部';
            if (empty) {
                empty.hidden = filtered.length !== 0;
            }
            results.querySelectorAll('img').forEach(function (image) {
                image.addEventListener('error', function () {
                    image.classList.add('image-error');
                }, { once: true });
            });
        }

        [input, typeFilter, yearFilter, regionFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                input.value = '';
                if (typeFilter) {
                    typeFilter.value = '';
                }
                if (yearFilter) {
                    yearFilter.value = '';
                }
                if (regionFilter) {
                    regionFilter.value = '';
                }
                render();
            });
        }

        render();
    }

    document.addEventListener('DOMContentLoaded', setupSearch);
})();
