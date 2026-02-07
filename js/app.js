// ============ PWA Install Functionality ============
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add('hidden');
});

window.addEventListener('appinstalled', () => {
  installBtn.classList.add('hidden');
  deferredPrompt = null;
});

// ============ Background Music ============
let bgMusic = null;
let isMusicPlaying = false;
let customAudioLoaded = false;

// Romantic music URLs (royalty-free)
const musicTracks = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
];

function initMusic() {
  bgMusic = new Audio();
  bgMusic.loop = true;
  bgMusic.volume = 0.3;

  // Check for saved custom audio
  const savedAudio = localStorage.getItem('customAudio');
  if (savedAudio) {
    bgMusic.src = savedAudio;
    customAudioLoaded = true;
  } else {
    bgMusic.src = musicTracks[0];
  }
}

function toggleMusic() {
  const musicBtn = document.getElementById('musicBtn');

  if (!bgMusic) initMusic();

  if (isMusicPlaying) {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    isMusicPlaying = false;
    showToast('Music paused 🔇');
  } else {
    bgMusic.play().then(() => {
      musicBtn.classList.add('playing');
      isMusicPlaying = true;
      showToast(customAudioLoaded ? 'Playing your music 🎵💕' : 'Playing romantic music 🎵');
    }).catch(err => {
      showToast('Click again to play music 🎵');
    });
  }
}

// Load custom audio file
function loadCustomAudio(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const audioData = e.target.result;

    // Save to localStorage
    try {
      localStorage.setItem('customAudio', audioData);
    } catch (err) {
      console.log('Audio too large for localStorage');
    }

    // Apply to music player
    if (bgMusic) {
      bgMusic.pause();
    }
    bgMusic = new Audio(audioData);
    bgMusic.loop = true;
    bgMusic.volume = document.getElementById('volumeSlider').value / 100;
    customAudioLoaded = true;

    // Auto play
    bgMusic.play().then(() => {
      document.getElementById('musicBtn').classList.add('playing');
      isMusicPlaying = true;
    });

    showToast('Custom music loaded! 🎶💕');
    toggleSettings();
  };
  reader.readAsDataURL(file);
}

// Set volume
function setVolume(value) {
  document.getElementById('volumeValue').textContent = value + '%';
  if (bgMusic) {
    bgMusic.volume = value / 100;
  }
  localStorage.setItem('musicVolume', value);
}

function resetMusic() {
  localStorage.removeItem('customAudio');
  customAudioLoaded = false;

  if (bgMusic) {
    bgMusic.pause();
    bgMusic = null;
  }

  initMusic();

  if (isMusicPlaying) {
    bgMusic.play().then(() => {
      showToast('Music reset to default 🎵');
    }).catch(console.error);
  } else {
    showToast('Music reset to default 🎵');
  }

  toggleSettings();
}

// ============ Lyrics Functionality ============
function toggleLyrics() {
  const panel = document.getElementById('lyricsPanel');
  panel.classList.toggle('hidden');
}

function saveLyrics() {
  const lyrics = document.getElementById('lyricsInput').value;
  if (!lyrics.trim()) {
    showToast('Please enter some lyrics first! 📝');
    return;
  }
  localStorage.setItem('customLyrics', lyrics);
  displayLyrics(lyrics);
  showToast('Lyrics saved! 💾');
}

function loadLyrics() {
  const savedLyrics = localStorage.getItem('customLyrics');
  if (savedLyrics) {
    document.getElementById('lyricsInput').value = savedLyrics;
    displayLyrics(savedLyrics);
  }
}

function displayLyrics(text) {
  const display = document.getElementById('lyricsDisplay');
  const input = document.getElementById('lyricsInput');

  // Format text with line breaks
  display.innerHTML = text.split('\n').map(line => `<p>${line}</p>`).join('');

  display.classList.remove('hidden');
  input.classList.add('hidden');
}

function editLyrics() {
  document.getElementById('lyricsDisplay').classList.add('hidden');
  document.getElementById('lyricsInput').classList.remove('hidden');
}

function clearLyrics() {
  localStorage.removeItem('customLyrics');
  document.getElementById('lyricsInput').value = '';
  document.getElementById('lyricsDisplay').innerHTML = '';
  editLyrics();
  showToast('Lyrics cleared! 🗑️');
}

// ============ Background Image ============
function setBackgroundImage(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageData = e.target.result;

    // Save to localStorage
    try {
      localStorage.setItem('customBackground', imageData);
    } catch (err) {
      showToast('Image too large! Try a smaller image.');
      return;
    }

    applyBackgroundImage(imageData);
    showToast('Background updated! 🖼️💕');
    toggleSettings();
  };
  reader.readAsDataURL(file);
}

function applyBackgroundImage(imageData) {
  // Remove existing custom background
  const existingBg = document.querySelector('.custom-bg');
  if (existingBg) {
    existingBg.remove();
  }

  // Create new background
  const bgDiv = document.createElement('div');
  bgDiv.className = 'custom-bg';
  bgDiv.style.backgroundImage = `url(${imageData})`;
  document.body.insertBefore(bgDiv, document.body.firstChild);

  // Update body style
  document.body.style.background = 'transparent';
}

function resetBackground() {
  localStorage.removeItem('customBackground');

  const existingBg = document.querySelector('.custom-bg');
  if (existingBg) {
    existingBg.remove();
  }

  document.body.style.background = 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 50%, #ffb3c1 100%)';
  showToast('Background reset! 🎨');
}

// Load saved background on startup
function loadSavedBackground() {
  const savedBg = localStorage.getItem('customBackground');
  if (savedBg) {
    applyBackgroundImage(savedBg);
  }

  // Load saved volume
  const savedVolume = localStorage.getItem('musicVolume');
  if (savedVolume) {
    document.getElementById('volumeSlider').value = savedVolume;
    document.getElementById('volumeValue').textContent = savedVolume + '%';
  }
}

// ============ Settings Panel ============
function toggleSettings() {
  const panel = document.getElementById('settingsPanel');
  panel.classList.toggle('hidden');
}

// Close settings when clicking outside
document.addEventListener('click', (e) => {
  const panel = document.getElementById('settingsPanel');
  const settingsBtn = document.getElementById('settingsBtn');

  if (!panel.classList.contains('hidden') &&
    !e.target.closest('.settings-content') &&
    !e.target.closest('.settings-btn')) {
    panel.classList.add('hidden');
  }
});

// Load saved settings on page load
window.addEventListener('DOMContentLoaded', () => {
  loadSavedBackground();
});

// ============ Particle Effects System ============
const particleCanvas = document.getElementById('particleCanvas');
const pCtx = particleCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

