/*
  MOHAMED'S ARCADE INVITATION
  ---------------------------------------------------------------
  Edit true / false below to show or hide any section or component.
  Event details, music volume, and the saved-wishes key also live here.
*/
const CONFIG = {
  event: {
    celebrant: "Mohamed",
    age: 9,
    startISO: "2026-09-18T16:00:00+03:00",
    endISO: "2026-09-18T19:00:00+03:00",
    venue: "Rush Hub",
    mapsURL: "https://maps.app.goo.gl/CJtRgtQWtcG6QL2q9",
  },

  music: {
    enabled: true,
    src: "./assets/audio/mohamed-8bit-birthday.mp3",
    volume: 0.9,
    loop: true,
  },

  // SECTION SWITCHES — one boolean for every page section.
  sections: {
    hero: true,
    countdown: true,
    details: true,
    location: true,
    wishes: true,
    cake: true,
    footer: true,
  },

  // COMPONENT SWITCHES — turn individual effects and modules on/off.
  components: {
    pixelSky: true,
    scanlines: true,
    noise: true,
    cursorGlow: true,
    entryGate: true,
    swipeGuide: true,
    levelTransition: true,
    musicPlayer: true,
    sideNav: true,
    topHud: true,
    marquee: true,
    arcadeMachine: true,
    countdownClock: true,
    partyTimeline: true,
    mapEmbed: true,
    wishesForm: true,
    wishesFeed: true,
    cakeReveal: true,
    confetti: true,
    scrollReveals: true,
    liveScore: true,
  },

  wishes: {
    storageKey: "mohamed-level-9-birthday-wishes",
    defaults: [
      {
        name: "ARCADE CREW",
        message: "Happy level 9, Mohamed! May your year be packed with wins, laughs, and epic adventures.",
        emoji: "⚡",
      },
      {
        name: "PLAYER TWO",
        message: "Ready to celebrate the birthday champion. Game on!",
        emoji: "🏆",
      },
    ],
  },
};

window.INVITATION_CONFIG = CONFIG;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const previewMode = new URLSearchParams(window.location.search).get("preview");

const elements = {
  body: document.body,
  gate: document.getElementById("boot-gate"),
  candleConsole: document.getElementById("candle-console"),
  flame: document.getElementById("pixel-flame"),
  smoke: document.getElementById("smoke-stack"),
  swipeButton: document.getElementById("swipe-button"),
  swipeCopy: document.getElementById("swipe-copy"),
  gateHint: document.getElementById("gate-hint"),
  trailLayer: document.getElementById("swipe-trail-layer"),
  transition: document.getElementById("level-transition"),
  world: document.getElementById("game-world"),
  audio: document.getElementById("birthday-audio"),
  soundOrb: document.getElementById("sound-orb"),
  soundPanel: document.getElementById("sound-panel"),
  soundClose: document.getElementById("sound-close"),
  audioToggle: document.getElementById("audio-toggle"),
  volumeRange: document.getElementById("volume-range"),
  sky: document.getElementById("pixel-sky"),
  cursorGlow: document.getElementById("cursor-glow"),
  score: document.getElementById("live-score"),
  nav: document.getElementById("arcade-nav"),
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  countdownMessage: document.getElementById("countdown-message"),
  countdownProgress: document.getElementById("countdown-progress"),
  wishForm: document.getElementById("wish-form"),
  wishName: document.getElementById("wish-name"),
  wishMessage: document.getElementById("wish-message"),
  formMessage: document.getElementById("form-message"),
  wishFeed: document.getElementById("wish-feed"),
  wishCount: document.getElementById("wish-count"),
  cakeButton: document.getElementById("cake-unlock"),
  cakeVault: document.getElementById("cake-vault"),
  chargeFill: document.getElementById("charge-fill"),
  chargeValue: document.getElementById("charge-value"),
  confettiLayer: document.getElementById("confetti-layer"),
  toast: document.getElementById("toast"),
};

