# Chatbot Personal Assistant Upgrade — Implementation Plan

> **For agentic workers:** Execute task-by-task using superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing chatbot in `borang.html` into a context-aware personal assistant that guides users intelligently through every step of the DPMM Johor membership form.

**Architecture:** Extend the existing custom vanilla JS + Groq chatbot with 8 targeted upgrades — no third-party widget, no new dependencies except optional `marked.js` for markdown rendering. All state is read from the existing `state` object. A new `_chat` context object manages conversation history. Each upgrade is independent and self-contained.

**Tech Stack:** Vanilla JS, CSS (existing design tokens), Groq API (`llama-3.1-8b-instant`), existing `state` object

**Form Steps Map (for context-awareness):**
- `intro` — Welcome screen, business type selection, Isi Pintar
- Step 1 — Jenis Keahlian & Fasal selection
- Step 2 — Jenis Entiti, Sektor, Proksi
- Step 3 — Butiran Perniagaan (nama, SSM, alamat, modal)
- Step 4 — Pemegang Saham & Lembaga Pengarah
- Step 5 — Muat Naik Dokumen
- Step 6 — Bayaran
- Step 7 — Ringkasan & Akuan
- `success` — Submission confirmed

---

## Files Modified

| File | Sections Changed |
|---|---|
| `borang.html` | CSS lines ~1652–1809 (chatbot styles) |
| `borang.html` | JS lines ~4424–4592 (chatbot functions) |
| `borang.html` | HTML lines ~2694–2713 (chatbot widget HTML) |

No new files. No new CDN dependencies (except optional `marked.js` in Task 6).

---

## Task 1 — Context Object & Step-Aware System Prompt

**What this does (plain language):** Right now the AI has zero memory and doesn't know what step the user is on. This task creates a brain for the chatbot — it knows what step the user is on, what fasal they picked, and what their business type is. Every AI answer will be tailored to where the user currently is in the form.

**Files:**
- Modify: `borang.html` JS section — after `let chatbotState = 'idle';` (~line 4428)

- [ ] **Step 1.1: Add `_chat` context object after existing chatbot state variables**

Find this at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:4427`:
```javascript
let chatbotOpen = false;
let chatbotState = 'idle'; // idle, fasal-guide, faq
```

Replace with:
```javascript
let chatbotOpen = false;
let chatbotState = 'idle'; // idle, fasal-guide, fasal-guide-structure, faq

