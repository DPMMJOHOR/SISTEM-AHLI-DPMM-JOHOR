"""
Aiman (borang.html) — Comprehensive Test & Audit
Checks: UI structure, core functions, system prompt, Groq config,
fasal guide state machine, input screening, scripted FAQ,
UX bugs, security/CSP, accessibility, and improvements.
"""
import re, sys

HTML_PATH = r'C:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\borang.html'
with open(HTML_PATH, encoding='utf-8') as f:
    src = f.read()

PASS = '  \u2705 PASS'
FAIL = '  \u274c FAIL'
WARN = '  \u26a0\ufe0f  WARN'

results = []
failures = []

def check(name, cond, note='', warn=False):
    tag = WARN if (warn and not cond) else (PASS if cond else FAIL)
    results.append(f'{tag}  {name}' + (f'  [{note}]' if note else ''))
    if not cond and not warn:
        failures.append(name)

# ── A. UI STRUCTURE ──────────────────────────────────────────────────────────
print('\n\u2501'*42)
print(' Aiman (borang.html) \u2014 Test & Audit Report')
print('\u2501'*42 + '\n')

print('[ A ] UI STRUCTURE')
check('chatbot-widget exists',           'id="chatbot-widget"' in src)
check('chatbot-toggle button exists',    'id="chatbot-toggle"' in src)
check('chatbot-window exists',           'id="chatbot-window"' in src)
check('chatbot-messages container',      'id="chatbot-messages"' in src)
check('chatbot-input exists',            'id="chatbot-input"' in src)
check('chatbot-send button exists',      'id="chatbot-send"' in src or 'chatbot-send' in src)
check('aiman.jpg.png avatar present',    'src="aiman.jpg.png"' in src)
check('Typing indicator (chatbot-typing)','chatbot-typing' in src)
check('Close / Tutup button (toggleChatbot)', 'toggleChatbot()' in src)
check('Reset / Semula button (clearChat)',    'clearChat()' in src)

# ── B. ACCESSIBILITY ─────────────────────────────────────────────────────────
print('\n[ B ] ACCESSIBILITY')
check('chatbot-widget has aria-label',         'aria-label="Aiman' in src)
check('chatbot-toggle has aria-expanded',      'aria-expanded' in src)
check('chatbot-toggle keyboard: Enter/Space',  "event.key==='Enter'" in src and 'toggleChatbot' in src)
check('chatbot-messages aria-live="polite"',   'aria-live="polite"' in src)
check('chatbot-messages aria-atomic',          'aria-atomic="false"' in src)
check('chatbot-input aria-label',              'aria-label="Kotak input soalan"' in src)
check('chatbot-send aria-label',               'aria-label="Hantar mesej"' in src)

# ── C. CORE FUNCTIONS ────────────────────────────────────────────────────────
print('\n[ C ] CORE FUNCTIONS')
funcs = [
    'function buildSystemPrompt(',
    'function toggleChatbot(',
    'function showStepGreeting(',
    'function addBotMessage(',
    'function addUserMessage(',
    'function addBotSuggestions(',
    'function addBotQuickReplies(',
    'function showTyping(',
    'function hideTyping(',
    'function cleanBotText(',
    'function clearChat(',
    'function screenUserInput(',
    'function handleGroqError(',
    'function addContactChip(',
    'function sendChatMessage(',
    'function startFasalGuide(',
    'function handleFasalGuideResponse(',
    'function handleFasalGuideStructureResponse(',
    'function showScriptedFAQ(',
    'function isKeyConfigured(',
]
for fn in funcs:
    check(fn.replace('function ','').replace('(',''), fn in src)

# ── D. GROQ / API CONFIGURATION ──────────────────────────────────────────────
print('\n[ D ] GROQ / API CONFIGURATION')
model_match = re.search(r"model\s*:\s*['\"]([^'\"]+)['\"]", src)
model_name  = model_match.group(1) if model_match else 'unknown'
tok_match   = re.search(r'max_tokens\s*:\s*(\d+)', src)
tok_val     = tok_match.group(1) if tok_match else '?'

