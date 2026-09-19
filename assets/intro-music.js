(() => {
  const audio = document.getElementById('intro-music');
  if (!audio) return;

  const storageKey = 'comocreamos-intro-music';
  let stopped = false;
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch (_) {}

  audio.volume = Number.isFinite(saved?.volume) ? saved.volume : 0.35;
  audio.muted = Boolean(saved?.muted);
  if (Number.isFinite(saved?.time) && saved.time > 0) {
    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = saved.time % (audio.duration || Infinity);
    }, { once: true });
  }

  const save = () => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        time: audio.currentTime,
        volume: audio.volume,
        muted: audio.muted
      }));
    } catch (_) {}
  };
  const play = () => {
    if (!stopped && audio.paused) audio.play().catch(() => {});
  };
  const unlock = () => play();

  document.addEventListener('pointerdown', unlock);
  document.addEventListener('keydown', unlock);
  window.addEventListener('pagehide', save);
  play();

  window.introMusic = {
    setVolume(volume, muted) {
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.muted = muted;
      save();
      play();
    },
    stop() {
      stopped = true;
      audio.pause();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      save();
    }
  };
})();