const state = {
  entered: false,
  pointerDown: false,
  pointerStartX: 0,
  pointerStartY: 0,
  crossedFlame: false,
  selectedEmoji: "⚡",
  wishes: [],
  cakeCharge: 0,
  cakeTimer: null,
  cakeUnlocked: false,
  starAnimation: null,
  toastTimer: null,
};

boot();

function boot() {
  applyFeatureSwitches();
  configureAudio();
  setupEntryGate();
  setupMusicControls();
  setupCountdown();
  setupWishes();
  setupCakeReveal();
  setupScrollReveals();
  setupActiveNavigation();
  setupCursorGlow();
  setupLiveScore();

  if (CONFIG.components.pixelSky) setupPixelSky();

  if (previewMode === "invite" || !CONFIG.components.entryGate) {
    enterInvitation({ playMusic: false, immediate: true });
  }
}

function applyFeatureSwitches() {
  Object.entries(CONFIG.sections).forEach(([name, enabled]) => {
    document.querySelectorAll(`[data-section="${name}"]`).forEach((node) => {
      if (!enabled) node.classList.add("is-hidden");
    });
  });

  Object.entries(CONFIG.components).forEach(([name, enabled]) => {
    document.querySelectorAll(`[data-component="${name}"]`).forEach((node) => {
      if (!enabled) node.classList.add("is-hidden");
    });
  });
}

function configureAudio() {
  elements.audio.src = CONFIG.music.src;
  elements.audio.volume = clamp(CONFIG.music.volume, 0, 1);
  elements.audio.loop = CONFIG.music.loop;
  elements.volumeRange.value = String(Math.round(elements.audio.volume * 100));
}

function setupEntryGate() {
  elements.swipeButton.addEventListener("click", () => enterInvitation({ playMusic: true }));

  elements.candleConsole.addEventListener("pointerdown", (event) => {
    if (state.entered) return;
    state.pointerDown = true;
    state.pointerStartX = event.clientX;
    state.pointerStartY = event.clientY;
    state.crossedFlame = pointTouchesFlame(event.clientX, event.clientY);
    elements.candleConsole.setPointerCapture?.(event.pointerId);
    leaveSwipeTrail(event.clientX, event.clientY);
  });

  elements.candleConsole.addEventListener("pointermove", (event) => {
    if (!state.pointerDown || state.entered) return;
    leaveSwipeTrail(event.clientX, event.clientY);
    state.crossedFlame ||= pointTouchesFlame(event.clientX, event.clientY);

    const horizontalDistance = Math.abs(event.clientX - state.pointerStartX);
    const verticalDistance = Math.abs(event.clientY - state.pointerStartY);
    if (state.crossedFlame && horizontalDistance >= 64 && horizontalDistance > verticalDistance * 1.1) {
      enterInvitation({ playMusic: true });
    }
  });

  const endSwipe = () => {
    state.pointerDown = false;
    state.crossedFlame = false;
  };

  elements.candleConsole.addEventListener("pointerup", endSwipe);
  elements.candleConsole.addEventListener("pointercancel", endSwipe);
}

function pointTouchesFlame(x, y) {
  const rect = elements.flame.getBoundingClientRect();
  const paddingX = 36;
  const paddingY = 24;
  return x >= rect.left - paddingX && x <= rect.right + paddingX && y >= rect.top - paddingY && y <= rect.bottom + paddingY;
}

function leaveSwipeTrail(x, y) {
  if (!CONFIG.components.swipeGuide || prefersReducedMotion) return;
  const trail = document.createElement("i");
  trail.className = "trail-pixel";
  trail.style.left = `${x - 5}px`;
  trail.style.top = `${y - 5}px`;
  trail.style.background = Math.random() > 0.5 ? "var(--cyan)" : "var(--pink)";
  elements.trailLayer.appendChild(trail);
  window.setTimeout(() => trail.remove(), 600);
}