class Particle {
  constructor(x, y, color, type) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = type;
    this.size = Math.random() * 8 + 4;
    this.speedX = (Math.random() - 0.5) * 10;
    this.speedY = (Math.random() - 0.5) * 10 - 5;
    this.gravity = 0.2;
    this.life = 1;
    this.decay = 0.02;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
  }

  draw() {
    pCtx.save();
    pCtx.translate(this.x, this.y);
    pCtx.rotate(this.rotation * Math.PI / 180);
    pCtx.globalAlpha = this.life;
    pCtx.fillStyle = this.color;

    if (this.type === 'confetti') {
      pCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 2);
    } else if (this.type === 'firework') {
      pCtx.beginPath();
      pCtx.arc(0, 0, this.size, 0, Math.PI * 2);
      pCtx.fill();
    } else {
      pCtx.font = `${this.size * 3}px Arial`;
      pCtx.fillText(this.type, -this.size, this.size);
    }

    pCtx.restore();
  }
}

function animateParticles() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

  particles = particles.filter(p => p.life > 0);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  if (particles.length > 0) {
    requestAnimationFrame(animateParticles);
  }
}

// ============ Confetti Effect ============
function triggerConfetti() {
  const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#fff', '#ffd700', '#ff69b4'];

  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const x = Math.random() * window.innerWidth;
      const particle = new Particle(x, -20, colors[Math.floor(Math.random() * colors.length)], 'confetti');
      particle.speedY = Math.random() * 3 + 2;
      particle.speedX = (Math.random() - 0.5) * 4;
      particle.gravity = 0.1;
      particle.decay = 0.005;
      particles.push(particle);
    }, i * 20);
  }

  animateParticles();
  showToast('🎊 Confetti time!');
}

// ============ Fireworks Effect ============
function triggerFireworks() {
  const colors = ['#ff4d6d', '#ffd700', '#00ff00', '#00bfff', '#ff69b4', '#fff'];

  for (let burst = 0; burst < 5; burst++) {
    setTimeout(() => {
      const centerX = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
      const centerY = Math.random() * window.innerHeight * 0.5 + 100;

      for (let i = 0; i < 30; i++) {
        const particle = new Particle(centerX, centerY, colors[Math.floor(Math.random() * colors.length)], 'firework');
        const angle = (i / 30) * Math.PI * 2;
        const speed = Math.random() * 5 + 5;
        particle.speedX = Math.cos(angle) * speed;
        particle.speedY = Math.sin(angle) * speed;
        particle.gravity = 0.05;
        particle.decay = 0.015;
        particles.push(particle);
      }
    }, burst * 500);
  }

  animateParticles();
  showToast('🎆 Fireworks!');
}

// ============ Heart Burst Effect ============
function triggerHeartBurst() {
  const hearts = ['💕', '💖', '💗', '💓', '💝', '❤️', '💘', '💞'];

  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight + 20;
      const particle = new Particle(x, y, '#ff4d6d', hearts[Math.floor(Math.random() * hearts.length)]);
      particle.speedY = -(Math.random() * 8 + 8);
      particle.speedX = (Math.random() - 0.5) * 4;
      particle.gravity = 0.1;
      particle.decay = 0.008;
      particles.push(particle);
    }, i * 50);
  }

  animateParticles();
  showToast('💕 Hearts everywhere!');
}

// ============ Rose Petals Effect ============
function triggerRose() {
  const roses = ['🌹', '🌸', '🌺', '🌷', '💐'];

  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const x = Math.random() * window.innerWidth;
      const particle = new Particle(x, -30, '#ff4d6d', roses[Math.floor(Math.random() * roses.length)]);
      particle.speedY = Math.random() * 2 + 1;
      particle.speedX = Math.random() * 2 - 1;
      particle.gravity = 0.02;
      particle.decay = 0.003;
      particle.rotationSpeed = (Math.random() - 0.5) * 5;
      particles.push(particle);
    }, i * 100);
  }

  animateParticles();
  showToast('🌹 Rose petals falling!');
}

// ============ Floating Hearts Background ============
function createFloatingHearts() {
  const container = document.getElementById('heartsBg');
  const hearts = ['💕', '💖', '💗', '💓', '💝', '❤️', '💘', '🌹'];

  for (let i = 0; i < 20; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDuration = (15 + Math.random() * 15) + 's';
    heart.style.animationDelay = Math.random() * 10 + 's';
    heart.style.fontSize = (15 + Math.random() * 25) + 'px';
    container.appendChild(heart);
  }
}
createFloatingHearts();

// ============ Lock Screen ============
const correctPin = "1234";

function unlock() {
  const pin = document.getElementById("pinInput").value;
  if (pin === correctPin) {
    // Success animation before transition
    const lockContainer = document.querySelector('.lock-container');
    lockContainer.style.animation = 'unlockSuccess 0.6s ease forwards';

    setTimeout(() => {
      document.getElementById("lockScreen").style.display = "none";
      document.getElementById("app").classList.remove("hidden");
      initApp();

      // Welcome modal
      setTimeout(() => {
        showModal({
          title: 'Welcome, Pavithra! 💕',
          emoji: '💝',
          message: 'Surendhar made this special app just for you...',
          subtext: 'Explore each day for our love story! ❤️',
          type: 'love',
          buttonText: 'I Love You Too! 💕'
        });
      }, 300);
    }, 500);
  } else {
    const input = document.getElementById("pinInput");
    input.style.animation = 'shake 0.5s ease';
    setTimeout(() => input.style.animation = '', 500);
    input.value = '';

    showModal({
      title: 'Oops, Pavithra!',
      emoji: '🔒',
      message: 'That\'s not the right PIN, my love!',
      subtext: 'Hint: Our special number 1234 💕',
      type: 'error',
      buttonText: 'Try Again 💪'
    });
  }
}

// Enter key support
document.getElementById('pinInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') unlock();
});