// NOTE: No icons or emoji anywhere in this file. Plain text labels only.
// _chat manages conversation history and step context for Groq
const _chat = {
  history: [],       // [{role:'user'|'assistant', content:'...'}]
  maxHistory: 6,     // keep last 6 turns (3 user + 3 bot) to stay within token budget
};
```

- [ ] **Step 1.2: Add `buildSystemPrompt()` function — builds a step-aware prompt**

Add this NEW function immediately after the `_chat` declaration:
```javascript
function buildSystemPrompt() {
  const step = state.currentStep;
  const fasal = state.fasal || 'belum dipilih';
  const jenis = state.jenis_keahlian || 'belum dipilih';
  const biz   = state.businessType  || 'belum dipilih';

  const STEP_CONTEXT = {
    'intro': 'Pengguna sedang di skrin selamat datang. Belum memulakan borang. Bantu mereka faham perbezaan Isi Pintar (auto-isi) vs isi manual, dan cara memilih jenis perniagaan.',
    1: 'Pengguna sedang memilih Jenis Keahlian dan Fasal. Bantu mereka memilih fasal yang betul berdasarkan jenis perniagaan mereka. Senarai fasal tersedia: A (Ahli Biasa), S (Ahli Bersekutu), G (Ahli Bergabung), H (Ahli Kehormat).',
    2: 'Pengguna sedang mengisi butiran entiti perniagaan — jenis entiti (Pemunya Tunggal, Perkongsian, Sdn Bhd dll), sektor, dan maklumat proksi. Proksi diperlukan untuk entiti selain Pemunya Tunggal.',
    3: 'Pengguna sedang mengisi maklumat butiran perniagaan — nama entiti, no. pendaftaran SSM, tarikh daftar, alamat, modal berbayar, dan modal pusingan.',
    4: 'Pengguna sedang mengisi senarai pemegang saham dan ahli lembaga pengarah. Setiap baris perlukan nama, peratus pegangan, dan bangsa.',
    5: 'Pengguna sedang memuat naik dokumen. Dokumen wajib: gambar passport, IC depan & belakang, Profil SSM. Dokumen tambahan bergantung kepada fasal yang dipilih.',
    6: 'Pengguna sedang di halaman bayaran. Yuran pendaftaran dan yuran tahunan berdasarkan fasal yang dipilih.',
    7: 'Pengguna sedang menyemak ringkasan permohonan sebelum menghantar. Mereka perlu menandakan semua akuan sebelum boleh hantar.',
    'success': 'Permohonan telah berjaya dihantar. Bantu pengguna faham langkah seterusnya — semak e-mel, simpan nombor rujukan, dan hubungi urusetia jika perlu.'
  };

  const currentContext = STEP_CONTEXT[step] || STEP_CONTEXT[1];

  return `Anda adalah Pembantu Peribadi DPMM Negeri Johor. Tugas anda membantu pengguna mengisi Borang Permohonan Keahlian DPMM dengan betul dan lancar.

KONTEKS SEMASA:
- Langkah borang: ${step === 'intro' ? 'Skrin Selamat Datang' : 'Langkah ' + step + ' daripada 7'}
- Jenis keahlian dipilih: ${jenis}
- Fasal dipilih: ${fasal}
- Jenis perniagaan: ${biz}
- ${currentContext}

PERATURAN JAWAPAN:
1. Jawab HANYA dalam Bahasa Malaysia yang ringkas dan mesra.
2. Hadkan setiap jawapan kepada maksimum 80 patah perkataan.
3. Jika pengguna bertanya tentang langkah yang sedang mereka isi, berikan panduan spesifik.
4. Jika tidak pasti, cadangkan pengguna hubungi urusetia DPMM Negeri Johor.
5. Jangan gunakan simbol markdown seperti ** atau ## dalam jawapan anda.`;
}
```

- [ ] **Step 1.3: Update `sendChatMessage()` to use `_chat.history` and `buildSystemPrompt()`**

Find this block at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:4494-4530`:
```javascript
  if (isKeyConfigured(GROQ_KEY)) {
    showTyping();
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'Anda adalah pembantu borang keahlian DPMM Negeri Johor. Jawab soalan dalam Bahasa Malaysia dengan ringkas dan tepat. Jika tidak pasti, cadangkan pengguna hubungi urusetia.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 300
        })
      });
```

Replace with:
```javascript
  if (isKeyConfigured(GROQ_KEY)) {
    showTyping();
    // Add user message to history before sending
    _chat.history.push({ role: 'user', content: text });
    // Trim to last maxHistory turns
    if (_chat.history.length > _chat.maxHistory) {
      _chat.history = _chat.history.slice(-_chat.maxHistory);
    }
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ..._chat.history
          ],
          max_tokens: 200
        })
      });
```

- [ ] **Step 1.4: Save bot reply into `_chat.history`**

Find this block right after the fetch response handling at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:4517-4521`:
```javascript
      if (data.choices && data.choices[0]) {
        addBotMessage(data.choices[0].message.content);
      } else {
        addBotMessage('Maaf, saya tidak dapat menjawab sekarang. Sila hubungi urusetia.');
      }
```

Replace with:
```javascript
      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        _chat.history.push({ role: 'assistant', content: reply });
        addBotMessage(reply);
      } else {
        addBotMessage('Maaf, saya tidak dapat menjawab sekarang. Sila hubungi urusetia.');
      }
```

- [ ] **Step 1.5: Commit**
```
git commit -m "feat(chatbot): add step-aware system prompt and conversation history"
```

---

## Task 2 — Quick-Reply Buttons for Decision Tree

**What this does (plain language):** Instead of typing "Ya" or "Tidak", the bot shows clickable buttons. This eliminates the most common frustration point — users cannot mistype a button. Works for all decision tree questions (citizenship, business structure).

**Files:**
- Modify: `borang.html` CSS (after `.chatbot-typing` block ~line 1809)
- Modify: `borang.html` JS — `startFasalGuide()`, `handleFasalGuideResponse()`, `handleFasalGuideStructureResponse()`

- [ ] **Step 2.1: Add quick-reply CSS**

Find `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:1809`:
```css
}