function enterInvitation({ playMusic, immediate = false }) {
  if (state.entered) return;
  state.entered = true;
  state.pointerDown = false;

  if (playMusic && CONFIG.music.enabled) startMusic();

  if (immediate) {
    elements.gate.classList.add("is-hidden");
    elements.transition.classList.add("is-hidden");
    revealWorld();
    return;
  }

  elements.flame.classList.add("is-out");
  elements.smoke.classList.add("is-visible");
  elements.swipeCopy.textContent = "CANDLE CLEARED — ACCESS GRANTED";
  elements.gateHint.textContent = "Loading Mohamed's next level...";
  elements.gate.classList.add("is-complete");

  if (navigator.vibrate) navigator.vibrate([50, 35, 80]);

  const useTransition = CONFIG.components.levelTransition && !prefersReducedMotion;
  if (useTransition) {
    window.setTimeout(() => {
      elements.transition.classList.remove("is-hidden");
      elements.transition.setAttribute("aria-hidden", "false");
    }, 380);
    window.setTimeout(revealWorld, 1900);
  } else {
    window.setTimeout(revealWorld, 650);
  }
}

function revealWorld() {
  elements.gate.classList.add("is-hidden");
  elements.transition.classList.add("is-hidden");
  elements.transition.setAttribute("aria-hidden", "true");
  elements.world.classList.remove("is-hidden");
  elements.world.classList.add("is-entering");
  elements.body.classList.remove("is-locked");

  if (CONFIG.components.musicPlayer) {
    elements.soundOrb.classList.remove("is-hidden");
  }
  if (CONFIG.components.sideNav) {
    elements.nav.classList.remove("is-hidden");
  }

  document.querySelectorAll(".reveal-item").forEach((node) => {
    if (isInViewport(node)) node.classList.add("is-visible");
  });
}

async function startMusic() {
  try {
    await elements.audio.play();
    updateMusicButton();
  } catch (error) {
    showToast("TAP THE MUSIC BUTTON TO START THE 8-BIT TRACK");
    elements.soundOrb.classList.add("is-paused");
  }
}

function setupMusicControls() {
  elements.soundOrb.addEventListener("click", () => {
    elements.soundPanel.classList.toggle("is-hidden");
  });

  elements.soundClose.addEventListener("click", () => {
    elements.soundPanel.classList.add("is-hidden");
  });

  elements.audioToggle.addEventListener("click", async () => {
    if (elements.audio.paused) {
      await startMusic();
    } else {
      elements.audio.pause();
      updateMusicButton();
    }
  });

  elements.volumeRange.addEventListener("input", () => {
    elements.audio.volume = Number(elements.volumeRange.value) / 100;
  });

  elements.audio.addEventListener("play", updateMusicButton);
  elements.audio.addEventListener("pause", updateMusicButton);
}

function updateMusicButton() {
  const isPaused = elements.audio.paused;
  elements.audioToggle.textContent = isPaused ? "▶" : "Ⅱ";
  elements.audioToggle.setAttribute("aria-label", isPaused ? "Play music" : "Pause music");
  elements.soundOrb.classList.toggle("is-paused", isPaused);
}

function setupCountdown() {
  if (!CONFIG.components.countdownClock) return;

  const eventStart = new Date(CONFIG.event.startISO).getTime();
  const eventEnd = new Date(CONFIG.event.endISO).getTime();
  const countdownWindow = 31 * 24 * 60 * 60 * 1000;

  const update = () => {
    const now = Date.now();
    const distance = Math.max(0, eventStart - now);
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    elements.days.textContent = pad(days);
    elements.hours.textContent = pad(hours);
    elements.minutes.textContent = pad(minutes);
    elements.seconds.textContent = pad(seconds);

    const elapsedInWindow = countdownWindow - Math.max(0, eventStart - now);
    const progress = clamp((elapsedInWindow / countdownWindow) * 100, 3, 100);
    elements.countdownProgress.style.width = `${progress}%`;

    if (now >= eventStart && now < eventEnd) {
      elements.countdownMessage.textContent = "THE PARTY IS LIVE — GAME ON!";
    } else if (now >= eventEnd) {
      elements.countdownMessage.textContent = "MISSION COMPLETE — HAPPY LEVEL 9, MOHAMED!";
    } else if (days === 0) {
      elements.countdownMessage.textContent = "FINAL COUNTDOWN — ARRIVE BY 4:00 PM";
    } else {
      elements.countdownMessage.textContent = "GET YOUR GAME FACE READY";
    }
  };

  update();
  window.setInterval(update, 1000);
}