check(f'Model is llama-3.1-8b-instant (should upgrade to 70b-versatile)',
      '70b' in model_name or 'versatile' in model_name,
      note='Still on 8b — upgrade to llama-3.3-70b-versatile for better Malay FAQ accuracy')
check(f'max_tokens={tok_val} (minimum 700 recommended for FAQ answers)',
      int(tok_val) >= 700 if tok_val.isdigit() else False,
      note='500 is too low — complex FAQ answers may be truncated')
check('isKeyConfigured() guards Groq calls',   'isKeyConfigured(GROQ_KEY)' in src)
check('GROQ_KEY falls back to placeholder',     "YOUR_GROQ_KEY_HERE" in src)
check('CSP connect-src includes api.groq.com', 'https://api.groq.com' in src)
check('No hardcoded real Groq key in source',
      not bool(re.search(r"gsk_[A-Za-z0-9]{40,}", src)),
      note='Scanned for gsk_ prefix patterns')

# ── E. SYSTEM PROMPT QUALITY ─────────────────────────────────────────────────
print('\n[ E ] SYSTEM PROMPT QUALITY')
check('STEP_CONTEXT object defined (step-aware)',        'STEP_CONTEXT' in src)
_ctx_block = src[src.find('STEP_CONTEXT'):src.find('STEP_CONTEXT')+2500]
check('All 7 steps have context strings',
      src.count("'intro'") >= 1 and src.count("'success'") >= 1 and
      all((f"'{i}':" in _ctx_block or f'{i}:' in _ctx_block) for i in range(1, 8)))
check('currentStep injected into system prompt',         'state.currentStep' in src)
check('fasal injected into system prompt',               'state.fasal' in src)
check('jenis_keahlian injected into system prompt',      'state.jenis_keahlian' in src)
check('businessType injected into system prompt',        'state.businessType' in src)
check('fasalInfo (fee data) injected when on step 1/6',  'fasalInfo' in src)
check('100-word answer limit enforced in prompt',        '100 patah perkataan' in src)
check('Markdown ban rule in prompt',                     'gunakan simbol markdown' in src)
check('PII/data disclosure LARANGAN KERAS rule',         'LARANGAN KERAS' in src)
check('Bilingual detection rule (EN/MS)',                'bahasa pengguna' in src)
check('Fasal types A/S/G/H listed in step 1 context',   'Ahli Biasa' in src and 'Ahli Bersekutu' in src)
check('Fee data in system prompt for step 6',
      'RM${chosen.daftar}' in src or "chosen.daftar" in src,
      note='Fee amounts injected dynamically from FASAL_DATA')
_bsp_start = src.find('function buildSystemPrompt(')
check('System prompt includes fasal numbers (6.2.1-6.2.6)',
      '6.2.1' in src[_bsp_start:_bsp_start+6000])

# ── F. FASAL GUIDE STATE MACHINE ─────────────────────────────────────────────
print('\n[ F ] FASAL GUIDE STATE MACHINE')
check("chatbotState initialized to 'idle'",       "chatbotState = 'idle'" in src)
check("fasal-guide state used",                   "chatbotState = 'fasal-guide'" in src)
check("fasal-guide-structure state used",         "chatbotState = 'fasal-guide-structure'" in src)
check("State checked BEFORE Groq in sendChatMessage",
      src.index("chatbotState === 'fasal-guide'") < src.index('isKeyConfigured(GROQ_KEY)'))