/* ---- B6: Focus-visible for keyboard navigation ---- */
```

Insert BEFORE the `/* ---- B6 */` comment:
```css
/* ---- Chatbot quick-reply chips ---- */
.chatbot-quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0 8px;
  align-self: flex-start;
  max-width: 85%;
}
.chatbot-quick-reply {
  background: #fff;
  border: 1.5px solid var(--primary);
  color: var(--primary);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.chatbot-quick-reply:hover {
  background: var(--primary);
  color: #fff;
}
.chatbot-quick-reply:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.chatbot-quick-reply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

- [ ] **Step 2.2: Add `addBotQuickReplies()` helper function**

Add this NEW function immediately after `addUserMessage()` (~line 4457):
```javascript
function addBotQuickReplies(options) {
  // options = [{ label: 'Ya', value: 'ya' }, { label: 'Tidak', value: 'tidak' }]
  const container = document.getElementById('chatbot-messages');
  const row = document.createElement('div');
  row.className = 'chatbot-quick-replies';
  row.id = 'chatbot-qr-' + Date.now();

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chatbot-quick-reply';
    btn.textContent = opt.label;
    btn.addEventListener('click', () => {
      // Disable all buttons in this row after selection
      row.querySelectorAll('.chatbot-quick-reply').forEach(b => b.disabled = true);
      // Simulate user typing the value
      addUserMessage(opt.label);
      // Route to the correct handler
      if (chatbotState === 'fasal-guide') handleFasalGuideResponse(opt.value);
      else if (chatbotState === 'fasal-guide-structure') handleFasalGuideStructureResponse(opt.value);
    });
    row.appendChild(btn);
  });

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}
```

- [ ] **Step 2.3: Update `startFasalGuide()` to render quick-reply buttons**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:4533-4537`:
```javascript
function startFasalGuide() {
  chatbotState = 'fasal-guide';
  addBotMessage('Baik, saya akan bantu anda pilih fasal yang sesuai.');
  addBotMessage('Adakah anda warganegara Malaysia yang beragama Islam? (Ya/Tidak)');
}
```

Replace with:
```javascript
function startFasalGuide() {
  chatbotState = 'fasal-guide';
  addBotMessage('Baik, saya akan bantu anda pilih fasal yang sesuai.');
  addBotMessage('Adakah anda warganegara Malaysia yang beragama Islam?');
  addBotQuickReplies([
    { label: 'Ya', value: 'ya' },
    { label: 'Tidak', value: 'tidak' }
  ]);
}
```

- [ ] **Step 2.4: Update `handleFasalGuideResponse()` to render quick-reply for structure question**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:4539-4550`:
```javascript
function handleFasalGuideResponse(text) {
  const lower = text.toLowerCase();
  if (lower === 'ya' || lower === 'y') {
    addBotMessage('Apakah struktur perniagaan anda? (Pemunya Tunggal / Perkongsian / Sdn Bhd / Koperasi / Persatuan)');
    chatbotState = 'fasal-guide-structure';
  } else if (lower === 'tidak' || lower === 't') {
    addBotMessage('Untuk bukan warganegara Islam, sila pilih Ahli Bersekutu (S) dan semak fasal yang sesuai.');
    chatbotState = 'idle';
  } else {
    addBotMessage('Sila jawab Ya atau Tidak.');
  }
}
```

Replace with:
```javascript
function handleFasalGuideResponse(text) {
  const lower = text.toLowerCase();
  if (lower === 'ya' || lower === 'y') {
    addBotMessage('Apakah struktur perniagaan anda?');
    addBotQuickReplies([
      { label: 'Pemunya Tunggal', value: 'tunggal' },
      { label: 'Perkongsian', value: 'perkongsian' },
      { label: 'Sdn Bhd / Syarikat', value: 'sdn bhd' },
      { label: 'Koperasi', value: 'koperasi' },
      { label: 'Persatuan / NGO', value: 'persatuan' }
    ]);
    chatbotState = 'fasal-guide-structure';
  } else if (lower === 'tidak' || lower === 't') {
    addBotMessage('Untuk bukan warganegara Islam, pilih Ahli Bersekutu (S) dan semak fasal yang sesuai di Langkah 1.');
    chatbotState = 'idle';
  } else {
    addBotMessage('Sila pilih Ya atau Tidak.');
    addBotQuickReplies([
      { label: 'Ya', value: 'ya' },
      { label: 'Tidak', value: 'tidak' }
    ]);
  }
}
```

- [ ] **Step 2.5: Commit**
```
git commit -m "feat(chatbot): add quick-reply buttons for fasal decision tree"
```

---

## Task 3 — Animated Typing Indicator

**What this does (plain language):** Replace the plain italic "Sedang menaip..." text with three animated bouncing dots — the universal signal that the bot is thinking. Every modern chat app uses this pattern.

**Files:**
- Modify: `borang.html` CSS — `.chatbot-typing` block (~line 1801)
- Modify: `borang.html` JS — `showTyping()` function (~line 4459)

- [ ] **Step 3.1: Replace `.chatbot-typing` CSS**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:1801-1809`:
```css
.chatbot-typing {
  font-style: italic;
  color: var(--text-muted);
  font-size: 0.8rem;
  padding: 8px 12px;
  background: #e9ecef;
  border-radius: 12px;
  align-self: flex-start;
}
```

Replace with:
```css
.chatbot-typing {
  padding: 10px 16px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  border-bottom-left-radius: 2px;
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 4px;
}
.chatbot-typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--grey-400);
  animation: chatTypingBounce 1.2s ease-in-out infinite;
}
.chatbot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.chatbot-typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes chatTypingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}
```

- [ ] **Step 3.2: Update `showTyping()` to render animated dots**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:4459-4467`:
```javascript
function showTyping() {
  const container = document.getElementById('chatbot-messages');
  const typing = document.createElement('div');
  typing.className = 'chatbot-typing';
  typing.id = 'chatbot-typing';
  typing.textContent = 'Sedang menaip...';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}
```