function setupWishes() {
  if (!CONFIG.sections.wishes) return;
  state.wishes = loadWishes();
  renderWishes();

  document.querySelectorAll("[data-emoji]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEmoji = button.dataset.emoji;
      document.querySelectorAll("[data-emoji]").forEach((item) => {
        item.classList.toggle("is-selected", item === button);
      });
    });
  });

  elements.wishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = elements.wishName.value.trim();
    const message = elements.wishMessage.value.trim();

    if (name.length < 2 || message.length < 3) {
      elements.formMessage.textContent = "ENTER A PLAYER NAME AND A BIRTHDAY WISH.";
      return;
    }

    state.wishes.unshift({ name: name.toUpperCase(), message, emoji: state.selectedEmoji });
    saveWishes();
    renderWishes();
    elements.wishForm.reset();
    elements.formMessage.textContent = "POWER-UP SENT!";
    showToast("BIRTHDAY POWER-UP ADDED");
    if (CONFIG.components.confetti) burstConfetti(32);
    window.setTimeout(() => {
      elements.formMessage.textContent = "";
    }, 2500);
  });
}

function loadWishes() {
  try {
    const stored = JSON.parse(localStorage.getItem(CONFIG.wishes.storageKey));
    return Array.isArray(stored) && stored.length ? stored : [...CONFIG.wishes.defaults];
  } catch (error) {
    return [...CONFIG.wishes.defaults];
  }
}

function saveWishes() {
  try {
    localStorage.setItem(CONFIG.wishes.storageKey, JSON.stringify(state.wishes.slice(0, 30)));
  } catch (error) {
    elements.formMessage.textContent = "WISH ADDED FOR THIS VISIT.";
  }
}

function renderWishes() {
  elements.wishFeed.replaceChildren();
  state.wishes.forEach((wish, index) => {
    const article = document.createElement("article");
    article.className = "wish-card";
    article.style.animationDelay = `${Math.min(index * 0.06, 0.3)}s`;

    const icon = document.createElement("span");
    icon.className = "wish-card__icon";
    icon.textContent = wish.emoji || "★";

    const copy = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = wish.name;
    const message = document.createElement("p");
    message.textContent = wish.message;

    copy.append(name, message);
    article.append(icon, copy);
    elements.wishFeed.appendChild(article);
  });

  elements.wishCount.textContent = pad(state.wishes.length);
}

function setupCakeReveal() {
  if (!CONFIG.components.cakeReveal) return;

  const beginCharge = (event) => {
    if (state.cakeUnlocked) return;
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (state.cakeTimer) return;

    elements.cakeButton.querySelector("span").textContent = "CHARGING...";
    state.cakeTimer = window.setInterval(() => {
      state.cakeCharge = Math.min(100, state.cakeCharge + 3);
      updateCakeCharge();
      if (state.cakeCharge >= 100) unlockCake();
    }, 45);
  };

  const stopCharge = (event) => {
    if (event?.type === "keyup" && !["Enter", " "].includes(event.key)) return;
    window.clearInterval(state.cakeTimer);
    state.cakeTimer = null;
    if (!state.cakeUnlocked) {
      elements.cakeButton.querySelector("span").textContent = "HOLD TO UNLOCK";
      state.cakeCharge = Math.max(0, state.cakeCharge - 8);
      updateCakeCharge();
    }
  };

  elements.cakeButton.addEventListener("pointerdown", beginCharge);
  window.addEventListener("pointerup", stopCharge);
  elements.cakeButton.addEventListener("pointercancel", stopCharge);
  elements.cakeButton.addEventListener("keydown", beginCharge);
  elements.cakeButton.addEventListener("keyup", stopCharge);
  elements.cakeButton.addEventListener("blur", stopCharge);
}

