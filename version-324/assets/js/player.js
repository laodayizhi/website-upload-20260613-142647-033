document.addEventListener('DOMContentLoaded', function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

    players.forEach(function (player) {
        var video = player.querySelector('.js-video');
        var trigger = player.querySelector('.js-play-trigger');
        var stream = player.getAttribute('data-stream');
        var hlsInstance = null;

        if (!video || !stream) {
            return;
        }

        async function attachStream() {
            if (video.dataset.ready === 'true') {
                return;
            }
            video.dataset.ready = 'true';

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            try {
                var module = await import('./video-vendor.js');
                var Hls = module.H;
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    return;
                }
            } catch (error) {
                video.dataset.hlsError = 'true';
            }

            video.src = stream;
        }

        async function play() {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            await attachStream();
            var started = video.play();
            if (started && typeof started.catch === 'function') {
                started.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (trigger) {
            trigger.addEventListener('click', play);
        }

        video.addEventListener('play', function () {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        });

        video.addEventListener('emptied', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            video.dataset.ready = 'false';
        });
    });
});
