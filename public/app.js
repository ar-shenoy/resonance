/**
 * Resonance — Interactive Prototype
 * Local-first music player shell with fluid UI and visualizer.
 */

(() => {
  'use strict';

  // ── State ──────────────────────────────────────────────
  const state = {
    playing: false,
    currentTime: 0,
    duration: 214, // demo length in seconds
    volume: 0.8,
    view: 'now',
  };

  // ── DOM refs ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const btnPlay = $('#btn-play');
  const progressFill = $('#progress-fill');
  const progressHandle = $('#progress-handle');
  const progressBar = $('#progress-bar');
  const timeCurrent = $('#time-current');
  const timeTotal = $('#time-total');
  const volumeSlider = $('#volume');
  const artworkFrame = document.querySelector('.artwork-frame');
  const waveformCanvas = $('#waveform');
  const particlesCanvas = $('#particles');

  // ── Navigation ───────────────────────────────────────────
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

  // ── Transport ────────────────────────────────────────────
  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function updateProgress() {
    const pct = state.duration ? (state.currentTime / state.duration) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    progressHandle.style.left = `${pct}%`;
    timeCurrent.textContent = formatTime(state.currentTime);
  }

  timeTotal.textContent = formatTime(state.duration);

  btnPlay.addEventListener('click', () => {
    state.playing = !state.playing;
    const playIcon = btnPlay.querySelector('.icon-play');
    const pauseIcon = btnPlay.querySelector('.icon-pause');
    playIcon.classList.toggle('hidden', state.playing);
    pauseIcon.classList.toggle('hidden', !state.playing);
    artworkFrame.classList.toggle('playing', state.playing);

    if (state.playing) {
      // Demo: fake progress
      if (!window._progressInterval) {
        window._progressInterval = setInterval(() => {
          if (!state.playing) return;
          state.currentTime = Math.min(state.currentTime + 0.25, state.duration);
          if (state.currentTime >= state.duration) {
            state.currentTime = 0;
            state.playing = false;
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            artworkFrame.classList.remove('playing');
          }
          updateProgress();
        }, 250);
      }
    }
  });

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    state.currentTime = pct * state.duration;
    updateProgress();
  });

  volumeSlider.addEventListener('input', (e) => {
    state.volume = e.target.value / 100;
  });

  // ── Waveform Visualizer ────────────────────────────────
  function initWaveform() {
    const canvas = waveformCanvas;
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

    // Pre-generate a nice static-looking waveform for the prototype
    const bars = 96;
    const data = new Float32Array(bars);
    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      data[i] =
        0.25 +
        0.35 * Math.sin(t * Math.PI * 4.2) +
        0.2 * Math.sin(t * Math.PI * 11) +
        0.15 * Math.random();
      data[i] = Math.max(0.08, Math.min(1, data[i]));
    }

    let phase = 0;

    function draw() {
      ctx.clearRect(0, 0, w, h);

      const barWidth = (w / bars) * 0.72;
      const gap = (w / bars) * 0.28;
      const centerY = h * 0.5;

      for (let i = 0; i < bars; i++) {
        let amp = data[i];

        // Animate when playing
        if (state.playing) {
          amp *= 0.7 + 0.3 * Math.sin(phase + i * 0.35);
          amp = Math.max(0.08, Math.min(1.15, amp));
        }

        const barH = amp * (h * 0.42);
        const x = i * (barWidth + gap) + gap * 0.5;

        // Gradient per bar
        const grad = ctx.createLinearGradient(0, centerY - barH, 0, centerY + barH);
        grad.addColorStop(0, 'rgba(245, 166, 35, 0.9)');
        grad.addColorStop(0.5, 'rgba(255, 140, 66, 0.55)');
        grad.addColorStop(1, 'rgba(245, 166, 35, 0.15)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Rounded bars
        const r = Math.min(2.5, barWidth / 2);
        roundRect(ctx, x, centerY - barH, barWidth, barH * 2, r);
        ctx.fill();
      }

      // Progress overlay glow line
      const pct = state.duration ? state.currentTime / state.duration : 0;
      const gx = pct * w;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, 8);
      ctx.lineTo(gx, h - 8);
      ctx.stroke();

      phase += state.playing ? 0.08 : 0.01;
      requestAnimationFrame(draw);
    }

    function roundRect(ctx, x, y, width, height, radius) {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    draw();
  }

  // ── Ambient Particles ─────────────────────────────────
  function initParticles() {
    const canvas = particlesCanvas;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const particles = [];
    const COUNT = 48;

    function resize() {
      dpr = window.devicePixelRatio || 1;
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
        r: 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: 0.08 + Math.random() * 0.18,
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

  // ── Demo track meta (placeholder) ──────────────────────
  function setDemoTrack() {
    $('#track-title').textContent = 'Midnight Circuit';
    $('#track-artist').textContent = 'Resonance Demo · Local Library';
    $('#mini-title').textContent = 'Midnight Circuit';
    $('#mini-artist').textContent = 'Resonance Demo';
    $('#tag-bpm').textContent = '124 BPM';
    $('#tag-key').textContent = 'Am';
    $('#tag-energy').textContent = 'Energy 0.72';
  }

  // ── Init ─────────────────────────────────────────────
  setDemoTrack();
  initWaveform();
  initParticles();
  updateProgress();

  // Soft entrance
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.6s var(--ease)';
    document.body.style.opacity = '1';
  });
})();