function updateCakeCharge() {
  elements.chargeFill.style.width = `${state.cakeCharge}%`;
  elements.chargeValue.textContent = `${pad(state.cakeCharge)}%`;
}

function unlockCake() {
  if (state.cakeUnlocked) return;
  state.cakeUnlocked = true;
  window.clearInterval(state.cakeTimer);
  state.cakeTimer = null;
  elements.cakeVault.classList.add("is-unlocked");
  elements.cakeButton.querySelector("span").textContent = "CAKE UNLOCKED";
  elements.cakeButton.disabled = true;
  showToast("ACHIEVEMENT UNLOCKED: SWEET LEVEL 09");
  if (navigator.vibrate) navigator.vibrate([60, 35, 60, 35, 110]);
  if (CONFIG.components.confetti) burstConfetti(120);
}

function burstConfetti(amount) {
  const colors = ["#00f0ff", "#ff2bd6", "#ffed4a", "#7cff6b", "#ffffff"];
  for (let index = 0; index < amount; index += 1) {
    const pixel = document.createElement("i");
    pixel.className = "confetti-pixel";
    pixel.style.left = `${Math.random() * 100}%`;
    pixel.style.setProperty("--confetti-color", colors[index % colors.length]);
    pixel.style.setProperty("--confetti-speed", `${2.4 + Math.random() * 2.6}s`);
    pixel.style.setProperty("--confetti-drift", `${-100 + Math.random() * 200}px`);
    pixel.style.setProperty("--confetti-rotation", `${180 + Math.random() * 720}deg`);
    pixel.style.animationDelay = `${Math.random() * 0.65}s`;
    elements.confettiLayer.appendChild(pixel);
    window.setTimeout(() => pixel.remove(), 6000);
  }
}

function setupScrollReveals() {
  const revealNodes = document.querySelectorAll(".reveal-item");
  if (!CONFIG.components.scrollReveals || prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function setupActiveNavigation() {
  if (!CONFIG.components.sideNav || !("IntersectionObserver" in window)) return;
  const links = [...elements.nav.querySelectorAll("a")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-42% 0px -48%", threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
}

function setupCursorGlow() {
  if (!CONFIG.components.cursorGlow || window.matchMedia("(pointer: coarse)").matches) return;
  window.addEventListener("pointermove", (event) => {
    elements.cursorGlow.style.transform = `translate(${event.clientX - 210}px, ${event.clientY - 210}px)`;
  });
}

function setupLiveScore() {
  if (!CONFIG.components.liveScore) return;
  let score = 900;
  window.setInterval(() => {
    if (document.hidden || !state.entered) return;
    score += Math.floor(Math.random() * 9) + 1;
    elements.score.textContent = String(score).padStart(6, "0");
  }, 2400);
}

function setupPixelSky() {
  const context = elements.sky.getContext("2d");
  if (!context) return;

  let stars = [];
  let frame = null;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    elements.sky.width = Math.floor(window.innerWidth * pixelRatio);
    elements.sky.height = Math.floor(window.innerHeight * pixelRatio);
    elements.sky.style.width = `${window.innerWidth}px`;
    elements.sky.style.height = `${window.innerHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = Math.min(95, Math.floor(window.innerWidth / 14));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() > 0.84 ? 3 : 1.5,
      speed: 0.05 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.75 ? "255,43,214" : "0,240,255",
    }));
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    stars.forEach((star) => {
      if (!prefersReducedMotion) {
        star.y += star.speed;
        if (star.y > window.innerHeight + 5) star.y = -5;
      }
      const alpha = 0.16 + ((Math.sin(time * 0.0015 + star.phase) + 1) / 2) * 0.38;
      context.fillStyle = `rgba(${star.color},${alpha})`;
      context.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    });
    if (!prefersReducedMotion) frame = window.requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(frame);
    resize();
    draw();
  });
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.remove("is-visible");
  void elements.toast.offsetWidth;
  elements.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2900);
}

function isInViewport(node) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
}

function pad(value) {
  return String(Math.max(0, Math.floor(value))).padStart(2, "0");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
