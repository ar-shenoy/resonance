/**
 * Resonance — Core Player
 * Real local audio playback + library management (v0.2)
 */

(() => {
  'use strict';

  const state = {
    library: [],
    queue: [],
    currentIndex: -1,
    playing: false,
    volume: 0.8,
    view: 'now',
  };

  let audio = null;
  let objectUrls = [];

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    btnPlay: $('#btn-play'),
    btnPrev: $('#btn-prev'),
    btnNext: $('#btn-next'),
    progressFill: $('#progress-fill'),
    progressHandle: $('#progress-handle'),
    progressBar: $('#progress-bar'),
    timeCurrent: $('#time-current'),
    timeTotal: $('#time-total'),
    volume: $('#volume'),
    trackTitle: $('#track-title'),
    trackArtist: $('#track-artist'),
    miniTitle: $('#mini-title'),
    miniArtist: $('#mini-artist'),
    tagBpm: $('#tag-bpm'),
    tagKey: $('#tag-key'),
    tagEnergy: $('#tag-energy'),
    artwork: $('#artwork'),
    artworkFrame: document.querySelector('.artwork-frame'),
    libraryList: $('#library-list'),
    libraryEmpty: $('#library-empty'),
    libraryCount: $('#library-count'),
    btnImport: $('#btn-import'),
    fileInput: $('#file-input'),
    stage: document.querySelector('.stage'),
    waveform: $('#waveform'),
    particles: $('#particles'),
  };

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function formatTime(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function cleanTitle(filename) {
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Unknown Track';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function createAudio() {
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    audio = new Audio();
    audio.preload = 'auto';
    audio.volume = state.volume;

    audio.addEventListener('loadedmetadata', () => {
      const track = getCurrentTrack();
      if (track && isFinite(audio.duration)) {
        track.duration = audio.duration;
        updateNowPlayingUI();
        renderLibrary();
      }
      els.timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio || !isFinite(audio.duration)) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      els.progressFill.style.width = `${pct}%`;
      els.progressHandle.style.left = `${pct}%`;
      els.timeCurrent.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      playNext();
    });

    audio.addEventListener('error', () => {
      setPlaying(false);
    });

    audio.addEventListener('play', () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
  }

  function getCurrentTrack() {
    if (state.currentIndex < 0 || state.currentIndex >= state.library.length) return null;
    return state.library[state.currentIndex];
  }

  function loadTrack(index) {
    if (index < 0 || index >= state.library.length) return;
    const track = state.library[index];
    state.currentIndex = index;

    if (!audio) createAudio();
    audio.src = track.url;
    audio.load();

    updateNowPlayingUI();
    renderLibrary();
  }

  function play() {
    if (!audio || state.currentIndex < 0) {
      if (state.library.length > 0) {
        loadTrack(0);
        audio.play().catch(() => {});
      }
      return;
    }
    audio.play().catch(() => {});
  }

  function pause() {
    if (audio) audio.pause();
  }

  function togglePlay() {
    if (state.playing) pause();
    else play();
  }

  function playNext() {
    if (state.library.length === 0) return;
    const next = (state.currentIndex + 1) % state.library.length;
    loadTrack(next);
    play();
  }

  function playPrev() {
    if (state.library.length === 0) return;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prev = (state.currentIndex - 1 + state.library.length) % state.library.length;
    loadTrack(prev);
    play();
  }

  function seek(pct) {
    if (!audio || !isFinite(audio.duration)) return;
    audio.currentTime = pct * audio.duration;
  }

  function setVolume(v) {
    state.volume = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = state.volume;
  }

  function setPlaying(isPlaying) {
    state.playing = isPlaying;
    const playIcon = els.btnPlay.querySelector('.icon-play');
    const pauseIcon = els.btnPlay.querySelector('.icon-pause');
    if (playIcon && pauseIcon) {
      playIcon.classList.toggle('hidden', isPlaying);
      pauseIcon.classList.toggle('hidden', !isPlaying);
    }
    if (els.artworkFrame) {
      els.artworkFrame.classList.toggle('playing', isPlaying);
    }
  }

  function addFiles(fileList) {
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith('audio/') || /\.(mp3|flac|wav|aac|ogg|m4a|opus)$/i.test(f.name)
    );
    if (files.length === 0) return;

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.push(url);

      const track = {
        id: uid(),
        file,
        url,
        title: cleanTitle(file.name),
        artist: 'Local File',
        duration: 0,
        coverUrl: null,
      };

      state.library.push(track);

      const temp = new Audio();
      temp.src = url;
      temp.addEventListener('loadedmetadata', () => {
        track.duration = temp.duration;
        renderLibrary();
        if (getCurrentTrack()?.id === track.id) updateNowPlayingUI();
      });
    });

    renderLibrary();

    if (state.currentIndex < 0 && state.library.length > 0) {
      loadTrack(0);
    }
  }

  function renderLibrary() {
    const list = els.libraryList;
    const empty = els.libraryEmpty;

    if (!list) return;

    if (state.library.length === 0) {
      if (empty) empty.style.display = 'block';
      list.querySelectorAll('.track-row').forEach((r) => r.remove());
      if (els.libraryCount) els.libraryCount.textContent = '0 tracks';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (els.libraryCount) {
      els.libraryCount.textContent = `${state.library.length} track${state.library.length === 1 ? '' : 's'}`;
    }

    list.querySelectorAll('.track-row').forEach((r) => r.remove());

    state.library.forEach((track, index) => {
      const row = document.createElement('div');
      row.className = 'track-row' + (index === state.currentIndex ? ' active' : '');
      row.dataset.index = index;

      row.innerHTML = `
        <div class="track-row-art">♪</div>
        <div class="track-row-info">
          <div class="track-row-title">${escapeHtml(track.title)}</div>
          <div class="track-row-meta">${escapeHtml(track.artist)} · ${formatTime(track.duration)}</div>
        </div>
        <div class="track-row-duration">${formatTime(track.duration)}</div>
      `;

      row.addEventListener('click', () => {
        loadTrack(index);
        play();
      });

      list.appendChild(row);
    });
  }

  function updateNowPlayingUI() {
    const track = getCurrentTrack();
    if (!track) {
      els.trackTitle.textContent = 'Select a track';
      els.trackArtist.textContent = 'Your library awaits';
      els.miniTitle.textContent = 'Resonance';
      els.miniArtist.textContent = 'Ready';
      els.timeTotal.textContent = '0:00';
      els.tagBpm.textContent = '— BPM';
      els.tagKey.textContent = '—';
      els.tagEnergy.textContent = 'Energy —';
      return;
    }

    els.trackTitle.textContent = track.title;
    els.trackArtist.textContent = track.artist;
    els.miniTitle.textContent = track.title;
    els.miniArtist.textContent = track.artist;
    els.timeTotal.textContent = formatTime(track.duration || (audio?.duration ?? 0));

    els.tagBpm.textContent = '— BPM';
    els.tagKey.textContent = '—';
    els.tagEnergy.textContent = 'Local';
  }

  function bindEvents() {
    $$('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        $$('.nav-item').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.view').forEach((v) => v.classList.remove('active'));
        $(`#view-${view}`)?.classList.add('active');
        state.view = view;
      });
    });

    els.btnPlay.addEventListener('click', togglePlay);
    els.btnNext.addEventListener('click', playNext);
    els.btnPrev.addEventListener('click', playPrev);

    els.progressBar.addEventListener('click', (e) => {
      const rect = els.progressBar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(pct);
    });

    els.volume.addEventListener('input', (e) => {
      setVolume(Number(e.target.value) / 100);
    });

    if (els.btnImport && els.fileInput) {
      els.btnImport.addEventListener('click', () => els.fileInput.click());
      els.fileInput.addEventListener('change', (e) => {
        if (e.target.files?.length) addFiles(e.target.files);
        e.target.value = '';
      });
    }

    const stage = els.stage;
    if (stage) {
      ['dragenter', 'dragover'].forEach((ev) => {
        stage.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          stage.classList.add('drag-over');
        });
      });
      ['dragleave', 'drop'].forEach((ev) => {
        stage.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          stage.classList.remove('drag-over');
        });
      });
      stage.addEventListener('drop', (e) => {
        const files = e.dataTransfer?.files;
        if (files?.length) addFiles(files);
      });
    }

    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());
  }

  function initWaveform() {
    const canvas = els.waveform;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const bars = 80;
    const data = new Float32Array(bars);
    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      data[i] = 0.22 + 0.3 * Math.sin(t * Math.PI * 3.8) + 0.18 * Math.sin(t * Math.PI * 9) + 0.12 * Math.random();
      data[i] = Math.max(0.06, Math.min(1, data[i]));
    }

    let phase = 0;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const barWidth = (w / bars) * 0.7;
      const gap = (w / bars) * 0.3;
      const centerY = h * 0.5;

      for (let i = 0; i < bars; i++) {
        let amp = data[i];
        if (state.playing) {
          amp *= 0.65 + 0.35 * Math.sin(phase + i * 0.28);
          amp = Math.max(0.06, Math.min(1.1, amp));
        }
        const barH = amp * (h * 0.4);
        const x = i * (barWidth + gap) + gap * 0.5;

        const grad = ctx.createLinearGradient(0, centerY - barH, 0, centerY + barH);
        grad.addColorStop(0, 'rgba(245, 166, 35, 0.9)');
        grad.addColorStop(0.5, 'rgba(255, 140, 66, 0.5)');
        grad.addColorStop(1, 'rgba(245, 166, 35, 0.12)');
        ctx.fillStyle = grad;

        const r = Math.min(2, barWidth / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, centerY - barH);
        ctx.lineTo(x + barWidth - r, centerY - barH);
        ctx.quadraticCurveTo(x + barWidth, centerY - barH, x + barWidth, centerY - barH + r);
        ctx.lineTo(x + barWidth, centerY + barH - r);
        ctx.quadraticCurveTo(x + barWidth, centerY + barH, x + barWidth - r, centerY + barH);
        ctx.lineTo(x + r, centerY + barH);
        ctx.quadraticCurveTo(x, centerY + barH, x, centerY + barH - r);
        ctx.lineTo(x, centerY - barH + r);
        ctx.quadraticCurveTo(x, centerY - barH, x + r, centerY - barH);
        ctx.closePath();
        ctx.fill();
      }

      if (audio && isFinite(audio.duration) && audio.duration > 0) {
        const pct = audio.currentTime / audio.duration;
        const gx = pct * w;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gx, 6);
        ctx.lineTo(gx, h - 6);
        ctx.stroke();
      }

      phase += state.playing ? 0.07 : 0.008;
      requestAnimationFrame(draw);
    }
    draw();
  }

  function initParticles() {
    const canvas = els.particles;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const COUNT = 40;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        a: 0.06 + Math.random() * 0.14,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 166, 35, ${p.a})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function init() {
    createAudio();
    bindEvents();
    initWaveform();
    initParticles();
    updateNowPlayingUI();
    renderLibrary();

    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
      document.body.style.opacity = '1';
    });
  }

  init();
})();