// Add shake and unlock animations
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  @keyframes unlockSuccess {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); }
    100% { transform: scale(0.8); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ============ Initialize App ============
function initApp() {
  initDays();
  initCountdown();
  initTabs();
  loadDailyQuote();
  initMusic();
  loadLyrics();

  // Add shimmer and 3D effects to cards
  document.querySelectorAll('.glass-card').forEach(card => {
    card.classList.add('card-3d');
  });

  // Add glow to title
  document.querySelector('.main-title').classList.add('glow-text');
}

// ============ Video Section ============
function playVideo() {
  const placeholder = document.getElementById('videoPlaceholder');
  const video = document.getElementById('loveVideo');

  showToast('Upload your video or choose from below! 🎬');
}

function loadCustomVideo(input) {
  const file = input.files[0];
  if (!file) return;

  const placeholder = document.getElementById('videoPlaceholder');
  const video = document.getElementById('loveVideo');

  video.src = URL.createObjectURL(file);
  placeholder.classList.add('hidden');
  video.classList.remove('hidden');
  video.play();

  showToast('Playing your video! 🎬💕');
}

function openYouTube(videoId) {
  window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  showToast('Opening YouTube... 🎵');
}

// ============ Photo Slideshow ============
let slideshowImages = [];
let currentSlide = 0;
let slideshowInterval = null;
let isSlideshowPlaying = false;

function loadSlideshow(input) {
  const files = Array.from(input.files);
  if (files.length === 0) return;

  slideshowImages = [];

  files.forEach(file => {
    const url = URL.createObjectURL(file);
    slideshowImages.push(url);
  });

  // Hide upload, show slideshow
  document.querySelector('.slideshow-upload').style.display = 'none';
  document.getElementById('slideshow').classList.add('active');
  document.getElementById('slideshowControls').classList.remove('hidden');

  currentSlide = 0;
  showSlide(currentSlide);
  toggleSlideshow(); // Auto-start

  showToast(`Loaded ${files.length} photos! 📸`);
}

function showSlide(index) {
  const slideshow = document.getElementById('slideshow');

  if (slideshowImages.length === 0) return;

  if (index >= slideshowImages.length) currentSlide = 0;
  if (index < 0) currentSlide = slideshowImages.length - 1;

  slideshow.innerHTML = `<img src="${slideshowImages[currentSlide]}" alt="Memory ${currentSlide + 1}">`;
}

function nextSlide() {
  currentSlide++;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide--;
  showSlide(currentSlide);
}

function toggleSlideshow() {
  if (isSlideshowPlaying) {
    clearInterval(slideshowInterval);
    isSlideshowPlaying = false;
    showToast('Slideshow paused ⏸️');
  } else {
    slideshowInterval = setInterval(nextSlide, 3000);
    isSlideshowPlaying = true;
    showToast('Slideshow playing ▶️');
  }
}

// ============ Valentine Days ============
const valentineDays = [
  { date: 7, name: "Rose Day", emoji: "🌹", desc: "Express your love with roses" },
  { date: 8, name: "Propose Day", emoji: "💍", desc: "The perfect day to propose" },
  { date: 9, name: "Chocolate Day", emoji: "🍫", desc: "Sweeten your love" },
  { date: 10, name: "Teddy Day", emoji: "🧸", desc: "Gift a cuddly teddy" },
  { date: 11, name: "Promise Day", emoji: "🤝", desc: "Make promises to keep" },
  { date: 12, name: "Hug Day", emoji: "🤗", desc: "Warm hugs for your love" },
  { date: 13, name: "Kiss Day", emoji: "😘", desc: "Seal it with a kiss" },
  { date: 14, name: "Valentine's Day", emoji: "❤️", desc: "Celebrate your love" }
];

function initDays() {
  const daysDiv = document.getElementById("days");
  const today = new Date();
  const currentDate = today.getDate();
  const currentMonth = today.getMonth() + 1;

  daysDiv.innerHTML = '';

  valentineDays.forEach(day => {
    const isToday = currentMonth === 2 && currentDate === day.date;
    const isPast = currentMonth === 2 && currentDate > day.date;

    const card = document.createElement("div");
    card.className = `day-card ${isToday ? 'today' : ''}`;
    card.innerHTML = `
      <div class="day-emoji">${day.emoji}</div>
      <div class="day-info">
        <div class="day-name">${day.name}</div>
        <div class="day-date">February ${day.date}</div>
      </div>
      <div class="day-status">${isToday ? 'TODAY!' : isPast ? 'Passed' : 'Upcoming'}</div>
    `;
    card.onclick = () => showDayDetails(day);
    daysDiv.appendChild(card);
  });
}

function showDayDetails(day) {
  const messages = getDayMessages(day.name);
  const msg = messages[Math.floor(Math.random() * messages.length)];

  showModal({
    title: day.name,
    emoji: day.emoji,
    message: day.desc,
    subtext: `💭 "${msg}"`,
    type: 'love',
    buttonText: 'Love it! 💖'
  });
}

function getDayMessages(dayName) {
  const messages = {
    "Rose Day": [
      "A rose speaks of love silently, in a language known only to the heart.",
      "Like a rose, our love blooms more beautiful each day.",
      "You're the rose in my garden of life."
    ],
    "Propose Day": [
      "Every love story is beautiful, but ours is my favorite.",
      "Will you be my forever? 💍",
      "I want to spend all my tomorrows with you."
    ],
    "Chocolate Day": [
      "Life is like chocolate - sweet when shared with you!",
      "You're sweeter than any chocolate in the world.",
      "Our love is like chocolate - rich, sweet, and irresistible."
    ],
    "Teddy Day": [
      "Like this teddy, I'll always be there to hold you.",
      "Soft, cuddly, and full of love - just like my feelings for you.",
      "Every time you hug this teddy, remember I'm hugging you."
    ],
    "Promise Day": [
      "I promise to love you in every lifetime.",
      "My promise: To be your strength when you're weak.",
      "I promise to make you smile every single day."
    ],
    "Hug Day": [
      "A hug from you makes everything better.",
      "In your arms is my favorite place to be.",
      "One hug from you is worth more than a thousand words."
    ],
    "Kiss Day": [
      "Your kisses are my favorite kind of magic.",
      "Every kiss from you feels like the first time.",
      "A kiss from you is all I need to feel complete."
    ],
    "Valentine's Day": [
      "You're not just my valentine, you're my everyday.",
      "With you, every day feels like Valentine's Day.",
      "My heart chose you, and it chooses you every day."
    ]
  };
  return messages[dayName] || ["Love you always! ❤️"];
}

// ============ Countdown Timer ============
function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now = new Date();
  const valentine = new Date(now.getFullYear(), 1, 14, 23, 59, 59);

  if (now > valentine) {
    valentine.setFullYear(valentine.getFullYear() + 1);
  }

  const diff = valentine - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('countDays').textContent = days;
  document.getElementById('countHours').textContent = hours;
  document.getElementById('countMins').textContent = mins;
  document.getElementById('countSecs').textContent = secs;
}

// ============ Navigation Tabs ============
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
      document.getElementById(`${tab.dataset.tab}Section`).classList.remove('hidden');
    });
  });

  // Message type buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Frame selector
  document.querySelectorAll('.frame-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.frame-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (currentImage) applyFrame();
    });
  });
}

// ============ AI Message Generator ============
// Personalized for Surendhar & Pavithra
let msgLanguage = 'english';

function setMsgLanguage(lang) {
  msgLanguage = lang;
  document.querySelectorAll('[data-msglang]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.msglang === lang) {
      btn.classList.add('active');
    }
  });
  showToast(lang === 'tamil' ? 'தமிழ் செய்திகள் 🇮🇳' :
    lang === 'tanglish' ? 'Tanglish messages! 🔤' :
      'English messages 🇬🇧');
}

