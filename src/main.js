// ============================================
// PERSONA CHAT — Main Application Logic
// Copilot-Inspired UI with Home/Chat Screens
// ============================================
import { PERSONA_DATA } from './prompts.js';

// --- State ---
let currentPersona = 'anshuman';
const conversations = { anshuman: [], abhimanyu: [], kshitij: [] };
let isLoading = false;
let currentScreen = 'home'; // 'home' or 'chat'

// --- DOM Elements: Home Screen ---
const app = document.getElementById('app');
const homeScreen = document.getElementById('home-screen');
const heroGreeting = document.getElementById('hero-greeting');
const homeMessageInput = document.getElementById('home-message-input');
const personaDropdownBtn = document.getElementById('persona-dropdown-btn');
const personaDropdownText = document.getElementById('persona-dropdown-text');
const personaPopover = document.getElementById('persona-popover');
const homeChips = document.getElementById('home-chips');

// --- DOM Elements: Chat Screen ---
const chatScreen = document.getElementById('chat-screen');
const chatArea = document.getElementById('chat-area');
const messagesContainer = document.getElementById('messages-container');
const typingIndicator = document.getElementById('typing-indicator');
const typingAvatar = document.getElementById('typing-avatar');
const chatMessageInput = document.getElementById('chat-message-input');
const sendButton = document.getElementById('send-button');
const backBtn = document.getElementById('back-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chatHeaderAvatar = document.getElementById('chat-header-avatar');
const chatHeaderName = document.getElementById('chat-header-name');

// --- Initialization ---
function init() {
  app.setAttribute('data-persona', currentPersona);
  updateGreeting();
  updatePersonaDropdown();
  setupHomeListeners();
  setupChatListeners();
  setupPersonaCards();
  setupPopoverListeners();
  setupHomeChips();
}

// --- Time-Based Greeting ---
function updateGreeting() {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  heroGreeting.textContent = greeting;
}

// --- Persona Dropdown ---
function updatePersonaDropdown() {
  const p = PERSONA_DATA[currentPersona];
  personaDropdownText.textContent = p.name;

  document.querySelectorAll('.popover-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.persona === currentPersona);
  });
}

function togglePopover() {
  const isVisible = personaPopover.classList.contains('visible');
  personaPopover.classList.toggle('visible', !isVisible);
  personaDropdownBtn.classList.toggle('open', !isVisible);
}

function closePopover() {
  personaPopover.classList.remove('visible');
  personaDropdownBtn.classList.remove('open');
}

function setupPopoverListeners() {
  personaDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePopover();
  });

  document.querySelectorAll('.popover-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const persona = opt.dataset.persona;
      if (persona !== currentPersona) {
        switchPersona(persona);
      }
      closePopover();
    });
  });

  // Close popover when clicking outside
  document.addEventListener('click', (e) => {
    if (!personaPopover.contains(e.target) && !personaDropdownBtn.contains(e.target)) {
      closePopover();
    }
  });
}

// --- Persona Cards ---
function setupPersonaCards() {
  document.querySelectorAll('.persona-card').forEach(card => {
    card.addEventListener('click', () => {
      const persona = card.dataset.persona;
      if (persona !== currentPersona) {
        switchPersona(persona);
      }
      navigateToChat();
    });
  });
}

// --- Home Chips ---
function setupHomeChips() {
  // The static chips map to persona-specific suggestions
  homeChips.querySelectorAll('.home-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (isLoading) return;
      // Use the chip text as the message
      const chipText = chip.textContent.trim();
      sendMessageFromHome(chipText);
    });
  });
}

// --- Switch Persona ---
function switchPersona(persona) {
  currentPersona = persona;
  app.setAttribute('data-persona', persona);
  updatePersonaDropdown();
  updateChatHeader();
  chatMessageInput.placeholder = `Ask ${PERSONA_DATA[persona].name.split(' ')[0]} anything...`;
}

// --- Screen Navigation ---
function navigateToChat() {
  currentScreen = 'chat';
  homeScreen.style.display = 'none';
  chatScreen.style.display = 'flex';
  updateChatHeader();
  renderMessages();
  chatMessageInput.focus();
}

function navigateToHome() {
  currentScreen = 'home';
  chatScreen.style.display = 'none';
  homeScreen.style.display = 'flex';
  homeMessageInput.value = '';
  closePopover();
}

// --- Update Chat Header ---
function updateChatHeader() {
  const p = PERSONA_DATA[currentPersona];
  chatHeaderAvatar.textContent = p.initials;
  chatHeaderName.textContent = p.name;
}

// --- Messages ---
function renderMessages() {
  const msgs = conversations[currentPersona];
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

// --- Send Message (from home) ---
function sendMessageFromHome(text) {
  const trimmed = text.trim();
  if (!trimmed || isLoading) return;
  navigateToChat();
  // Small delay to let the DOM transition, then send
  requestAnimationFrame(() => sendMessage(trimmed));
}

// --- Send Message ---
async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || isLoading) return;

  isLoading = true;
  chatMessageInput.value = '';
  chatMessageInput.style.height = 'auto';
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

// --- Home Event Listeners ---
function setupHomeListeners() {
  // Home input: auto-resize
  homeMessageInput.addEventListener('input', () => {
    homeMessageInput.style.height = 'auto';
    homeMessageInput.style.height = Math.min(homeMessageInput.scrollHeight, 100) + 'px';
  });

  // Home input: Enter to send
  homeMessageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageFromHome(homeMessageInput.value);
    }
  });
}

// --- Chat Event Listeners ---
function setupChatListeners() {
  // Chat input: auto-resize
  chatMessageInput.addEventListener('input', () => {
    chatMessageInput.style.height = 'auto';
    chatMessageInput.style.height = Math.min(chatMessageInput.scrollHeight, 120) + 'px';
    updateSendButton();
  });

  // Chat input: Enter to send
  chatMessageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(chatMessageInput.value);
    }
  });

  // Send button
  sendButton.addEventListener('click', () => {
    sendMessage(chatMessageInput.value);
  });

  // Back button
  backBtn.addEventListener('click', navigateToHome);

  // New chat button: clears conversation and goes home
  newChatBtn.addEventListener('click', () => {
    conversations[currentPersona] = [];
    messagesContainer.innerHTML = '';
    navigateToHome();
  });

  chatMessageInput.placeholder = `Ask ${PERSONA_DATA[currentPersona].name.split(' ')[0]} anything...`;
}

function updateSendButton() {
  sendButton.disabled = !chatMessageInput.value.trim() || isLoading;
}

// --- Start ---
init();