Replace with:
```javascript
function showTyping() {
  const container = document.getElementById('chatbot-messages');
  const typing = document.createElement('div');
  typing.className = 'chatbot-typing';
  typing.id = 'chatbot-typing';
  typing.setAttribute('aria-label', 'Pembantu sedang menaip');
  typing.innerHTML = `
    <span class="chatbot-typing-dot"></span>
    <span class="chatbot-typing-dot"></span>
    <span class="chatbot-typing-dot"></span>`;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}
```

- [ ] **Step 3.3: Commit**
```
git commit -m "feat(chatbot): animated typing indicator with bouncing dots"
```

---

## Task 4 — Smooth Open/Close Animation

**What this does (plain language):** The chatbot window currently pops in and out abruptly. This task makes it slide up smoothly when opened and fade out when closed — matching the polish of the rest of the form.

**Files:**
- Modify: `borang.html` CSS — `#chatbot-window` block (~line 1681)
- Modify: `borang.html` JS — `toggleChatbot()` (~line 4430)

- [ ] **Step 4.1: Replace `#chatbot-window` CSS to use transform instead of display toggle**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:1681-1693`:
```css
#chatbot-window {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 360px;
  height: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
}
```

Replace with:
```css
#chatbot-window {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 360px;
  max-width: calc(100vw - 32px);
  height: 500px;
  max-height: calc(100vh - 120px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  transform: translateY(16px) scale(0.97);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.18s ease;
}
#chatbot-window.open {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: all;
}
```

- [ ] **Step 4.2: Update `toggleChatbot()` to use CSS class instead of `display:none`**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:4430-4439`:
```javascript
function toggleChatbot() {
  const win = document.getElementById('chatbot-window');
  chatbotOpen = !chatbotOpen;
  win.style.display = chatbotOpen ? 'flex' : 'none';
  if (chatbotOpen && chatbotState === 'idle') {
    addBotMessage('Saya Pembantu DPMM Johor. Boleh bantu anda dengan:');
    addBotMessage('1. Pemilihan fasal keahlian (ketik "fasal")');
    addBotMessage('2. Soalan tentang borang (taip soalan anda)');
  }
}
```