// Tamil Messages Database
const messageDatabaseTamil = {
  romantic: [
    "என் இதயம் உனக்காக மட்டுமே துடிக்கிறது, {name}. உன்னுடன் இருக்கும் ஒவ்வொரு தருணமும் என் ஆத்மாவின் புதையல். 💕",
    "என் இதயத்தின் தோட்டத்தில், {name}, நீதான் மலர்ந்த மிக அழகான மலர். 🌹",
    "{name}, வார்த்தைகள் தோல்வியடையும் போது என் இதயம் எழுதும் கவிதை நீ. உன்னை அளவிட முடியாத அளவு காதலிக்கிறேன். ❤️",
    "ஒவ்வொரு சூரிய உதயமும் உன் புன்னகையை நினைவூட்டுகிறது, {name}. 🌅",
    "{name}, என் காதல் கடல் போல் - விரிந்த, ஆழமான, முடிவில்லாத. நீ என் எல்லாம். 💗",
    "{name}, நீ என் வாழ்க்கையின் காதல் மட்டுமல்ல, என் காதலின் வாழ்க்கையும் நீயே. 💝",
    "சுரேந்தர் + {name} = என்றென்றும்! என் இதயம் உன்னுடையது, இப்போதும் எப்போதும். ∞💕"
  ],
  funny: [
    "பீட்சாவை விட உன்னை அதிகமாக நேசிக்கிறேன், {name}. நான் பீட்சாவை எவ்வளவு நேசிக்கிறேன் என்று உனக்கு தெரியும்! 🍕❤️",
    "{name}, நீ என் மக்ரோனிக்கு சீஸ் மாதிரி - உன்னில்லாம life romba bore! 🧀",
    "{name}, நீ ஒரு காய்கறி என்றால், நீ ஒரு cute-cumber ஆக இருப்பாய்! உன்னை நேசிக்கிறேன்! 🥒💕",
    "நான் போட்டோகிராஃபர் இல்ல, ஆனா {name}, நம்மளை ஒன்னா forever picture பண்ண முடியும்! 📸",
    "{name}, நீ மேஜிஷியன் மாதிரி - உன்னை பார்க்கும்போது மத்தவங்க எல்லாரும் மறைஞ்சுடுறாங்க! ✨"
  ],
  poetic: [
    "வாழ்க்கையின் நெசவில், {name}, எல்லாவற்றையும் அழகாக்கும் தங்க நூல் நீ. ✨",
    "தொலைந்த மாலுமிகளை வீட்டிற்கு வழிநடத்தும் நட்சத்திரங்கள் போல், {name}, உன் காதல் என் இதயத்தை அமைதிக்கு வழிநடத்துகிறது. ⭐",
    "இரண்டு ஆன்மாக்கள் பின்னிப்பிணைந்து, {name}, நித்தியத்தில் நடனமாடுகின்றன - அது நாம், என்றென்றும். 💫",
    "சந்திரன் உன் பெயரை கிசுகிசுக்கிறது, {name}, நட்சத்திரங்கள் உனக்கான என் காதலை எழுதுகின்றன. 🌙"
  ],
  sweet: [
    "நீ என் இதயத்தை சிரிக்க வைக்கிறாய், {name}. உன்னுடன் ஒவ்வொரு நாளும் ஒரு ஆசீர்வாதம். 😊💖",
    "{name}, நீ தேனை விட இனிமையானவள், தங்கத்தை விட விலைமதிப்பற்றவள். உன்னை மிகவும் நேசிக்கிறேன்! 🍯",
    "உன்னை நினைக்கும்போது, {name}, என் இதயம் மகிழ்ச்சியாக நடனமாடுகிறது! 💃❤️",
    "நீ என் favourite notification, {name}. உன் பெயரை பார்க்கும்போதெல்லாம் சிரிப்பு வருது! 📱💕",
    "வாழ்க்கை அழகானது, ஏனென்றால் அது என்னை உன்னிடம் கொண்டு வந்தது, {name}. என்னுடையவளாக இருப்பதற்கு நன்றி. 🌈💝"
  ]
};

// Tanglish Messages Database
const messageDatabaseTanglish = {
  romantic: [
    "En heart unnakaga mattum thudikkuthu, {name}. Unnoda irukura every moment en soul-oda treasure. 💕",
    "En heart-oda garden-la, {name}, nee bloom aana most beautiful flower. 🌹",
    "{name}, words fail aagum bodhu en heart ezhuthura poetry nee. Unnai measure panna mudiyaadha alavu love panren. ❤️",
    "Every sunrise un smile-a remind panudhu, {name}, every sunset un warmth-a remind panudhu. 🌅",
    "En love unnakku, {name}, ocean maathiri - vast, deep, endless. Nee en everything. 💗",
    "{name}, nee en life-oda love mattum illa, en love-oda life-um nee dhaan. 💝",
    "Surendhar + {name} = Forever! En heart un-oda, ippo-vum eppo-vum. ∞💕"
  ],
  funny: [
    "Pizza-va vida unnai adhigama love panren, {name}. Naan pizza-va evlo love panren nu unakku theriyum! 🍕❤️",
    "{name}, nee en macaroni-kku cheese maathiri - un illama life romba plain! 🧀",
    "{name}, nee vegetable-na, nee cute-cumber-a iruppa! Love you! 🥒💕",
    "Naan photographer illa, aana {name}, namma together forever picture panna mudiyum! 📸",
    "{name}, nee magician maathiri - unnai paakkum bodhu mattavanga ellam disappear aaiduvaanga! ✨",
    "{name}, unnai coffee-va vida love panren, adhu solla romba! ☕💕"
  ],
  poetic: [
    "Life-oda tapestry-la, {name}, ellathayum beautiful aakkura golden thread nee. ✨",
    "Lost sailors-a home-ku guide pannura stars maathiri, {name}, un love en heart-a peace-ku guide pannudhu. ⭐",
    "Rendu souls intertwined, {name}, eternity-la dance pannudhu - adhu namma, forever and always. 💫",
    "Moon un name-a whisper pannudhu, {name}, stars en love-a spell out pannudhu. 🌙",
    "Time un kooda irukum bodhu still aagiduthu, {name}, un eyes-la naan infinity-a kandaen. ∞"
  ],
  sweet: [
    "Nee en heart-a smile panna vaikira, {name}. Un kooda every day oru blessing. 😊💖",
    "{name}, nee honey-va vida sweet, gold-a vida precious. Unnai adore panren! 🍯",
    "Unnai think pannum bodhu, {name}, en heart happy dance aadudhu! 💃❤️",
    "Nee en favorite notification, {name}. Un name paakkum bodhu ellam smile varudhu! 📱💕",
    "Life beautiful, because adhu ennai un-kitte kondu vandhuchu, {name}. Thank you for being mine. 🌈💝"
  ]
};