check("clearChat() resets chatbotState to 'idle'","chatbotState = 'idle'" in src and 'clearChat' in src)
check('Fasal guide covers: Pemunya Tunggal',       'tunggal' in src.lower())
check('Fasal guide covers: Perkongsian',           'perkongsian' in src.lower())
check('Fasal guide covers: Sdn Bhd / Syarikat',   'sdn bhd' in src.lower())
check('Fasal guide covers: Koperasi',              'koperasi' in src.lower())
check('Fasal guide covers: Profesional',           'profesional' in src.lower())
check('Fasal guide covers: Persatuan / NGO',       'persatuan' in src.lower())
check('Fasal guide has unrecognised-input fallback', 'Sila nyatakan jenis perniagaan' in src)
check("chatbotState reset to 'idle' after guide",  src.count("chatbotState = 'idle'") >= 2)
check("State NOT reset on chatbot open if guide active",
      "chatbotState === 'idle'" in src and
      "showStepGreeting" in src,
      note="toggleChatbot only calls showStepGreeting when state is idle — correct")

# ── G. INPUT SCREENING (PII PROTECTION) ──────────────────────────────────────
print('\n[ G ] INPUT SCREENING / PII PROTECTION')
check('screenUserInput() function exists',         'function screenUserInput(' in src)
check('Blocks: "senarai ahli"',                    'senarai ahli' in src)
check('Blocks: "data ahli"',                       'data ahli' in src)
check('Blocks: "kata laluan" / "password"',        'kata laluan' in src and 'password' in src)
check('Blocks: "admin login" / "admin access"',    'admin login' in src)
check('Blocks: "database"',                        'database' in src)
check('Returns Malay+English bilingual block msg', "I\\'m sorry" in src or "I'm sorry" in src or 'can\'t help' in src or "can\\'t help" in src)
check('Blocks: "list member" / "all member"',      'list member' in src and 'all member' in src)
check('Blocks: "semua member" / "cari ahli" / "check member"',
      'semua member' in src and 'cari ahli' in src and 'check member' in src)
check('Blocks: "nombor ic" / "ic number" extraction attempts',
      'nombor ic' in src and 'ic number' in src)

# ── H. SCRIPTED FAQ COVERAGE ─────────────────────────────────────────────────
print('\n[ H ] SCRIPTED FAQ COVERAGE')
faq_topics = ['modal berbayar', 'modal pusingan', 'yuran', 'dokumen', 'proksi', 'ssm',
              'ic', 'gambar', 'fasal', 'ahli biasa', 'ahli bersekutu', 'permohonan',
              'rujukan', 'tahunan', 'syarikat', 'pemegang saham', 'isi pintar',
              'alamat', 'emel', 'telefon', 'berapa lama', 'hubungi', 'koperasi']
for topic in faq_topics:
    check(f'FAQ covers: {topic}', topic in src)
check('FAQ default fallback reply exists',         'saya tidak pasti jawapan' in src)
check('Bilingual default fallback',                "not sure about that" in src)
check('Missing FAQ: "tempoh" / "berapa hari" approval timeline',
      'berapa hari' not in src,
      note='"berapa lama" covered but "berapa hari proses" not explicit', warn=True)
check('FAQ covers: "selepas hantar" post-submit flow',
      'selepas hantar' in src)
check('FAQ covers: "akuan berkanun" / statutory declaration',
      'akuan berkanun' in src)

# ── I. UX BUGS ───────────────────────────────────────────────────────────────
print('\n[ I ] UX BUGS')

# Bug 1: addContactChip called even on successful Groq response
contact_chip_on_success = bool(re.search(
    r'addBotMessage\(reply\)[\s\S]{0,50}addContactChip\(\)',
    src
))
check('BUG: addContactChip() called on EVERY Groq success reply',
      not contact_chip_on_success,
      note='Remove addContactChip() from success path — only show on error/fallback')

# Bug 2: scripted FAQ path pushes user msg AFTER bot reply
scripted_order = bool(re.search(
    r"showScriptedFAQ\(text\);\s*_chat\.history\.push\(\{ role: 'user'",
    src
))
check('BUG: Scripted FAQ path pushes user msg AFTER bot reply (wrong history order)',
      not scripted_order,
      note='In else branch: push user msg BEFORE generating bot reply')

