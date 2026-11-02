/**
 * Resonance — Core Player v0.3
 * Real playback + Feature extraction + Dual-Deck + Automix
 */

(() => {
  'use strict';

  const state = {
    library: [],
    currentIndex: -1,
    playing: false,
    volume: 0.8,
    view: 'now',
    deckA: { trackId: null, audio: null, playing: false, volume: 0.8 },
    deckB: { trackId: null, audio: null, playing: false, volume: 0.8 },
    crossfader: 50,
    mixActive: false,
    mixQueue: [],
    mixIndex: -1,
  };

  let mainAudio = null;
  let objectUrls = [];
  let analysisQueue = [];
  let analyzing = false;

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
    artworkFrame: document.querySelector('.artwork-frame'),
    libraryList: $('#library-list'),
    libraryEmpty: $('#library-empty'),
    libraryCount: $('#library-count'),
    btnImport: $('#btn-import'),
    fileInput: $('#file-input'),
    stage: document.querySelector('.stage'),
    waveform: $('#waveform'),
    particles: $('#particles'),
    deckATitle: $('#deck-a-title'),
    deckAMeta: $('#deck-a-meta'),
    deckAFeatures: $('#deck-a-features'),
    deckAPlay: $('#deck-a-play'),
    deckALoad: $('#deck-a-load'),
    deckAVol: $('#deck-a-vol'),
    deckBTitle: $('#deck-b-title'),
    deckBMeta: $('#deck-b-meta'),
    deckBFeatures: $('#deck-b-features'),
    deckBPlay: $('#deck-b-play'),
    deckBLoad: $('#deck-b-load'),
    deckBVol: $('#deck-b-vol'),
    crossfader: $('#crossfader'),
    btnAutoMix: $('#btn-auto-mix'),
    btnStopMix: $('#btn-stop-mix'),
    mixStatus: $('#mix-status'),
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
    return filename.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Unknown Track';
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getTrackById(id) {
    return state.library.find((t) => t.id === id) || null;
  }

  function getCurrentTrack() {
    if (state.currentIndex < 0 || state.currentIndex >= state.library.length) return null;
    return state.library[state.currentIndex];
  }

  // Feature Extraction (lightweight classical DSP)
  async function analyzeTrack(track) {
    if (track.features?.analyzed) return track.features;

    try {
      const response = await fetch(track.url);
      const arrayBuffer = await response.arrayBuffer();
      const offlineCtx = new OfflineAudioContext(1, 44100 * 30, 44100);
      const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer.slice(0));
      const channel = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const length = channel.length;

      // Energy (RMS)
      let sumSq = 0;
      const step = Math.max(1, Math.floor(length / 20000));
      let count = 0;
      for (let i = 0; i < length; i += step) {
        sumSq += channel[i] * channel[i];
        count++;
      }
      const rms = Math.sqrt(sumSq / count);
      const energy = Math.min(1, Math.max(0, rms * 3.5));

      // BPM via peak intervals
      const windowSize = Math.floor(sampleRate * 0.05);
      const hop = Math.floor(windowSize / 2);
      const energies = [];
      for (let i = 0; i + windowSize < length; i += hop) {
        let e = 0;
        for (let j = 0; j < windowSize; j++) e += channel[i + j] * channel[i + j];
        energies.push(e / windowSize);
      }
      const peaks = [];
      for (let i = 1; i < energies.length - 1; i++) {
        if (energies[i] > energies[i - 1] && energies[i] > energies[i + 1] && energies[i] > 0.01) {
          peaks.push(i);
        }
      }

      let bpm = 120;
      if (peaks.length > 4) {
        const intervals = [];
        for (let i = 1; i < peaks.length; i++) {
          const dt = ((peaks[i] - peaks[i - 1]) * hop) / sampleRate;
          if (dt > 0.25 && dt < 1.5) intervals.push(dt);
        }
        if (intervals.length > 2) {
          const bpms = intervals.map((dt) => Math.round(60 / dt));
          const hist = {};
          bpms.forEach((b) => {
            if (b >= 70 && b <= 180) hist[b] = (hist[b] || 0) + 1;
          });
          let best = 120, bestCount = 0;
          Object.entries(hist).forEach(([b, c]) => {
            if (c > bestCount) {
              bestCount = c;
              best = Number(b);
            }
          });
          bpm = best;
        }
      }

      // Rough key placeholder
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      let centroidSum = 0, magSum = 0;
      for (let i = 0; i < Math.min(length, sampleRate * 5); i += 512) {
        const mag = Math.abs(channel[i]);
        centroidSum += i * mag;
        magSum += mag;
      }
      const keyIdx = magSum > 0 ? Math.floor((centroidSum / magSum / sampleRate) * 12) % 12 : 0;
      const key = keys[Math.abs(keyIdx)] + (energy > 0.55 ? 'm' : '');

      track.features = {
        analyzed: true,
        bpm,
        key,
        energy: Math.round(energy * 100) / 100,
      };
      return track.features;
    } catch (err) {
      console.warn('Analysis failed', track.title, err);
      track.features = { analyzed: true, bpm: 120, key: '—', energy: 0.5 };
      return track.features;
    }
  }

  function enqueueAnalysis(track) {
    if (track.features?.analyzed) return;
    analysisQueue.push(track);
    processAnalysisQueue();
  }

  async function processAnalysisQueue() {
    if (analyzing || analysisQueue.length === 0) return;
    analyzing = true;
    while (analysisQueue.length > 0) {
      const track = analysisQueue.shift();
      await analyzeTrack(track);
      updateNowPlayingUI();
      renderLibrary();
      updateDeckUI('A');
      updateDeckUI('B');
      await new Promise((r) => setTimeout(r, 40));
    }
    analyzing = false;
  }

  // Main Player
  function createMainAudio() {
    if (mainAudio) {
      mainAudio.pause();
      mainAudio.removeAttribute('src');
    }
    mainAudio = new Audio();
    mainAudio.preload = 'auto';
    mainAudio.volume = state.volume;

    mainAudio.addEventListener('loadedmetadata', () => {
      const track = getCurrentTrack();
      if (track && isFinite(mainAudio.duration)) {
        track.duration = mainAudio.duration;
        updateNowPlayingUI();
        renderLibrary();
      }
      els.timeTotal.textContent = formatTime(mainAudio.duration);
    });

    mainAudio.addEventListener('timeupdate', () => {
      if (!mainAudio || !isFinite(mainAudio.duration)) return;
      const pct = (mainAudio.currentTime / mainAudio.duration) * 100;
      els.progressFill.style.width = `${pct}%`;
      els.progressHandle.style.left = `${pct}%`;
      els.timeCurrent.textContent = formatTime(mainAudio.currentTime);
    });

    mainAudio.addEventListener('ended', () => {
      if (!state.mixActive) playNext();
    });

    mainAudio.addEventListener('play', () => setPlaying(true));
    mainAudio.addEventListener('pause', () => setPlaying(false));
    mainAudio.addEventListener('error', () => setPlaying(false));
  }

  function loadTrack(index) {
    if (index < 0 || index >= state.library.length) return;
    state.currentIndex = index;
    const track = state.library[index];
    if (!mainAudio) createMainAudio();
    mainAudio.src = track.url;
    mainAudio.load();
    updateNowPlayingUI();
    renderLibrary();
  }

  function play() {
    if (state.mixActive) return;
    if (!mainAudio || state.currentIndex < 0) {
      if (state.library.length > 0) {
        loadTrack(0);
        mainAudio.play().catch(() => {});
      }
      return;
    }
    mainAudio.play().catch(() => {});
  }

  function pause() {
    if (mainAudio) mainAudio.pause();
    stopDeck('A');
    stopDeck('B');
  }

  function togglePlay() {
    if (state.playing) pause();
    else play();
  }

  function playNext() {
    if (state.library.length === 0) return;
    loadTrack((state.currentIndex + 1) % state.library.length);
    play();
  }

  function playPrev() {
    if (state.library.length === 0) return;
    if (mainAudio && mainAudio.currentTime > 3) {
      mainAudio.currentTime = 0;
      return;
    }
    loadTrack((state.currentIndex - 1 + state.library.length) % state.library.length);
    play();
  }

  function seek(pct) {
    if (!mainAudio || !isFinite(mainAudio.duration)) return;
    mainAudio.currentTime = pct * mainAudio.duration;
  }

  function setVolume(v) {
    state.volume = Math.max(0, Math.min(1, v));
    if (mainAudio) mainAudio.volume = state.volume;
  }

  function setPlaying(isPlaying) {
    state.playing = isPlaying;
    const playIcon = els.btnPlay?.querySelector('.icon-play');
    const pauseIcon = els.btnPlay?.querySelector('.icon-pause');
    if (playIcon && pauseIcon) {
      playIcon.classList.toggle('hidden', isPlaying);
      pauseIcon.classList.toggle('hidden', !isPlaying);
    }
    if (els.artworkFrame) els.artworkFrame.classList.toggle('playing', isPlaying);
  }

  // Dual Deck
  function ensureDeckAudio(deck) {
    const d = deck === 'A' ? state.deckA : state.deckB;
    if (!d.audio) {
      d.audio = new Audio();
      d.audio.preload = 'auto';
      d.audio.volume = d.volume * getCrossfadeGain(deck);
      d.audio.addEventListener('ended', () => {
        d.playing = false;
        updateDeckUI(deck);
        if (state.mixActive) onDeckEnded(deck);
      });
      d.audio.addEventListener('play', () => {
        d.playing = true;
        updateDeckUI(deck);
      });
      d.audio.addEventListener('pause', () => {
        d.playing = false;
        updateDeckUI(deck);
      });
    }
    return d;
  }

  function getCrossfadeGain(deck) {
    const x = state.crossfader / 100;
    if (deck === 'A') return Math.cos(x * 0.5 * Math.PI);
    return Math.sin(x * 0.5 * Math.PI);
  }

  function applyCrossfader() {
    if (state.deckA.audio) state.deckA.audio.volume = state.deckA.volume * getCrossfadeGain('A');
    if (state.deckB.audio) state.deckB.audio.volume = state.deckB.volume * getCrossfadeGain('B');
  }

  function loadToDeck(deck, track) {
    if (!track) return;
    const d = ensureDeckAudio(deck);
    d.trackId = track.id;
    d.audio.src = track.url;
    d.audio.load();
    updateDeckUI(deck);
  }

  function playDeck(deck) {
    const d = ensureDeckAudio(deck);
    if (!d.trackId) return;
    applyCrossfader();
    d.audio.play().catch(() => {});
  }

  function stopDeck(deck) {
    const d = deck === 'A' ? state.deckA : state.deckB;
    if (d.audio) {
      d.audio.pause();
      d.audio.currentTime = 0;
    }
    d.playing = false;
    updateDeckUI(deck);
  }

  function toggleDeck(deck) {
    const d = deck === 'A' ? state.deckA : state.deckB;
    if (d.playing) d.audio?.pause();
    else playDeck(deck);
  }

  function updateDeckUI(deck) {
    const d = deck === 'A' ? state.deckA : state.deckB;
    const titleEl = deck === 'A' ? els.deckATitle : els.deckBTitle;
    const metaEl = deck === 'A' ? els.deckAMeta : els.deckBMeta;
    const featEl = deck === 'A' ? els.deckAFeatures : els.deckBFeatures;
    const playBtn = deck === 'A' ? els.deckAPlay : els.deckBPlay;
    const track = d.trackId ? getTrackById(d.trackId) : null;

    if (titleEl) titleEl.textContent = track ? track.title : `Deck ${deck}`;
    if (metaEl) metaEl.textContent = track ? (d.playing ? 'Playing' : 'Loaded') : 'Ready';

    if (featEl) {
      if (track?.features) {
        featEl.innerHTML = `<span class="tag">${track.features.bpm || '—'} BPM</span><span class="tag">${track.features.key || '—'}</span>`;
      } else {
        featEl.innerHTML = `<span class="tag">— BPM</span><span class="tag">—</span>`;
      }
    }
    if (playBtn) playBtn.textContent = d.playing ? 'PAUSE' : 'PLAY';
  }

  // Automix
  function buildMixQueue() {
    const tracks = [...state.library].filter((t) => t.features?.analyzed);
    if (tracks.length < 2) return state.library.map((t) => t.id);
    tracks.sort((a, b) => (a.features.energy || 0) - (b.features.energy || 0));
    const mid = Math.floor(tracks.length / 2);
    return [...tracks.slice(0, mid), ...tracks.slice(mid).reverse()].map((t) => t.id);
  }

  function startAutoMix() {
    if (state.library.length < 1) {
      setMixStatus('Add tracks first');
      return;
    }
    if (mainAudio) mainAudio.pause();
    setPlaying(false);

    state.mixQueue = buildMixQueue();
    state.mixIndex = 0;
    state.mixActive = true;

    const t1 = getTrackById(state.mixQueue[0]);
    const t2 = state.mixQueue[1] ? getTrackById(state.mixQueue[1]) : null;
    loadToDeck('A', t1);
    if (t2) loadToDeck('B', t2);

    state.crossfader = 0;
    if (els.crossfader) els.crossfader.value = 0;
    applyCrossfader();
    playDeck('A');
    setMixStatus(`Mixing \u00b7 ${state.mixQueue.length} tracks`);
    scheduleNextTransition();
  }

  function scheduleNextTransition() {
    if (!state.mixActive) return;
    const d = state.deckA.playing ? state.deckA : state.deckB;
    if (!d.audio || !isFinite(d.audio.duration)) {
      setTimeout(scheduleNextTransition, 1000);
      return;
    }
    const dur = d.audio.duration;
    const transitionAt = Math.max(dur - 12, dur * 0.7);
    const remaining = (transitionAt - d.audio.currentTime) * 1000;
    if (remaining < 500) {
      doTransition();
      return;
    }
    clearTimeout(window._mixTimer);
    window._mixTimer = setTimeout(() => {
      if (state.mixActive) doTransition();
    }, remaining);
  }

  function doTransition() {
    if (!state.mixActive) return;
    const fromDeck = state.deckA.playing ? 'A' : 'B';
    const toDeck = fromDeck === 'A' ? 'B' : 'A';
    const nextIdx = state.mixIndex + 1;

    if (nextIdx < state.mixQueue.length) {
      const nextTrack = getTrackById(state.mixQueue[nextIdx]);
      if (nextTrack) {
        const currentInTarget = (toDeck === 'A' ? state.deckA : state.deckB).trackId;
        if (currentInTarget !== nextTrack.id) loadToDeck(toDeck, nextTrack);
        playDeck(toDeck);
      }
    }

    animateCrossfader(fromDeck === 'A' ? 0 : 100, fromDeck === 'A' ? 100 : 0, 8000, () => {
      stopDeck(fromDeck);
      state.mixIndex++;
      const nextNext = state.mixIndex + 1;
      if (nextNext < state.mixQueue.length) {
        const t = getTrackById(state.mixQueue[nextNext]);
        if (t) loadToDeck(fromDeck, t);
      }
      if (state.mixIndex >= state.mixQueue.length - 1) {
        setMixStatus('Mix finished');
        state.mixActive = false;
      } else {
        setMixStatus(`Mixing \u00b7 ${state.mixIndex + 1}/${state.mixQueue.length}`);
        scheduleNextTransition();
      }
    });
  }

  function animateCrossfader(from, to, durationMs, onDone) {
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = t * t * (3 - 2 * t);
      state.crossfader = from + (to - from) * eased;
      if (els.crossfader) els.crossfader.value = state.crossfader;
      applyCrossfader();
      if (t < 1) requestAnimationFrame(frame);
      else if (onDone) onDone();
    }
    requestAnimationFrame(frame);
  }

  function onDeckEnded() {
    if (state.mixActive) doTransition();
  }

  function stopAutoMix() {
    state.mixActive = false;
    clearTimeout(window._mixTimer);
    stopDeck('A');
    stopDeck('B');
    setMixStatus('Stopped');
  }

  function setMixStatus(text) {
    if (els.mixStatus) els.mixStatus.textContent = text;
  }

  // Library
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
        features: null,
      };
      state.library.push(track);

      const temp = new Audio();
      temp.src = url;
      temp.addEventListener('loadedmetadata', () => {
        track.duration = temp.duration;
        renderLibrary();
        if (getCurrentTrack()?.id === track.id) updateNowPlayingUI();
      });

      enqueueAnalysis(track);
    });

    renderLibrary();
    if (state.currentIndex < 0 && state.library.length > 0) loadTrack(0);
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
    if (els.libraryCount) els.libraryCount.textContent = `${state.library.length} track${state.library.length === 1 ? '' : 's'}`;

    list.querySelectorAll('.track-row').forEach((r) => r.remove());

    state.library.forEach((track, index) => {
      const row = document.createElement('div');
      row.className = 'track-row' + (index === state.currentIndex ? ' active' : '');
      const bpm = track.features?.bpm ? `${track.features.bpm} BPM` : '\u2026';
      const energy = track.features?.energy != null ? `E ${track.features.energy}` : '';
      row.innerHTML = `
        <div class="track-row-art">\u266a</div>
        <div class="track-row-info">
          <div class="track-row-title">${escapeHtml(track.title)}</div>
          <div class="track-row-meta">${escapeHtml(track.artist)} \u00b7 ${formatTime(track.duration)} \u00b7 ${bpm} ${energy}</div>
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
      els.tagBpm.textContent = '\u2014 BPM';
      els.tagKey.textContent = '\u2014';
      els.tagEnergy.textContent = 'Energy \u2014';
      return;
    }
    els.trackTitle.textContent = track.title;
    els.trackArtist.textContent = track.artist;
    els.miniTitle.textContent = track.title;
    els.miniArtist.textContent = track.artist;
    els.timeTotal.textContent = formatTime(track.duration || (mainAudio?.duration ?? 0));

    if (track.features?.analyzed) {
      els.tagBpm.textContent = `${track.features.bpm} BPM`;
      els.tagKey.textContent = track.features.key || '\u2014';
      els.tagEnergy.textContent = `Energy ${track.features.energy}`;
    } else {
      els.tagBpm.textContent = 'Analyzing\u2026';
      els.tagKey.textContent = '\u2014';
      els.tagEnergy.textContent = '\u2026';
    }
  }

  // Events
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

    els.btnPlay?.addEventListener('click', togglePlay);
    els.btnNext?.addEventListener('click', playNext);
    els.btnPrev?.addEventListener('click', playPrev);
    els.progressBar?.addEventListener('click', (e) => {
      const rect = els.progressBar.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    });
    els.volume?.addEventListener('input', (e) => setVolume(Number(e.target.value) / 100));

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
        stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.add('drag-over'); });
      });
      ['dragleave', 'drop'].forEach((ev) => {
        stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.remove('drag-over'); });
      });
      stage.addEventListener('drop', (e) => {
        if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
      });
    }
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());

    els.deckALoad?.addEventListener('click', () => { const t = getCurrentTrack(); if (t) loadToDeck('A', t); });
    els.deckBLoad?.addEventListener('click', () => { const t = getCurrentTrack(); if (t) loadToDeck('B', t); });
    els.deckAPlay?.addEventListener('click', () => toggleDeck('A'));
    els.deckBPlay?.addEventListener('click', () => toggleDeck('B'));
    els.deckAVol?.addEventListener('input', (e) => { state.deckA.volume = Number(e.target.value) / 100; applyCrossfader(); });
    els.deckBVol?.addEventListener('input', (e) => { state.deckB.volume = Number(e.target.value) / 100; applyCrossfader(); });
    els.crossfader?.addEventListener('input', (e) => { state.crossfader = Number(e.target.value); applyCrossfader(); });
    els.btnAutoMix?.addEventListener('click', startAutoMix);
    els.btnStopMix?.addEventListener('click', stopAutoMix);
  }

  // Visualizer
  function initWaveform() {
    const canvas = els.waveform;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    const bars = 80;
    const data = new Float32Array(bars);
    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      data[i] = Math.max(0.06, Math.min(1, 0.22 + 0.3 * Math.sin(t * Math.PI * 3.8) + 0.18 * Math.sin(t * Math.PI * 9) + 0.12 * Math.random()));
    }
    let phase = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const barWidth = (w / bars) * 0.7;
      const gap = (w / bars) * 0.3;
      const centerY = h * 0.5;
      const active = state.playing || state.deckA.playing || state.deckB.playing;
      for (let i = 0; i < bars; i++) {
        let amp = data[i];
        if (active) amp = Math.max(0.06, Math.min(1.1, amp * (0.65 + 0.35 * Math.sin(phase + i * 0.28))));
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
      if (mainAudio && isFinite(mainAudio.duration) && mainAudio.duration > 0) {
        const gx = (mainAudio.currentTime / mainAudio.duration) * w;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gx, 6);
        ctx.lineTo(gx, h - 6);
        ctx.stroke();
      }
      phase += active ? 0.07 : 0.008;
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
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.5 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        a: 0.06 + Math.random() * 0.14,
      });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
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
    createMainAudio();
    bindEvents();
    initWaveform();
    initParticles();
    updateNowPlayingUI();
    renderLibrary();
    updateDeckUI('A');
    updateDeckUI('B');
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
      document.body.style.opacity = '1';
    });
  }

  init();
})();