const messageDatabase = {
  romantic: [
    "My heart beats only for you, {name}. Every moment with you is a treasure I hold close to my soul. 💕",
    "In the garden of my heart, {name}, you are the most beautiful flower that ever bloomed. 🌹",
    "{name}, you are the poetry my heart writes when words fail me. I love you beyond measure. ❤️",
    "Every sunrise reminds me of your smile, {name}, and every sunset of the warmth you bring to my life. 🌅",
    "My love for you, {name}, is like the ocean - vast, deep, and endless. You are my everything. 💗",
    "{name}, you're not just the love of my life, you're the life of my love. 💝",
    "If I had a flower for every time you made me smile, {name}, I'd have an endless garden. 🌸",
    "With you, {name}, I've found a love that I never knew existed. You complete me. 💞",
    "{name}, from the moment I met you, I knew my life would never be the same. You're my destiny. 💘",
    "Surendhar + {name} = Forever! My heart belongs to you, now and always. ∞💕"
  ],
  funny: [
    "I love you more than pizza, {name}. And you KNOW how much I love pizza! 🍕❤️",
    "{name}, you're the cheese to my macaroni - life would be so plain without you! 🧀",
    "If you were a vegetable, {name}, you'd be a cute-cumber! I love you! 🥒💕",
    "I'm not a photographer, but {name}, I can definitely picture us together forever! 📸",
    "{name}, are you a magician? Because whenever I look at you, everyone else disappears! ✨",
    "I love you, {name}, even when you steal all the blankets! 🛏️😂",
    "You're the avocado to my toast, {name} - expensive but totally worth it! 🥑💚",
    "{name}, I love you more than coffee, and that's saying a latte! ☕💕",
    "{name}, you're the WiFi to my phone - I can't function without you! 📶💖",
    "Hey {name}, are you Google? Because you have everything I've been searching for! 🔍❤️"
  ],
  poetic: [
    "In the tapestry of life, {name}, you are the golden thread that makes everything beautiful. ✨",
    "Like stars that guide lost sailors home, {name}, your love guides my heart to peace. ⭐",
    "Two souls intertwined, {name}, dancing through eternity - that is us, forever and always. 💫",
    "The moon whispers your name, {name}, and the stars spell out my love for you. 🌙",
    "In the symphony of my life, {name}, you are the most beautiful melody. 🎵",
    "Time stands still when I'm with you, {name}, for in your eyes I've found infinity. ∞",
    "{name}, you are the verse my heart has always wanted to write. 📝💕",
    "Like a river finds the sea, {name}, my soul found its home in you. 🌊",
    "In every lifetime, {name}, I would find you and love you again. You are my forever. 🦋",
    "{name}, your name is written across my heart in letters that will never fade. 💝"
  ],
  sweet: [
    "You make my heart smile, {name}. Every single day with you is a blessing. 😊💖",
    "{name}, you're sweeter than honey and more precious than gold. I adore you! 🍯",
    "Thinking of you, {name}, makes my heart do a happy dance! 💃❤️",
    "You're my favorite notification, {name}. Seeing your name always makes me smile! 📱💕",
    "{name}, you're the marshmallow in my hot chocolate - soft, sweet, and making everything better! ☕",
    "Home is wherever I'm with you, {name}. You are my safe place. 🏠💗",
    "{name}, your smile is my sunshine on cloudy days. I love you! ☀️",
    "Life is beautiful because it brought me to you, {name}. Thank you for being mine. 🌈💝",
    "{name}, every love song makes me think of you. You're my real-life love story! 🎶💕",
    "Dear {name}, you're the best thing that ever happened to Surendhar! I love you! 💖"
  ]
};

function generateMessage() {
  const defaultNames = {
    english: 'my love',
    tamil: 'என் அன்பே',
    tanglish: 'en anbe'
  };

  const name = document.getElementById('partnerName').value.trim() || defaultNames[msgLanguage];
  const activeType = document.querySelector('.type-btn.active').dataset.type;

  // Select database based on language
  let messages;
  if (msgLanguage === 'tamil') {
    messages = messageDatabaseTamil[activeType];
  } else if (msgLanguage === 'tanglish') {
    messages = messageDatabaseTanglish[activeType];
  } else {
    messages = messageDatabase[activeType];
  }

  const message = messages[Math.floor(Math.random() * messages.length)];
  const personalizedMessage = message.replace(/{name}/g, name);

  const output = document.getElementById('aiMessage');
  output.style.opacity = '0';

  setTimeout(() => {
    output.textContent = personalizedMessage;
    output.style.opacity = '1';
    output.style.transition = 'opacity 0.5s ease';

    // Trigger heart burst on generate
    triggerHeartBurst();
  }, 200);
}

function copyMessage() {
  const message = document.getElementById('aiMessage').textContent;
  navigator.clipboard.writeText(message).then(() => {
    showToast('Message copied! 📋');
  });
}

function shareMessage() {
  const message = document.getElementById('aiMessage').textContent;
  if (navigator.share) {
    navigator.share({ text: message }).catch(() => { });
  } else {
    copyMessage();
    showToast('Link copied! Share it with your love 💕');
  }
}

function speakMessage() {
  const message = document.getElementById('aiMessage').textContent;
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
  showToast('Speaking... 🔊');
}

// ============ Love Letter Generator ============
// Personalized letters from Surendhar to Pavithra
let currentLanguage = 'english';

// English Letters
const letterTemplatesEnglish = {
  deeply: `My Dearest {name},

Every moment I spend with you feels like a beautiful dream I never want to wake up from. You've touched my heart in ways I never thought possible.

When I'm with you, the world becomes brighter, colors become more vivid, and every ordinary moment transforms into something magical. You are my greatest adventure, my deepest love, and my forever home.

I love you more than words could ever express. You are my everything, {name}.

Forever Yours,
Surendhar 💕`,

  grateful: `My Beloved {name},

Today, I want you to know how grateful I am to have you in my life. You've been my rock, my comfort, and my biggest supporter.

Thank you for loving me through my flaws, for celebrating my victories, and for holding my hand through every storm. You make me want to be a better person every single day.

I'm the luckiest person to have you, {name}.

With all my gratitude and love,
Your Surendhar 🙏💖`,

  missing: `My Sweet {name},

The distance between us feels like an ocean, but my love for you crosses every wave. I miss your smile, your voice, your warmth beside me.

Every second without you reminds me how much you mean to me. You're constantly in my thoughts, and my heart aches to be near you again.

I can't wait to see you, {name}!

Counting the moments until we're together,
Surendhar 💔➡️💕`,

  excited: `My Darling {name},

I can't stop thinking about our future together! Every dream I have includes you, and I'm so excited for all the adventures waiting for us.

I imagine us building a life full of love, laughter, and endless memories. With you by my side, I know every tomorrow will be better than today.

{name}, you are my forever!

Here's to our beautiful future,
Surendhar 🌟💍`
};