# Bug 3: history pruning present in scripted FAQ (else) path
_faq_pos = src.rfind('showScriptedFAQ(text)')
_after_faq = src[_faq_pos:_faq_pos+350] if _faq_pos != -1 else ''
check('History pruning present in scripted FAQ fallback path',
      '_chat.history.length' in _after_faq and 'maxHistory' in _after_faq,
      note='History can grow unbounded when GROQ_KEY is not configured')

# Bug 4: no dumb-mode notice for user
dumb_notice = 'GROQ_KEY' in src and ('mod asas' in src.lower() or 'tanpa ai' in src.lower() or 'AI tidak tersedia' in src)
check('No visible notice when Groq key is missing (silent fallback)',
      dumb_notice,
      note='User gets scripted FAQ with no indication AI is offline')

# Bug 5: chatbot opens to empty state if history exists but step changes
check('Greeting respects chatbotState === idle guard',
      "chatbotState === 'idle'" in src,
      note='Correct — greeting only shown if idle and messages empty')

# ── J. SECURITY ──────────────────────────────────────────────────────────────
print('\n[ J ] SECURITY')
check('Content-Security-Policy meta tag present',  'Content-Security-Policy' in src)
check("CSP default-src 'self'",                    "default-src 'self'" in src)
check("CSP script-src includes CDN sources",       'cdn.jsdelivr.net' in src)
check('CSP connect-src includes Supabase',         'lzoloupwtqmjyupvofhh.supabase.co' in src)
check('CSP connect-src includes Groq',             'https://api.groq.com' in src)
check("CSP frame-src 'none'",                      "frame-src 'none'" in src)
check("CSP object-src 'none'",                     "object-src 'none'" in src)
check('No real Groq key hardcoded (gsk_ pattern)',
      not bool(re.search(r'gsk_[A-Za-z0-9]{40,}', src)))
check('No service role key hardcoded (supabase)',
      'service_role' not in src)
check('SUPABASE_KEY comment warns against service role key',
      'JANGAN gantikan dengan service role key' in src)
check('isKeyConfigured() gates Supabase client creation',
      'isKeyConfigured(SUPABASE_KEY)' in src)
check('LARANGAN KERAS rule in system prompt prevents data leakage',
      'LARANGAN KERAS' in src)

# ── K. SESSION / DRAFT PERSISTENCE ───────────────────────────────────────────
print('\n[ K ] SESSION & DRAFT PERSISTENCE')
check('Chat history saved to sessionStorage',
      "sessionStorage.setItem('dpmm_chat_history'" in src)
check('Chat history restored from sessionStorage on open',
      "sessionStorage.getItem('dpmm_chat_history')" in src)
check('clearChat() clears sessionStorage',
      "sessionStorage.removeItem('dpmm_chat_history')" in src)
check('Form draft saved to localStorage (STORAGE_KEY)',  'STORAGE_KEY' in src)
check('saveDraft() on input event (auto-save)',          'saveDraft' in src and 'addEventListener' in src)
check('Resume draft modal shown on page load',          'showResumePrompt' in src)
check('clearDraft() on new form start',                 'clearDraft()' in src)
check('Draft timestamp stored',                         'timestamp: Date.now()' in src)

# ── L. SUMMARY ───────────────────────────────────────────────────────────────
print('\n' + '\u2501'*44)
for r in results:
    print(r)

total  = len(results)
passed = sum(1 for r in results if '\u2705' in r)
warned = sum(1 for r in results if '\u26a0' in r)
failed = sum(1 for r in results if '\u274c' in r)

print(f'\n\u2501'*44)
print(f' Total: {total}  |  \u2705 Pass: {passed}  |  \u26a0\ufe0f  Warn: {warned}  |  \u274c Fail: {failed}')
print('\u2501'*44 + '\n')

if failures:
    print('CRITICAL FAILURES TO FIX:')
    for f in failures:
        print(f'  \u2192 {f}')
    sys.exit(1)
else:
    print('No critical failures.')
    sys.exit(0)
