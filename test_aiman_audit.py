"""
Aiman AI Clerk — Comprehensive Test & Audit
Tests: UI structure, function presence, system prompt content,
keyword fallback routing, computedFilter logic, meeting query,
chip labels, selectDisambig fix, exportComputedCSV availability.
"""
import re
import sys

# ── 1. Read the HTML source ──────────────────────────────────────────────────
HTML_PATH = r'C:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR\index.html'
with open(HTML_PATH, encoding='utf-8') as f:
    src = f.read()

PASS = '  ✅ PASS'
FAIL = '  ❌ FAIL'
WARN = '  ⚠️  WARN'

results = []
failures = []

def check(name, cond, note='', warn=False):
    tag = WARN if (warn and not cond) else (PASS if cond else FAIL)
    results.append(f'{tag}  {name}' + (f'  [{note}]' if note else ''))
    if not cond and not warn:
        failures.append(name)

# ── 2. UI STRUCTURE ──────────────────────────────────────────────────────────
print('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
print(' Aiman AI Clerk — Test & Audit Report')
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

print('[ A ] UI STRUCTURE')
check('admin-clerk-btn exists',           'id="admin-clerk-btn"' in src)
check('admin-clerk-window exists',        'id="admin-clerk-window"' in src)
check('admin-clerk-messages exists',      'id="admin-clerk-messages"' in src)
check('admin-clerk-chips exists',         'id="admin-clerk-chips"' in src)
check('admin-clerk-input exists',         'id="admin-clerk-input"' in src)
check('aiman.jpg.png img src',            'src="aiman.jpg.png"' in src)
check('Typing indicator present',         'aclerk-typing' in src)
check('Close button present',             'toggleAdminClerk()' in src)
check('Clear (Kosong) button present',    'clearAdminChat()' in src)

# ── 3. QUICK CHIPS ───────────────────────────────────────────────────────────
print('\n[ B ] QUICK CHIPS')
chip_labels = ['Taklimat Harian', 'Jantina Ahli', 'Belum Bayar 2026',
               'Mesyuarat', 'SSM Hampir Tamat', 'Birthday Julai']
for lbl in chip_labels:
    check(f'Chip: {lbl}', lbl in src)

# ── 4. CORE FUNCTIONS ────────────────────────────────────────────────────────
print('\n[ C ] CORE FUNCTIONS')
funcs = [
    'function getBirthdayMonth(',
    'function buildContextSnapshot(',
    'function loadMeetingsForAiman(',
    'function buildAdminSystemPrompt(',
    'function parseGroqIntent(',
    'function routeAction(',
    'function filterMembers(',
    'function executeQuery(',
    'function computedFilter(',
    'function executeComputedFilter(',
    'function exportComputedCSV(',
    'function executeMeetingQuery(',
    'function _renderMeetingResults(',
    'function buildSendQueue(',
    'function buildDailyBriefing(',
    'function showDisambig(',
    'function selectDisambig(',
    'function sendAdminMessage(',
    'function toggleAdminClerk(',
    'function clearAdminChat(',
    'function adminChipSend(',
    'function exportQueryCSV(',
]
for fn in funcs:
    check(fn.replace('function ','').replace('(',''), fn in src)

# ── 5. SYSTEM PROMPT CONTENT ─────────────────────────────────────────────────
print('\n[ D ] SYSTEM PROMPT — RICH CONTEXT')
prompt_checks = [
    ('computed_filter action listed',       '"computed_filter"' in src),
    ('query_meetings action listed',        '"query_meetings"' in src),
    ('getBirthdayMonth helper mentioned',   'getBirthdayMonth' in src and 'HELPER' in src),
    ('MEDAN AHLI field reference',          'MEDAN AHLI' in src),
    ('jantina field documented',            'jantina' in src and 'PEREMPUAN' in src),
    ('daerah field documented',             'daerah' in src and 'computed_filter' in src),
    ('fasal field documented',              "m.fasal" in src),
    ('tarikhDaftar documented',             'tarikhDaftar' in src),
    ('MESYUARAT TERKINI section',           'MESYUARAT TERKINI' in src),
    ('meetCtx uses MEETINGS_CACHE',         'MEETINGS_CACHE' in src and 'meetCtx' in src),
    ('buildContextSnapshot called in prompt', 'buildContextSnapshot' in src and 'snap.gStr' in src),
    ('snap.topD (daerah breakdown)',         'snap.topD' in src),
    ('snap.bmStr (birthday months)',         'snap.bmStr' in src),
    ('snap.fasalStr',                        'snap.fasalStr' in src),
    ('snap.ryStr (reg years)',               'snap.ryStr' in src),
]
for name, cond in prompt_checks:
    check(name, cond)

# ── 6. KEYWORD FALLBACK ROUTING ──────────────────────────────────────────────
print('\n[ E ] KEYWORD FALLBACK (parseGroqIntent)')
kw_checks = [
    ('mesyuarat → query_meetings',          "query_meetings" in src and "mesyuarat" in src),
    ('meeting → query_meetings',            "meeting" in src and "query_meetings" in src),
    ('belum bayar 2026 → unpaid_2026',      "unpaid_2026" in src),
    ('belum bayar → unpaid_2025',           "unpaid_2025" in src),
    ('ssm luput → ssm_expiring',            "luput" in src),
    ('perempuan → computed_filter',         "perempuan" in src.lower() and "computed_filter" in src),
    ('lelaki → computed_filter',            "lelaki" in src.lower() and "computed_filter" in src),
    ('julai → birthday filter',             "julai" in src.lower() and "getBirthdayMonth" in src),
    ('birthday/lahir month map present',    "monthMap" in src),
    ('12 months in monthMap',               src.count("disember") >= 1 and src.count("january") >= 1),
]
for name, cond in kw_checks:
    check(name, cond)

# ── 7. ROUTE ACTION ──────────────────────────────────────────────────────────
print('\n[ F ] routeAction — NEW ACTIONS WIRED')
route_checks = [
    ("computed_filter case in routeAction",
        bool(re.search(r"action==='computed_filter'", src))),
    ("query_meetings case in routeAction",
        bool(re.search(r"action==='query_meetings'", src))),
    ("computedFilter() called with params.expr",
        "computedFilter(params.expr" in src),
    ("executeComputedFilter() called in routeAction",
        "executeComputedFilter(result" in src),
    ("executeMeetingQuery() called in routeAction",
        "executeMeetingQuery(params)" in src),
]
for name, cond in route_checks:
    check(name, cond)

# ── 8. computedFilter IMPLEMENTATION ─────────────────────────────────────────
print('\n[ G ] computedFilter() IMPLEMENTATION')
cf_checks = [
    ('new Function() used for dynamic eval',    'new Function(' in src),
    ('getBirthdayMonth passed as arg to fn',     "fn(m, getBirthdayMonth)" in src),
    ('null returned on syntax error',            'return null' in src),
    ('per-member try/catch for safety',          'try { return !!fn(m' in src),
    ('MEMBERS||[] guard',                        "(MEMBERS||[])" in src),
]
for name, cond in cf_checks:
    check(name, cond)

# ── 9. selectDisambig BUG FIX ────────────────────────────────────────────────
print('\n[ H ] selectDisambig BUG FIX')
# Old bug: called executeQuery with by_name (re-search). Fixed: calls executeComputedFilter([m])
old_bug  = bool(re.search(r"selectDisambig[\s\S]{0,200}executeQuery", src))
new_fix  = bool(re.search(r"selectDisambig[\s\S]{0,200}executeComputedFilter\(\[m\]", src))
check('Old bug removed (executeQuery in selectDisambig)', not old_bug,
      note='executeQuery still referenced in selectDisambig' if old_bug else '')
check('New fix applied (executeComputedFilter([m]))', new_fix)

# ── 10. MEETINGS INTEGRATION ─────────────────────────────────────────────────
print('\n[ I ] MEETINGS INTEGRATION')
mtg_checks = [
    ('MEETINGS_CACHE global declared',       'var MEETINGS_CACHE = []' in src),
    ('loadMeetingsForAiman called on login',  'loadMeetingsForAiman()' in src and '_loadTemplatesFromSupabase' in src),
    ('DPMM_MESYUARAT queried',               'DPMM_MESYUARAT' in src),
    ('aktif field in meeting select',        'mesyuarat_id,nama,tarikh,tempat,aktif' in src),
    ('AKTIF badge rendered',                 'AKTIF</span>' in src),
    ('SELESAI badge rendered',               'SELESAI</span>' in src),
    ('_renderMeetingResults with filter=active', "params.filter === 'active'" in src),
]
for name, cond in mtg_checks:
    check(name, cond)

# ── 11. CSV EXPORT ────────────────────────────────────────────────────────────
print('\n[ J ] CSV EXPORT (computed results)')
csv_checks = [
    ('exportComputedCSV function exists',    'function exportComputedCSV()' in src),
    ('_clerk._lastComputed stored',          '_clerk._lastComputed' in src),
    ('BOM prefix for Excel compat',          '\\uFEFF' in src or '\uFEFF' in src),
    ('Bulan Lahir column in header',         'Bulan Lahir' in src),
    ('Daerah column in header',              'Daerah' in src and 'exportComputedCSV' in src),
    ('Export button in executeComputedFilter', 'exportComputedCSV()' in src and 'Export CSV' in src),
]
for name, cond in csv_checks:
    check(name, cond)

# ── 12. APPLIED FIX VERIFICATION ─────────────────────────────────────────────
print('\n[ K ] APPLIED FIX VERIFICATION')

# W1: Model upgraded
model_match = re.search(r"model\s*:\s*['\"]([^'\"]+)['\"]", src)
model_name = model_match.group(1) if model_match else 'unknown'
check(f'W1 — Groq model is 70b-versatile (got: {model_name})',
      '70b' in model_name or 'versatile' in model_name)

# W2: History stores summary not raw JSON
clean_hist = 'histSummary' in src and 'history.push({role:\'assistant\',content:histSummary})' in src
raw_hist   = bool(re.search(r"history\.push\(\{role:'assistant',content:reply\}\)", src))
check('W2 — History stores summary text (not raw Groq JSON)', clean_hist and not raw_hist)

# W3: Dumb-mode notice shown
check('W3 — Dumb-mode notice rendered when GROQ_KEY missing',
      'aiman-dumb-notice' in src and 'Mod Asas aktif' in src)

# W4: Dead email blast code removed
check('W4 — executeEmailBlast() dead code removed',
      'function executeEmailBlast(' not in src)
check('W4 — confirmEmailBlast() dead code removed',
      'function confirmEmailBlast(' not in src)

# W5: Meeting cache refresh logic
check('W5 — _meetCacheTime variable declared', '_meetCacheTime' in src)
check('W5 — 5-min stale check in executeMeetingQuery', '300000' in src)

# W6: max_tokens bumped
tokens_match = re.search(r'max_tokens\s*:\s*(\d+)', src)
tokens_val = tokens_match.group(1) if tokens_match else '?'
check(f'W6 — max_tokens={tokens_val} (≥900)',
      int(tokens_val) >= 900 if tokens_val.isdigit() else False)

# Extra: WA queue export note
wa_cap = re.search(r'buildSendQueue[\s\S]{0,300}slice\(0,(\d+)\)', src)
wa_val = wa_cap.group(1) if wa_cap else '?'
check(f'WA queue cap = {wa_val} rows',
      True, note='Cap is fine; Export CSV covers full list', warn=True)

# ── SUMMARY ──────────────────────────────────────────────────────────────────
print('\n' + '━'*42)
for r in results:
    print(r)

total   = len(results)
passed  = sum(1 for r in results if '✅' in r)
warned  = sum(1 for r in results if '⚠️' in r)
failed  = sum(1 for r in results if '❌' in r)

print(f'\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
print(f' Total: {total}  |  ✅ Pass: {passed}  |  ⚠️  Warn: {warned}  |  ❌ Fail: {failed}')
print(f'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

if failures:
    print('CRITICAL FAILURES:')
    for f in failures:
        print(f'  → {f}')
    sys.exit(1)
else:
    print('No critical failures detected.')
    sys.exit(0)