// Tamil Letters
const letterTemplatesTamil = {
  deeply: `என் அன்பான {name},

உன்னோடு செலவிடும் ஒவ்வொரு நொடியும் ஒரு அழகான கனவு போல் உணர்கிறேன். நீ என் இதயத்தை தொட்டிருக்கிறாய், அது நான் நினைத்ததை விட அழகானது.

உன்னுடன் இருக்கும்போது, உலகம் பிரகாசமாகிறது, வண்ணங்கள் மேலும் தெளிவாகின்றன, ஒவ்வொரு சாதாரண தருணமும் மாயமாக மாறுகிறது. நீ என் மிகப்பெரிய சாகசம், என் ஆழமான காதல், என் நிரந்தர வீடு.

வார்த்தைகளால் சொல்ல முடியாத அளவு உன்னை காதலிக்கிறேன். நீ என் எல்லாமே, {name}.

என்றென்றும் உன்னவன்,
சுரேந்தர் 💕`,

  grateful: `என் அன்பான {name},

இன்று, என் வாழ்க்கையில் நீ இருப்பதற்கு நான் எவ்வளவு நன்றியுள்ளவனாக இருக்கிறேன் என்பதை உனக்கு தெரிவிக்க விரும்புகிறேன். நீ என் பலம், என் ஆறுதல், என் மிகப்பெரிய ஆதரவாளர்.

என் குறைபாடுகளை மன்னித்து என்னை நேசித்ததற்கு, என் வெற்றிகளை கொண்டாடியதற்கு, ஒவ்வொரு புயலிலும் என் கையை பிடித்ததற்கு நன்றி. ஒவ்வொரு நாளும் நீ என்னை சிறந்த மனிதனாக மாற்றுகிறாய்.

{name}, உன்னை பெற்றது என் அதிர்ஷ்டம்.

அன்புடன்,
உன் சுரேந்தர் 🙏💖`,

  missing: `என் இனிய {name},

நம் இடையேயான தூரம் கடல் போல் உணர்கிறது, ஆனால் என் காதல் ஒவ்வொரு அலையையும் கடக்கிறது. உன் புன்னகை, உன் குரல், என் அருகில் உன் சூடு எல்லாம் மிகவும் நினைவுக்கு வருகிறது.

உன்னை இல்லாமல் ஒவ்வொரு விநாடியும் நீ எனக்கு எவ்வளவு முக்கியம் என்பதை நினைவூட்டுகிறது. நீ எப்போதும் என் எண்ணங்களில் இருக்கிறாய், உன்னை மீண்டும் பார்க்க என் இதயம் ஏங்குகிறது.

உன்னை சந்திக்க காத்திருக்கிறேன், {name}!

மீண்டும் சந்திக்கும் வரை,
சுரேந்தர் 💔➡️💕`,

  excited: `என் அன்பான {name},

நம் எதிர்காலத்தை பற்றி நினைப்பதை என்னால் நிறுத்த முடியவில்லை! என் ஒவ்வொரு கனவிலும் நீ இருக்கிறாய், நமக்காக காத்திருக்கும் எல்லா சாகசங்களுக்கும் நான் மிகவும் உற்சாகமாக இருக்கிறேன்.

காதல், சிரிப்பு, முடிவற்ற நினைவுகள் நிறைந்த வாழ்க்கையை நாம் கட்டமைப்போம் என்று கற்பனை செய்கிறேன். நீ என் பக்கத்தில் இருந்தால், ஒவ்வொரு நாளையும் இன்றை விட சிறப்பாக இருக்கும் என்று எனக்கு தெரியும்.

{name}, நீ என் நிரந்தரம்!

நம் அழகான எதிர்காலத்திற்கு,
சுரேந்தர் 🌟💍`
};

// Tanglish Letters (Tamil in English script)
const letterTemplatesTanglish = {
  deeply: `En Anbe {name},

Unnoda selavu seyra ovvoru nimishamum oru azhagana kanavu maathiri feel aaguthu. Nee en heart-a touch panni irukkura vidhathula naan nenacha adhigam love panren.

Unnoda irukkumbodhu, ulagame bright aagiduthu, colors romba vivid aagiduthu, ovvoru normal moment-um magical aagiduthu. Nee en biggest adventure, en deepest love, en forever home.

Words-la solla mudiyaadha alavu unnai love panren. Nee en ellame, {name}.

Forever un,
Surendhar 💕`,

  grateful: `En Anbe {name},

Innaiku, en life-la nee irukuradhukkaga naan evlo grateful-a irukken nu unakkku sollanumnu irukku. Nee en strength, en comfort, en biggest supporter.

En mistakes-a forgive panni ennai love pannadhukku, en success-a celebrate pannadhukku, every problem-la en kaiya pudichaadhukku thanks. Every day nee ennai better person aakura.

{name}, unnai paetra naan romba lucky.

With all my love,
Un Surendhar 🙏💖`,

  missing: `En Iniya {name},

Namma distance ocean maathiri feel aaguthu, aana en love every wave-um cross panudhuu. Un smile, un voice, en pakathula un warmth ellam romba miss panren.

Un illama irukura every second nee enakkku evlo important nu remind panudhu. Nee eppovum en thoughts-la irukka, unnai paakanum nu en heart ache aagudhu.

Unnai paakka wait panren, {name}!

Namma meet aagiradhu varaikum,
Surendhar 💔➡️💕`,

  excited: `En Anbe {name},

Namma future-a pathi think panna ennala stop pannave mudila! En every dream-la nee irukka, nammaku wait pannura every adventure-ukku naan romba excited-a irukken.

Love, siripu, endless memories full-a oru life namma build panuvom nu imagine panren. Nee en side-la irundhaa, every tomorrow today-a vida better-a irukkum nu enakku theriyum.

{name}, nee en forever!

Namma beautiful future-kku,
Surendhar 🌟💍`
};

function setLanguage(lang) {
  currentLanguage = lang;

  // Update button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    }
  });

  // Update label text
  const labels = {
    english: 'How do you feel?',
    tamil: 'நீங்கள் எப்படி உணர்கிறீர்கள்?',
    tanglish: 'Nee eppadi feel panra?'
  };
  document.getElementById('feelingLabel').textContent = labels[lang];

  showToast(lang === 'tamil' ? 'தமிழ் தேர்ந்தெடுக்கப்பட்டது 🇮🇳' :
    lang === 'tanglish' ? 'Tanglish selected! 🔤' :
      'English selected 🇬🇧');
}

function generateLetter() {
  const name = document.getElementById('partnerName').value.trim() ||
    (currentLanguage === 'tamil' ? 'என் அன்பே' :
      currentLanguage === 'tanglish' ? 'En Anbe' : 'My Love');
  const feeling = document.getElementById('feelingSelect').value;

  // Select template based on language
  let templates;
  if (currentLanguage === 'tamil') {
    templates = letterTemplatesTamil;
  } else if (currentLanguage === 'tanglish') {
    templates = letterTemplatesTanglish;
  } else {
    templates = letterTemplatesEnglish;
  }

  let letter = templates[feeling].replace(/{name}/g, name);

  const output = document.getElementById('letterOutput');
  output.style.opacity = '0';

  setTimeout(() => {
    output.textContent = letter;
    output.style.opacity = '1';
    output.style.transition = 'opacity 0.5s ease';
  }, 200);

  // Show toast in selected language
  const toastMsg = currentLanguage === 'tamil' ? 'காதல் கடிதம் உருவாக்கப்பட்டது! 💌' :
    currentLanguage === 'tanglish' ? 'Love letter ready! 💌' :
      'Love letter generated! 💌';
  showToast(toastMsg);
}

// Copy letter
function copyLetter() {
  const letter = document.getElementById('letterOutput').textContent;
  if (!letter) {
    showToast('Generate a letter first! 💌');
    return;
  }
  navigator.clipboard.writeText(letter).then(() => {
    showToast(currentLanguage === 'tamil' ? 'நகலெடுக்கப்பட்டது! 📋' : 'Copied! 📋');
  });
}

// Share letter
function shareLetter() {
  const letter = document.getElementById('letterOutput').textContent;
  if (!letter) {
    showToast('Generate a letter first! 💌');
    return;
  }
  if (navigator.share) {
    navigator.share({ text: letter }).catch(() => { });
  } else {
    copyLetter();
  }
}