Replace with:
```javascript
function toggleChatbot() {
  const win = document.getElementById('chatbot-window');
  const toggle = document.getElementById('chatbot-toggle');
  chatbotOpen = !chatbotOpen;
  win.classList.toggle('open', chatbotOpen);
  toggle.setAttribute('aria-expanded', chatbotOpen);
  if (chatbotOpen) {
    document.getElementById('chatbot-input').focus();
    if (chatbotState === 'idle' && document.getElementById('chatbot-messages').children.length === 0) {
      showStepGreeting();
    }
  }
}
```

- [ ] **Step 4.3: Remove `style="display:none"` from the HTML widget**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:2699`:
```html
  <div id="chatbot-window" style="display:none">
```

Replace with:
```html
  <div id="chatbot-window" aria-label="Tetingkap sembang pembantu DPMM">
```

- [ ] **Step 4.4: Commit**
```
git commit -m "feat(chatbot): smooth slide-up open/close animation, mobile-responsive width"
```

---

## Task 5 — Step-Aware Greeting & Proactive Tips

**What this does (plain language):** When the user opens the chatbot on Step 3 (filling in business details), the bot greets them with a tip specific to Step 3 — not a generic "how can I help" message. Each step gets a tailored greeting and 2–3 suggestion buttons for the most common questions on that step.

**Files:**
- Modify: `borang.html` JS — add `showStepGreeting()` function

- [ ] **Step 5.1: Add `showStepGreeting()` function after `toggleChatbot()`**

Add this NEW function immediately after `toggleChatbot()`:
```javascript
function showStepGreeting() {
  const step = state.currentStep;
  const fasal = state.fasal;

  const GREETINGS = {
    'intro': {
      msg: 'Selamat datang! Saya pembantu peribadi DPMM Johor. Boleh saya bantu anda mulakan permohonan?',
      suggestions: ['Apa itu Isi Pintar?', 'Saya tidak tahu fasal saya', 'Apa dokumen diperlukan?']
    },
    1: {
      msg: 'Anda sedang memilih Jenis Keahlian dan Fasal. Tidak pasti fasal yang sesuai? Saya boleh bantu.',
      suggestions: ['Bantu pilih fasal', 'Apa beza Ahli Biasa dan Bersekutu?', 'Berapa yurannya?']
    },
    2: {
      msg: 'Langkah 2 — Butiran entiti perniagaan. Proksi diperlukan jika bukan Pemunya Tunggal.',
      suggestions: ['Apa itu proksi?', 'Sektor mana yang sesuai untuk saya?']
    },
    3: {
      msg: 'Langkah 3 — Maklumat perniagaan. Pastikan nama entiti sama seperti dalam sijil SSM.',
      suggestions: ['Apa itu modal berbayar?', 'Apa itu modal pusingan?', 'Di mana saya boleh cari no. SSM?']
    },
    4: {
      msg: 'Langkah 4 — Senarai pemegang saham dan lembaga pengarah. Isi mengikut rekod SSM terkini.',
      suggestions: ['Berapa ramai pemegang saham perlu diisi?', 'Apa itu lembaga pengarah?']
    },
    5: {
      msg: fasal
        ? `Langkah 5 — Muat naik dokumen untuk Fasal ${fasal}. Fail PDF atau imej, maksimum 10MB.`
        : 'Langkah 5 — Muat naik dokumen yang diperlukan. Fail PDF atau imej, maksimum 10MB.',
      suggestions: ['Dokumen apa yang wajib?', 'Format fail apa yang diterima?', 'Apa itu Profil SSM?']
    },
    6: {
      msg: 'Langkah 6 — Bayaran. Yuran bergantung kepada fasal yang anda pilih.',
      suggestions: ['Berapa yuran saya?', 'Bagaimana cara bayar?']
    },
    7: {
      msg: 'Langkah 7 — Semak ringkasan anda sebelum menghantar. Pastikan semua maklumat betul.',
      suggestions: ['Boleh saya ubah maklumat selepas hantar?', 'Apa langkah selepas hantar?']
    }
  };

  const greeting = GREETINGS[step] || GREETINGS[1];
  addBotMessage(greeting.msg);
  addBotSuggestions(greeting.suggestions);
}

