// utils: csrftoken al
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i=0;i<cookies.length;i++){
      const c = cookies[i].trim();
      if (c.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(c.slice(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// DOM elementleri
const toggleBtn = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeBtn = document.getElementById('chat-close');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const messages = document.getElementById('chat-messages');

// Mesaj ekleme fonksiyonu
function appendMessage(text, who='bot') {
  const el = document.createElement('div');
  el.className = 'msg ' + (who === 'user' ? 'user' : 'bot');
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

// Typing göstergesi
function setTyping(on=true) {
  const old = document.querySelector('.typing');
  if (old) old.remove();
  if (on) {
    const el = document.createElement('div');
    el.className = 'msg bot typing';
    el.textContent = 'Yazıyor...';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }
}

// Chat toggle
toggleBtn.addEventListener('click', () => {
  const hidden = chatWindow.getAttribute('aria-hidden') === 'true';
  if (hidden) {
    chatWindow.style.display = 'flex';
    chatWindow.setAttribute('aria-hidden', 'false');
  } else {
    chatWindow.style.display = 'none';
    chatWindow.setAttribute('aria-hidden', 'true');
  }
});

// asteroid verilerini data attribute'tan al
let asteroidName, asteroidDiameterMin, asteroidDiameterMax, asteroidMagnitude,
    asteroidSpeed, asteroidDistance, asteroidOrbitalPeriod, asteroidMeanMotion;

document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;

  asteroidName = chatBox.dataset.asteroid_name || null;
  asteroidDiameterMin = chatBox.dataset.asteroid_diameter_min || null;
  asteroidDiameterMax = chatBox.dataset.asteroid_diameter_max || null;
  asteroidMagnitude = chatBox.dataset.asteroid_magnitude || null;
  asteroidSpeed = chatBox.dataset.asteroid_speed || null;
  asteroidDistance = chatBox.dataset.asteroid_distance || null;
  asteroidOrbitalPeriod = chatBox.dataset.asteroid_orbital_period || null;
  asteroidMeanMotion = chatBox.dataset.asteroid_mean_motion || null;
});

// başta gizle
chatWindow.style.display = 'none';
chatWindow.setAttribute('aria-hidden', 'true');

closeBtn.addEventListener('click', () => {
  chatWindow.style.display = 'none';
  chatWindow.setAttribute('aria-hidden', 'true');
});

// Form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  input.value = '';
  setTyping(true);

  try {
    const res = await fetch('/chat/api/message/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({
        message: text,
        asteroid: {
          name: asteroidName,
          diameterMin: asteroidDiameterMin,
          diameterMax: asteroidDiameterMax,
          magnitude: asteroidMagnitude,
          speed: asteroidSpeed,
          distance: asteroidDistance,
          orbitalPeriod: asteroidOrbitalPeriod,
          meanMotion: asteroidMeanMotion
        }
      })
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    
    // AI cevabını chat ekranına ekle
    appendMessage(data.reply, 'bot');
    setTyping(false);

  } catch (err) {
    console.error(err);
    appendMessage("Mesaj gönderilemedi...", "system");
    setTyping(false);
  }
});