// Read letter aloud
function speakLetter() {
  const letter = document.getElementById('letterOutput').textContent;
  if (!letter) {
    showToast('Generate a letter first! 💌');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(letter);
  utterance.rate = 0.85;

  // Set language for speech
  if (currentLanguage === 'tamil') {
    utterance.lang = 'ta-IN';
  } else {
    utterance.lang = 'en-US';
  }

  speechSynthesis.speak(utterance);
  showToast(currentLanguage === 'tamil' ? 'படிக்கிறேன்... 🔊' : 'Reading aloud... 🔊');
}

// ============ Photo Frame ============
let currentImage = null;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.getElementById("photoInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    currentImage = img;
    applyFrame();
  };
  img.src = URL.createObjectURL(file);
});

function applyFrame() {
  if (!currentImage) return;

  const frameType = document.querySelector('.frame-btn.active').dataset.frame;
  const img = currentImage;

  // Set canvas size
  const maxWidth = 600;
  const scale = Math.min(maxWidth / img.width, 1);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  // Draw image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Apply frame based on type
  switch (frameType) {
    case 'hearts':
      drawHeartsFrame();
      break;
    case 'roses':
      drawRosesFrame();
      break;
    case 'cupid':
      drawCupidFrame();
      break;
    case 'elegant':
      drawElegantFrame();
      break;
  }
}

function drawHeartsFrame() {
  const hearts = ['💕', '💖', '💗', '💓', '❤️', '💝'];
  ctx.font = `${Math.min(canvas.width, canvas.height) * 0.08}px Arial`;

  // Top
  for (let i = 0; i < canvas.width; i += 50) {
    ctx.fillText(hearts[Math.floor(Math.random() * hearts.length)], i, 35);
  }
  // Bottom
  for (let i = 0; i < canvas.width; i += 50) {
    ctx.fillText(hearts[Math.floor(Math.random() * hearts.length)], i, canvas.height - 10);
  }
  // Sides
  for (let i = 50; i < canvas.height - 50; i += 50) {
    ctx.fillText(hearts[Math.floor(Math.random() * hearts.length)], 5, i);
    ctx.fillText(hearts[Math.floor(Math.random() * hearts.length)], canvas.width - 40, i);
  }

  // Center text
  addCenterText('💕 With Love 💕');
}

function drawRosesFrame() {
  ctx.font = `${Math.min(canvas.width, canvas.height) * 0.07}px Arial`;

  const roses = ['🌹', '🌷', '🌺', '🌸', '💐'];

  for (let i = 0; i < canvas.width; i += 45) {
    ctx.fillText(roses[Math.floor(Math.random() * roses.length)], i, 30);
    ctx.fillText(roses[Math.floor(Math.random() * roses.length)], i, canvas.height - 10);
  }

  for (let i = 40; i < canvas.height - 40; i += 45) {
    ctx.fillText('🌹', 5, i);
    ctx.fillText('🌹', canvas.width - 35, i);
  }

  addCenterText('🌹 Rose Day 🌹');
}

function drawCupidFrame() {
  ctx.font = `${Math.min(canvas.width, canvas.height) * 0.08}px Arial`;

  // Corners
  ctx.fillText('💘', 10, 40);
  ctx.fillText('💘', canvas.width - 45, 40);
  ctx.fillText('💘', 10, canvas.height - 15);
  ctx.fillText('💘', canvas.width - 45, canvas.height - 15);

  // Arrows
  const arrows = ['💘', '💝', '🏹', '💕'];
  for (let i = 60; i < canvas.width - 60; i += 60) {
    ctx.fillText(arrows[Math.floor(Math.random() * arrows.length)], i, 35);
    ctx.fillText(arrows[Math.floor(Math.random() * arrows.length)], i, canvas.height - 12);
  }

  addCenterText('💘 Cupid\'s Arrow 💘');
}

function drawElegantFrame() {
  // Golden border
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  ctx.strokeStyle = '#FFC0CB';
  ctx.lineWidth = 4;
  ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

  // Corners
  ctx.font = `${Math.min(canvas.width, canvas.height) * 0.06}px Arial`;
  ctx.fillText('✨', 8, 30);
  ctx.fillText('✨', canvas.width - 30, 30);
  ctx.fillText('✨', 8, canvas.height - 12);
  ctx.fillText('✨', canvas.width - 30, canvas.height - 12);

  addCenterText('✨ Forever Love ✨');
}

function addCenterText(text) {
  ctx.font = `bold ${Math.min(canvas.width, canvas.height) * 0.06}px 'Poppins', sans-serif`;
  ctx.fillStyle = 'white';
  ctx.strokeStyle = '#ff4d6d';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';

  const x = canvas.width / 2;
  const y = canvas.height - 45;

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  ctx.textAlign = 'left';
}

function downloadPhoto() {
  if (!currentImage) {
    showToast('Please upload a photo first! 📷');
    return;
  }
  const link = document.createElement("a");
  link.download = "valentine-photo.png";
  link.href = canvas.toDataURL();
  link.click();
  showToast('Photo downloaded! 💾');
}

function resetPhoto() {
  currentImage = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('photoInput').value = '';
  showToast('Photo reset! 🔄');
}

// ============ Love Calculator ============
function calculateLove() {
  const name1 = document.getElementById('name1').value.trim();
  const name2 = document.getElementById('name2').value.trim();

  if (!name1 || !name2) {
    showToast('Please enter both names! 💕');
    return;
  }

  // Generate consistent percentage based on names
  const combined = (name1 + name2).toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Ensure high love percentage (60-100)
  const percentage = 60 + Math.abs(hash % 41);

  const messages = [
    { min: 90, text: "Soulmates! 💕 Your love is written in the stars!" },
    { min: 80, text: "Perfect match! 💖 You two are meant to be!" },
    { min: 70, text: "Great compatibility! 💗 Love is definitely in the air!" },
    { min: 60, text: "Strong connection! 💓 Your bond grows stronger each day!" }
  ];

  const message = messages.find(m => percentage >= m.min).text;

  const resultDiv = document.getElementById('loveResult');
  resultDiv.innerHTML = `
    <span class="love-percentage">${percentage}%</span>
    <div class="love-bar">
      <div class="love-bar-fill" style="width: 0%"></div>
    </div>
    <p class="love-message">${message}</p>
  `;

  // Animate the bar
  setTimeout(() => {
    resultDiv.querySelector('.love-bar-fill').style.width = percentage + '%';
  }, 100);
}