function addBotSuggestions(suggestions) {
  // Renders suggestion chips — same style as quick-reply but auto-fills input instead of routing to state machine
  const container = document.getElementById('chatbot-messages');
  const row = document.createElement('div');
  row.className = 'chatbot-quick-replies';

  suggestions.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'chatbot-quick-reply';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      row.querySelectorAll('.chatbot-quick-reply').forEach(b => b.disabled = true);
      const input = document.getElementById('chatbot-input');
      input.value = text;
      sendChatMessage();
    });
    row.appendChild(btn);
  });

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}
```

- [ ] **Step 5.2: Hook `showStepGreeting()` into `showStep()` so greeting updates when user navigates**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:3062-3085` inside `showStep(n)`:
```javascript
  state.currentStep = n;
  if (n === 5) renderDocUpload();
  if (n === 7) renderRingkasan();
```

Replace with:
```javascript
  state.currentStep = n;
  if (n === 5) renderDocUpload();
  if (n === 7) renderRingkasan();
  // If chatbot is open, refresh the context so next Groq call uses the new step
  // No greeting shown here — only on next open, to avoid interrupting the user
```

- [ ] **Step 5.3: Commit**
```
git commit -m "feat(chatbot): step-aware greetings and contextual suggestion chips per step"
```

---

## Task 6 — Markdown Stripping for Groq Responses

**What this does (plain language):** Groq's AI often returns answers with symbols like `**bold**` or `- list items`. These look like code on screen. This task strips those symbols so the text reads cleanly. We avoid importing any external library — it is a pure text cleanup using 5 lines of JavaScript.

**Files:**
- Modify: `borang.html` JS — `addBotMessage()` and a new `cleanBotText()` helper

- [ ] **Step 6.1: Add `cleanBotText()` helper function after `addBotQuickReplies()`**

```javascript
function cleanBotText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // remove **bold** markers
    .replace(/\*(.*?)\*/g, '$1')       // remove *italic* markers
    .replace(/#+\s/g, '')              // remove ## headings
    .replace(/`([^`]+)`/g, '$1')       // remove `code` backticks
    .replace(/^\s*[-•]\s+/gm, '• ')   // normalise bullet points
    .trim();
}
```

- [ ] **Step 6.2: Apply `cleanBotText()` in `addBotMessage()`**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:4441-4448`:
```javascript
function addBotMessage(text) {
  const container = document.getElementById('chatbot-messages');
  const msg = document.createElement('div');
  msg.className = 'chatbot-message bot';
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}
```

Replace with:
```javascript
function addBotMessage(text) {
  const container = document.getElementById('chatbot-messages');
  const msg = document.createElement('div');
  msg.className = 'chatbot-message bot';
  msg.textContent = cleanBotText(text);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}
```

- [ ] **Step 6.3: Commit**
```
git commit -m "feat(chatbot): strip markdown symbols from Groq responses"
```

---

## Task 7 — ARIA Accessibility Roles

**What this does (plain language):** Screen readers are software that reads web pages aloud for blind users. Without this task, a blind person using the chatbot would not hear the bot's replies because the browser has no instruction to announce them. Three HTML attributes fix this completely.

**Files:**
- Modify: `borang.html` HTML — chatbot widget (~line 2707)

