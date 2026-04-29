// ============================================
// PERSONA CHAT — Main Application Logic
// ============================================
import { PERSONA_DATA } from './prompts.js';

// --- State ---
let currentPersona = 'anshuman';
const conversations = { anshuman: [], abhimanyu: [], kshitij: [] };
let isLoading = false;

// --- DOM Elements ---
const app = document.getElementById('app');
const chatArea = document.getElementById('chat-area');
const messagesContainer = document.getElementById('messages-container');
const welcomeScreen = document.getElementById('welcome-screen');
const typingIndicator = document.getElementById('typing-indicator');
const typingAvatar = document.getElementById('typing-avatar');
const chipsScroll = document.getElementById('chips-scroll');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const welcomeAvatar = document.getElementById('welcome-avatar');
const welcomeTitle = document.getElementById('welcome-title');
const welcomeSubtitle = document.getElementById('welcome-subtitle');
const welcomeDesc = document.getElementById('welcome-desc');

// --- Initialization ---
function init() {
  app.setAttribute('data-persona', currentPersona);
  renderPersonaTabs();
  renderChips();
  updateWelcomeScreen();
  setupEventListeners();
}

// --- Persona Tabs ---
function renderPersonaTabs() {
  document.querySelectorAll('.persona-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const persona = tab.dataset.persona;
      if (persona === currentPersona || isLoading) return;
      switchPersona(persona);
    });
  });
  updateActiveTab();
}

function updateActiveTab() {
  document.querySelectorAll('.persona-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.persona === currentPersona);
  });
}

function switchPersona(persona) {
  currentPersona = persona;
  app.setAttribute('data-persona', persona);
  updateActiveTab();
  renderChips();
  updateWelcomeScreen();
  renderMessages();
  messageInput.placeholder = `Ask ${PERSONA_DATA[persona].name.split(' ')[0]} anything...`;
}

// --- Welcome Screen ---
function updateWelcomeScreen() {
  const p = PERSONA_DATA[currentPersona];
  welcomeAvatar.textContent = p.initials;
  welcomeTitle.textContent = `Chat with ${p.name}`;
  welcomeSubtitle.textContent = p.subtitle;
  welcomeDesc.textContent = p.description;
}

// --- Suggestion Chips ---
function renderChips() {
  const p = PERSONA_DATA[currentPersona];
  chipsScroll.innerHTML = p.chips.map(text =>
    `<button class="chip" id="chip-${text.substring(0,15).replace(/\s+/g,'-').toLowerCase()}">${text}</button>`
  ).join('');
  chipsScroll.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (isLoading) return;
      sendMessage(chip.textContent);
    });
  });
}

// --- Messages ---
function renderMessages() {
  const msgs = conversations[currentPersona];
  if (msgs.length === 0) {
    welcomeScreen.style.display = 'flex';
    messagesContainer.innerHTML = '';
    return;
  }
  welcomeScreen.style.display = 'none';
  const p = PERSONA_DATA[currentPersona];
  messagesContainer.innerHTML = msgs.map((msg, i) => {
    const isUser = msg.role === 'user';
    return `<div class="message ${isUser ? 'user' : 'bot'}" id="msg-${i}">
      <div class="msg-avatar">${isUser ? 'You' : p.initials}</div>
      <div class="msg-bubble${msg.error ? ' error' : ''}">${escapeHtml(msg.content)}</div>
    </div>`;
  }).join('');
  scrollToBottom();
}

function appendMessage(role, content, error = false) {
  conversations[currentPersona].push({ role, content, error });
  if (conversations[currentPersona].length === 1) {
    welcomeScreen.style.display = 'none';
  }
  const p = PERSONA_DATA[currentPersona];
  const isUser = role === 'user';
  const idx = conversations[currentPersona].length - 1;
  const div = document.createElement('div');
  div.className = `message ${isUser ? 'user' : 'bot'}`;
  div.id = `msg-${idx}`;
  div.innerHTML = `
    <div class="msg-avatar">${isUser ? 'You' : p.initials}</div>
    <div class="msg-bubble${error ? ' error' : ''}">${escapeHtml(content)}</div>
  `;
  messagesContainer.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// --- Typing Indicator ---
function showTyping() {
  const p = PERSONA_DATA[currentPersona];
  typingAvatar.textContent = p.initials;
  typingIndicator.style.display = 'flex';
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.style.display = 'none';
}

// --- Send Message ---
async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || isLoading) return;

  isLoading = true;
  messageInput.value = '';
  messageInput.style.height = 'auto';
  sendButton.disabled = true;

  appendMessage('user', trimmed);
  showTyping();

  try {
    const reply = await callAPI(currentPersona, conversations[currentPersona]);
    hideTyping();
    appendMessage('model', reply);
  } catch (err) {
    hideTyping();
    appendMessage('model', `Sorry, something went wrong: ${err.message}. Please try again.`, true);
  } finally {
    isLoading = false;
    updateSendButton();
  }
}

// --- API Call ---
async function callAPI(persona, messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona, messages })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `API error (${response.status})`);
  }

  const data = await response.json();
  return data.reply;
}

// --- Input Handling ---
function setupEventListeners() {
  messageInput.addEventListener('input', () => {
    // Auto-resize textarea
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    updateSendButton();
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  sendButton.addEventListener('click', () => {
    sendMessage(messageInput.value);
  });

  messageInput.placeholder = `Ask ${PERSONA_DATA[currentPersona].name.split(' ')[0]} anything...`;
}

function updateSendButton() {
  sendButton.disabled = !messageInput.value.trim() || isLoading;
}

// --- Start ---
init();