// ============ Gift Surprise ============
// Special gifts from Surendhar to Pavithra
const giftSurprises = [
  { emoji: "💎", text: "A precious diamond for my precious Pavithra!" },
  { emoji: "🌹", text: "A thousand roses for you, Pavithra! 🌹" },
  { emoji: "🧸", text: "A cuddly teddy to remind you of Surendhar's hugs!" },
  { emoji: "🍫", text: "Sweet chocolates for my sweetest Pavithra!" },
  { emoji: "💌", text: "A love letter written from Surendhar's heart!" },
  { emoji: "🎵", text: "Our special song that plays in my heart for you!" },
  { emoji: "⭐", text: "A star from the sky, named after you Pavithra!" },
  { emoji: "🌙", text: "The moon and stars, because you deserve the universe!" },
  { emoji: "💍", text: "A promise of forever... Surendhar ❤️ Pavithra!" },
  { emoji: "🏠", text: "A dream home where we'll build our future together!" }
];

let giftOpened = false;

function showGift() {
  const giftBox = document.getElementById('giftBox');
  const giftContent = document.getElementById('giftContent');

  if (giftOpened) {
    // Reset gift
    giftBox.classList.remove('opened');
    giftContent.innerHTML = '';
    giftOpened = false;
    return;
  }

  giftBox.classList.add('opened');

  const surprise = giftSurprises[Math.floor(Math.random() * giftSurprises.length)];

  setTimeout(() => {
    giftContent.innerHTML = `
      <span class="gift-surprise">${surprise.emoji}</span>
      <p>${surprise.text}</p>
      <p style="margin-top: 15px; opacity: 0.7; font-size: 0.9rem;">Click gift box to try again!</p>
    `;
    giftOpened = true;
  }, 500);
}

// ============ Daily Quote ============
const loveQuotes = [
  { text: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn" },
  { text: "Love is composed of a single soul inhabiting two bodies.", author: "Aristotle" },
  { text: "In all the world, there is no heart for me like yours.", author: "Maya Angelou" },
  { text: "I have waited for this opportunity for more than half a century, to repeat to you once again my vow of eternal fidelity and everlasting love.", author: "Gabriel García Márquez" },
  { text: "You know you're in love when you can't fall asleep because reality is finally better than your dreams.", author: "Dr. Seuss" },
  { text: "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.", author: "Maya Angelou" },
  { text: "The greatest thing you'll ever learn is just to love and be loved in return.", author: "Nat King Cole" },
  { text: "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.", author: "Unknown" },
  { text: "To love and be loved is to feel the sun from both sides.", author: "David Viscott" },
  { text: "Love is when the other person's happiness is more important than your own.", author: "H. Jackson Brown Jr." }
];

function loadDailyQuote() {
  // Use date to get consistent daily quote
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const quoteIndex = dayOfYear % loveQuotes.length;

  displayQuote(loveQuotes[quoteIndex]);
}

function newQuote() {
  const randomQuote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];
  displayQuote(randomQuote);
}

function displayQuote(quote) {
  const container = document.getElementById('dailyQuote');
  container.style.opacity = '0';

  setTimeout(() => {
    container.innerHTML = `
      <p class="quote-text">"${quote.text}"</p>
      <p class="quote-author">- ${quote.author}</p>
    `;
    container.style.opacity = '1';
    container.style.transition = 'opacity 0.5s ease';
  }, 200);
}

// ============ Toast Notification ============
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 0.9rem;
    z-index: 10000;
    animation: toastIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Add toast animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(20px); }
  }
`;
document.head.appendChild(toastStyles);

// ============ Custom Modal/Alert System ============
function showModal(options) {
  const {
    title = '',
    emoji = '💕',
    message = '',
    subtext = '',
    buttonText = 'OK',
    type = 'info', // info, success, error, love
    onClose = null
  } = options;

  // Remove existing modal
  const existing = document.querySelector('.custom-modal-overlay');
  if (existing) existing.remove();

  // Create modal
  const overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay';

  const colors = {
    info: { bg: 'linear-gradient(135deg, #667eea, #764ba2)', btn: '#667eea' },
    success: { bg: 'linear-gradient(135deg, #11998e, #38ef7d)', btn: '#11998e' },
    error: { bg: 'linear-gradient(135deg, #eb3349, #f45c43)', btn: '#eb3349' },
    love: { bg: 'linear-gradient(135deg, #ff4d6d, #ff758f)', btn: '#ff4d6d' }
  };

  const color = colors[type] || colors.love;

  overlay.innerHTML = `
    <div class="custom-modal">
      <div class="modal-emoji">${emoji}</div>
      <h2 class="modal-title">${title}</h2>
      <p class="modal-message">${message}</p>
      ${subtext ? `<p class="modal-subtext">${subtext}</p>` : ''}
      <button class="modal-btn" style="background: ${color.btn}">${buttonText}</button>
    </div>
  `;

  // Add styles
  const modalStyles = document.createElement('style');
  modalStyles.id = 'modal-styles';
  if (!document.getElementById('modal-styles')) {
    modalStyles.textContent = `
      .custom-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: modalOverlayIn 0.3s ease;
        padding: 20px;
      }
      
      @keyframes modalOverlayIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .custom-modal {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 25px;
        padding: 40px 30px;
        max-width: 380px;
        width: 100%;
        text-align: center;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
        animation: modalIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      @keyframes modalIn {
        from { 
          opacity: 0; 
          transform: scale(0.8) translateY(20px); 
        }
        to { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }
      
      .modal-emoji {
        font-size: 4rem;
        margin-bottom: 15px;
        animation: modalEmojiBounce 0.6s ease;
      }
      
      @keyframes modalEmojiBounce {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 15px;
      }
      
      .modal-message {
        font-size: 1.05rem;
        color: #555;
        line-height: 1.7;
        margin-bottom: 10px;
      }
      
      .modal-subtext {
        font-size: 0.95rem;
        color: #ff4d6d;
        font-style: italic;
        margin-bottom: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #fff0f3, #ffe6ea);
        border-radius: 12px;
        border-left: 4px solid #ff4d6d;
      }
      
      .modal-btn {
        padding: 14px 40px;
        font-size: 1.1rem;
        font-weight: 600;
        color: white;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 10px;
        font-family: inherit;
      }
      
      .modal-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }
      
      .modal-close-out {
        animation: modalOut 0.3s ease forwards;
      }
      
      .overlay-close-out {
        animation: overlayOut 0.3s ease forwards;
      }
      
      @keyframes modalOut {
        to { 
          opacity: 0; 
          transform: scale(0.8) translateY(20px); 
        }
      }
      
      @keyframes overlayOut {
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(modalStyles);
  }

  document.body.appendChild(overlay);

  // Close function
  const closeModal = () => {
    const modal = overlay.querySelector('.custom-modal');
    modal.classList.add('modal-close-out');
    overlay.classList.add('overlay-close-out');
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 300);
  };

  // Event listeners
  overlay.querySelector('.modal-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // ESC key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return { close: closeModal };
}

// Shortcut functions for different modal types
function showLoveModal(title, message, subtext = '') {
  return showModal({ title, message, subtext, emoji: '💕', type: 'love', buttonText: 'Love it! 💖' });
}

function showSuccessModal(title, message) {
  return showModal({ title, message, emoji: '✅', type: 'success', buttonText: 'Awesome!' });
}

function showErrorModal(title, message) {
  return showModal({ title, message, emoji: '😢', type: 'error', buttonText: 'Try Again' });
}