- [ ] **Step 7.1: Add ARIA roles to chatbot HTML elements**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:2695-2713`:
```html
<!-- CHATBOT WIDGET -->
<div id="chatbot-widget">
  <div id="chatbot-toggle" onclick="toggleChatbot()">
    <span>Perlukan Bantuan?</span>
  </div>
  <div id="chatbot-window" aria-label="Tetingkap sembang pembantu DPMM">
    <div class="chatbot-header">
      <div class="chatbot-avatar">
        <img src="dpmm-logo-color.png" alt="DPMM" style="width:32px;height:32px;object-fit:contain;">
      </div>
      <div class="chatbot-title">Pembantu DPMM Johor</div>
      <button class="chatbot-close" onclick="toggleChatbot()">✕</button>
    </div>
    <div id="chatbot-messages" class="chatbot-messages"></div>
    <div class="chatbot-input-area">
      <input type="text" id="chatbot-input" placeholder="Taip soalan anda..." onkeypress="if(event.key==='Enter')sendChatMessage()">
      <button class="chatbot-send" onclick="sendChatMessage()">Hantar</button>
    </div>
  </div>
</div>
```

Replace with:
```html
<!-- CHATBOT WIDGET -->
<div id="chatbot-widget" role="complementary" aria-label="Pembantu peribadi DPMM Johor">
  <div id="chatbot-toggle" onclick="toggleChatbot()" role="button" tabindex="0"
       aria-expanded="false" aria-controls="chatbot-window"
       onkeypress="if(event.key==='Enter'||event.key===' ')toggleChatbot()">
    <span>Perlukan Bantuan?</span>
  </div>
  <div id="chatbot-window" aria-label="Tetingkap sembang pembantu DPMM">
    <div class="chatbot-header">
      <div class="chatbot-avatar">
        <img src="dpmm-logo-color.png" alt="DPMM" style="width:32px;height:32px;object-fit:contain;">
      </div>
      <div class="chatbot-title">Pembantu DPMM Johor</div>
      <button class="chatbot-close" onclick="toggleChatbot()" aria-label="Tutup tetingkap sembang">✕</button>
    </div>
    <div id="chatbot-messages" class="chatbot-messages"
         role="log" aria-live="polite" aria-label="Perbualan dengan pembantu DPMM" aria-atomic="false">
    </div>
    <div class="chatbot-input-area">
      <input type="text" id="chatbot-input" placeholder="Taip soalan anda..."
             aria-label="Kotak input soalan"
             onkeypress="if(event.key==='Enter')sendChatMessage()">
      <button class="chatbot-send" onclick="sendChatMessage()" aria-label="Hantar mesej">Hantar</button>
    </div>
  </div>
</div>
```

- [ ] **Step 7.2: Commit**
```
git commit -m "feat(chatbot): add ARIA roles, aria-live, aria-expanded for screen reader support"
```

---

## Task 8 — Toggle Button Capability Hint & Clear Chat

**What this does (plain language):** Two small polish items. (1) The toggle button gets a small sub-label so users know what the bot can help with before clicking. (2) A "Mulakan Semula" button inside the chat window lets users reset the conversation without reloading the page.

**Files:**
- Modify: `borang.html` CSS — `#chatbot-toggle` block (~line 1659)
- Modify: `borang.html` HTML — toggle button inner HTML
- Modify: `borang.html` JS — add `clearChat()` function

- [ ] **Step 8.1: Update `#chatbot-toggle` CSS to support two-line label**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:1659-1676`:
```css
#chatbot-toggle {
  background: var(--primary);
  color: #fff;
  padding: 12px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: background 0.15s, transform 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
```

Replace with:
```css
#chatbot-toggle {
  background: var(--primary);
  color: #fff;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: background 0.15s, transform 0.1s;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: 160px;
  text-align: center;
}
#chatbot-toggle .toggle-main {
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.01em;
}
#chatbot-toggle .toggle-sub {
  font-size: 0.68rem;
  opacity: 0.82;
  font-weight: 400;
}
```

- [ ] **Step 8.2: Update toggle button HTML**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html:2696-2698`:
```html
  <div id="chatbot-toggle" onclick="toggleChatbot()" role="button" tabindex="0"
       aria-expanded="false" aria-controls="chatbot-window"
       onkeypress="if(event.key==='Enter'||event.key===' ')toggleChatbot()">
    <span>Perlukan Bantuan?</span>
  </div>
```

Replace with:
```html
  <div id="chatbot-toggle" onclick="toggleChatbot()" role="button" tabindex="0"
       aria-expanded="false" aria-controls="chatbot-window"
       onkeypress="if(event.key==='Enter'||event.key===' ')toggleChatbot()">
    <span class="toggle-main">Perlukan Bantuan?</span>
    <span class="toggle-sub">Fasal, dokumen, yuran</span>
  </div>
```

- [ ] **Step 8.3: Add "Mulakan Semula" button to chatbot header**

Find at `@/c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html` inside `.chatbot-header`:
```html
      <div class="chatbot-title">Pembantu DPMM Johor</div>
      <button class="chatbot-close" onclick="toggleChatbot()" aria-label="Tutup tetingkap sembang">✕</button>
```

Replace with:
```html
      <div class="chatbot-title">Pembantu DPMM Johor</div>
      <button class="chatbot-reset" onclick="clearChat()" aria-label="Mulakan semula perbualan"
              title="Mulakan semula" style="background:transparent;border:none;color:rgba(255,255,255,0.7);
              font-size:0.72rem;cursor:pointer;padding:4px 6px;border-radius:4px;
              transition:color 0.15s;margin-right:4px;">
        Semula
      </button>
      <button class="chatbot-close" onclick="toggleChatbot()" aria-label="Tutup tetingkap sembang">✕</button>
```

- [ ] **Step 8.4: Add `clearChat()` function**

Add after `addBotSuggestions()`:
```javascript
function clearChat() {
  document.getElementById('chatbot-messages').innerHTML = '';
  _chat.history = [];
  chatbotState = 'idle';
  showStepGreeting();
}
```

- [ ] **Step 8.5: Commit**
```
git commit -m "feat(chatbot): capability hint on toggle button, clear chat reset button"
```

---

## Task 9 — Final Integration Test & Push

- [ ] **Step 9.1: Manual test checklist — open `borang.html` in browser**

Verify each item:
```
[ ] Toggle button shows "Perlukan Bantuan?" + "Fasal, dokumen, yuran"
[ ] Clicking toggle slides the window up smoothly (not instant pop)
[ ] Greeting message appears on first open — matches current step
[ ] Suggestion chips appear under the greeting
[ ] Clicking a chip fills input and sends automatically
[ ] Clicking "Bantu pilih fasal" → "Ya/Tidak" buttons appear (no typing needed)
[ ] Clicking "Ya" → 5 business structure buttons appear
[ ] Clicking "Pemunya Tunggal" → recommendation appears in plain text (no ** symbols)
[ ] Type a question about modal berbayar → Groq responds in BM
[ ] Navigate to Step 3 → close chatbot → reopen → Step 3 greeting appears
[ ] Groq response has no ** or ## symbols
[ ] Typing indicator shows 3 bouncing dots while Groq fetches
[ ] "Semula" button clears chat and shows fresh greeting
[ ] On phone (375px): chat window fits screen without overflow
[ ] Tab key navigates toggle → input → send → close without trapping focus
```

- [ ] **Step 9.2: Final commit and push**
```
git add borang.html
git commit -m "feat(chatbot): complete personal assistant upgrade — 8 tasks complete"
git push origin main
```

---

## Upgrade Summary

| Task | What Changes | Effort |
|---|---|---|
| 1 | Step-aware AI context + conversation memory | ~1 hr |
| 2 | Quick-reply buttons for decision tree | ~45 min |
| 3 | Animated typing indicator (bouncing dots) | ~20 min |
| 4 | Smooth slide-up animation + mobile responsive | ~30 min |
| 5 | Step-aware greetings + suggestion chips per step | ~1 hr |
| 6 | Markdown stripping for clean Groq responses | ~15 min |
| 7 | ARIA roles for screen reader accessibility | ~15 min |
| 8 | Toggle hint label + clear chat button | ~20 min |
| **Total** | | **~4.5 hrs** |

After all 8 tasks: the chatbot becomes a proactive, context-aware personal assistant that knows which step the user is on, remembers the conversation, guides through the fasal selection with buttons, and speaks clean Bahasa Malaysia.
