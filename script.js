/* ════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════ */
const NAV_LABELS = {
  'home':       'Home',
  'build-str':  'String Builder',
  'build-num':  'Number Builder',
  'build-bool': 'Boolean Builder',
  'checker':    'Expression Checker',
  'reference':  'Reference Guide',
};

function toggleNav(){
  const panel  = document.getElementById('nav-panel');
  const toggle = document.getElementById('nav-toggle');
  const open   = panel.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
}
function closeNav(){
  const panel  = document.getElementById('nav-panel');
  const toggle = document.getElementById('nav-toggle');
  if(!panel) return;
  panel.classList.remove('open');
  toggle.setAttribute('aria-expanded','false');
}
document.addEventListener('click', function(e){
  const bar = document.getElementById('top-bar-nav');
  if(bar && !bar.contains(e.target)) closeNav();
});

function showSection(id){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('section-' + id);
  if(target) target.classList.add('active');
  // Update dropdown label
  const lbl = document.getElementById('nav-current-label');
  if(lbl) lbl.textContent = NAV_LABELS[id] || id;
  // Update active state in dropdown items
  document.querySelectorAll('.nav-item[data-sec]').forEach(b => {
    b.classList.toggle('active', b.dataset.sec === id);
  });
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ════════════════════════════════════════════════
   SMART PATH ENGINE
════════════════════════════════════════════════ */
const PATH_RULES = [
  {
    section: 'build-str', label: 'String Builder', icon: '\u{1F4CB}',
    desc: 'Combine, format, and manipulate text values',
    keywords: /concat|join|combin|string|text|format|name|label|append|prefix|suffix|trim|replac|upper|lower|contain|start.?with|end.?with|length|substr|split|character|letter|word|message|display|greeting|sentence/i
  },
  {
    section: 'build-num', label: 'Number Builder', icon: '\u{1F522}',
    desc: 'Perform calculations and numeric conversions',
    keywords: /number|integer|count|math|add|subtract|multipl|divid|calculat|sum|total|round|floor|ceil|pars|convert|numeric|digit|decimal|percent|duration|second|minute|hour|age/i
  },
  {
    section: 'build-bool', label: 'Boolean Builder', icon: '\u2705',
    desc: 'Build conditions, comparisons, and logical checks',
    keywords: /true|false|condition|check|valid|equal|compar|match|contain|not |and |or |toggle|flag|boolean|is empty|is null|if |whether|exist|blank|yes.?no|either/i
  },
  {
    section: 'checker', label: 'Expression Checker', icon: '\u{1F50D}',
    desc: 'Validate and debug your expressions',
    keywords: /check|validat|test|debug|error|wrong|not work|fix|syntax|broken|issue|problem|help me|fail|incorrect/i
  },

  {
    section: 'reference', label: 'Reference Guide', icon: '\u{1F4DA}',
    desc: 'Browse all expression functions and operators',
    keywords: /reference|docs|documentation|list all|all function|operator|syntax|what is|how do|available|complete list|cheat sheet/i
  },

];

function suggestPath(){
  const input = (document.getElementById('home-input').value || '').trim();
  const box   = document.getElementById('home-suggestions');
  if(!input){ box.innerHTML = ''; return; }

  const matches = PATH_RULES.filter(r => r.keywords.test(input));

  if(!matches.length){
    box.innerHTML = `
      <div class="home-no-match">
        <strong>Not sure which tool fits — here are a few good starting points:</strong>
        <div class="home-suggest-row" style="margin-top:12px">
          <button class="home-suggest-card" onclick="showSection('reference')">Reference Guide</button>
          <button class="home-suggest-card" onclick="showSection('checker')">Expression Checker</button>
          <button class="home-suggest-card" onclick="showSection('build-str')">String Builder</button>
        </div>
      </div>`;
    return;
  }

  const cards = matches.map(m => `
    <div class="home-match-card">
      <div class="home-match-top">
        <div>
          <div class="home-match-name">${m.label}</div>
          <div class="home-match-desc">${m.desc}</div>
        </div>
      </div>
      <button class="home-match-btn" onclick="showSection('${m.section}')">Open ${m.label} &rarr;</button>
    </div>`).join('');

  box.innerHTML = `
    <div class="home-suggest-hd">Suggested for you</div>
    <div class="home-match-grid">${cards}</div>`;
}

/* ════════════════════════════════════════════════
   SHARED UTILITIES
════════════════════════════════════════════════ */
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2500);
}
function cpExpr(boxId){
  const txt=document.getElementById(boxId).textContent;
  const skip=['Fill in','Pick an','Push is','Set Variable','List positions','no expression'];
  if(txt&&!skip.some(s=>txt.includes(s))){
    if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>showToast('Copied to clipboard!')).catch(()=>fbCp(txt));}
    else fbCp(txt);
  }
}
function fbCp(txt){
  const ta=document.createElement('textarea');ta.value=txt;
  document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy');showToast('Copied!');}catch(e){}
  document.body.removeChild(ta);
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function renderBD(parts,elId){
  const el=document.getElementById(elId);
  if(!parts||!parts.length){el.innerHTML='<span class="bdempty">Complete the fields above to see a full plain-English breakdown.</span>';return;}
  const cm={cf:'cf',cv:'cv',cs:'cs',co:'co',cn:'cn',cp:'cp'};
  let h=`<table class="bdt"><thead><tr><th>Part of the expression</th><th>What it means in plain English</th></tr></thead><tbody>`;
  parts.forEach(p=>{if(p.s)h+=`<tr><td class="${cm[p.t]||''}">${esc(p.s)}</td><td>${p.d}</td></tr>`;});
  el.innerHTML=h+'</tbody></table>';
}

/* ════════════════════════════════════════════════
   TRAINING MISSIONS
════════════════════════════════════════════════ */
/* Challenge types:
   'write' - free text, validated by fn(). Has canonical ans string for Show Answer.
   'mc'    - multiple choice. opts[] = {v,l}, correct = the v value.
   'fill'  - fill in the blank. tpl has ___ placeholders; blanks[] = array of acceptable strings per blank.
   'bug'   - find the bug in a given code snippet. opts[] + correct. code = buggy expression shown.
   'output'- predict the output of an expression. code + opts + correct.
*/
/* Challenge types:
   'write' - free text, validated by fn(). Has canonical ans string for Show Answer.
   'mc'    - multiple choice. opts[] = {v,l}, correct = the v value.
   'fill'  - fill in the blank. tpl has ___ placeholders; blanks[] = array of acceptable strings per blank.
   'bug'   - find the bug in a given code snippet. opts[] + correct. code = buggy expression shown.
   'output'- predict the output of an expression. code + opts + correct.
*/
/* Challenge types:
   'write' - free text, validated by fn(). Has canonical ans string for Show Answer.
   'mc'    - multiple choice. opts[] = {v,l}, correct = the v value.
   'fill'  - fill in the blank. tpl has ___ placeholders; blanks[] = array of acceptable strings per blank.
   'bug'   - find the bug in a given code snippet. opts[] + correct. code = buggy expression shown.
   'output'- predict the output of an expression. code + opts + correct.
*/
const TIERS=[
  {id:1,lbl:'Tier 1',nm:'Rookie',bc:'b1',xp:0,challenges:[
    {id:'t1c1',type:'write',pts:10,q:'Write an example expression that references a variable named <code>MyVar</code> using the correct Genesys Cloud wrapping syntax.',hint:'Variable references are wrapped in double curly braces.',fn:a=>a.replace(/\s/g,'')==='{{MyVar}}',ans:'{{MyVar}}',ex:'Variables use <code>{{VariableName}}</code>. The script engine substitutes the live value at runtime. Single braces will be treated as literal text.'},
    {id:'t1c2',type:'mc',pts:10,q:"Which expression correctly displays the logged-in agent's name?",opts:[
      {v:'a',l:'<code>{{Agent.Name}}</code>'},
      {v:'b',l:'<code>{{Scripter.Agent Name}}</code>'},
      {v:'c',l:'<code>{{Scripter.AgentName}}</code>'},
      {v:'d',l:'<code>{Scripter.Agent Name}</code>'}
    ],correct:'b',hint:"The prefix is 'Scripter' and there is a space between 'Agent' and 'Name'.",ans:'{{Scripter.Agent Name}}',ex:"<code>{{Scripter.Agent Name}}</code> — read-only, auto-populated with the agent's display name. Note the space in 'Agent Name' and the double curly braces."},
    {id:'t1c3',type:'write',pts:10,q:"What variable gives you the unique conversation ID (same as the Genesys Cloud API's conversationId)?",hint:"It's under the Scripter prefix, called 'Interaction Id'.",fn:a=>a.trim()==='{{Scripter.Interaction Id}}',ans:'{{Scripter.Interaction Id}}',ex:'<code>{{Scripter.Interaction Id}}</code> is identical to conversationId in the REST API.'},
    {id:'t1c4',type:'fill',pts:15,q:'Fill in the blanks to combine <code>{{FirstName}}</code> and <code>{{LastName}}</code> with a space between them.',tpl:'___({{FirstName}}, ___, {{LastName}})',blanks:[['concat'],['" "',"' '"]],hint:'The function is concat() and a space literal is wrapped in double quotes.',ans:'concat({{FirstName}}, " ", {{LastName}})',ex:'<code>concat({{FirstName}}, " ", {{LastName}})</code> joins the values with a literal space between them.'},
    {id:'t1c5',type:'write',pts:15,q:"Write an expression to convert the variable 'Status' to all uppercase letters.",hint:'There is a built-in function called upper() that takes a string argument.',fn:a=>a.replace(/\s/g,'')==='upper({{Status}})',ans:'upper({{Status}})',ex:"<code>upper({{Status}})</code> returns Status in UPPERCASE. The counterpart is <code>lower()</code>."},
    {id:'t1c6',type:'bug',pts:15,q:'Spot the bug in this expression intended to display the agent name:',code:'{Scripter.Agent Name}',opts:[
      {v:'a',l:'The word "Scripter" is misspelled'},
      {v:'b',l:'Single curly braces — should be doubled: <code>{{Scripter.Agent Name}}</code>'},
      {v:'c',l:'Missing quotes around the variable name'},
      {v:'d',l:'"Agent Name" needs an underscore, not a space'}
    ],correct:'b',hint:'Every variable reference in a Genesys script expression uses double curly braces.',ans:'{{Scripter.Agent Name}}',ex:'Genesys Cloud script variables require <strong>double</strong> curly braces: <code>{{Scripter.Agent Name}}</code>. Single braces are treated as literal text and the variable will not be substituted.'},
  ]},
  {id:2,lbl:'Tier 2',nm:'Associate',bc:'b2',xp:50,challenges:[
    {id:'t2c1',type:'write',pts:20,q:"Use ifElse() to return 'VIP' when 'CustomerTier' equals 'Gold', otherwise 'Standard'.",hint:'ifElse(condition, valueIfTrue, valueIfFalse). Use equal() for the comparison.',fn:a=>a.includes('ifElse')&&a.includes('equal')&&a.includes('{{CustomerTier}}')&&a.includes('Gold')&&a.includes('VIP')&&a.includes('Standard'),ans:'ifElse(equal({{CustomerTier}}, "Gold"), "VIP", "Standard")',ex:'<code>ifElse(equal({{CustomerTier}},"Gold"),"VIP","Standard")</code>'},
    {id:'t2c2',type:'output',pts:20,q:'If <code>{{PhoneNumber}} = "9045551234"</code>, what does this expression return?',code:'substring({{PhoneNumber}}, 0, 3)',opts:[
      {v:'a',l:'<code>"904"</code>'},
      {v:'b',l:'<code>"9045"</code>'},
      {v:'c',l:'<code>"045"</code>'},
      {v:'d',l:'<code>"9045551234"</code>'}
    ],correct:'a',hint:'substring(str, start, end) — start is 0-based, end position is NOT included (exclusive).',ans:'"904"',ex:'<code>substring(str, 0, 3)</code> returns the characters at positions 0, 1, and 2 — the end position is exclusive. So it returns <code>"904"</code>, the area code.'},
    {id:'t2c3',type:'write',pts:20,q:"Write a Dynamic Number expression that adds 'CallCount' and 'TransferCount'.",hint:'Use the + operator directly between two {{variables}}.',fn:a=>a.includes('{{CallCount}}')&&a.includes('+')&&a.includes('{{TransferCount}}'),ans:'{{CallCount}} + {{TransferCount}}',ex:'<code>{{CallCount}} + {{TransferCount}}</code> — standard arithmetic in Genesys Cloud number expressions.'},
    {id:'t2c4',type:'write',pts:25,q:"Remove all dashes from a phone number in 'RawPhone' using replace().",hint:'replace(string, findValue, replaceWith). To remove, replace with an empty string "".',fn:a=>a.includes('replace')&&a.includes('{{RawPhone}}')&&a.includes('"-"')&&a.includes('""'),ans:'replace({{RawPhone}}, "-", "")',ex:'<code>replace({{RawPhone}},"-","")</code> replaces every dash with nothing — effectively deleting it.'},
    {id:'t2c5',type:'mc',pts:25,q:'Which expression correctly builds an outbound greeting like "Mr. John Smith" using Salutation, FirstName, and LastName?',opts:[
      {v:'a',l:'<code>{{Outbound.Salutation}} + {{Outbound.FirstName}} + {{Outbound.LastName}}</code>'},
      {v:'b',l:'<code>concat({{Outbound.Salutation}}, {{Outbound.FirstName}}, {{Outbound.LastName}})</code>'},
      {v:'c',l:'<code>concat({{Outbound.Salutation}}, " ", {{Outbound.FirstName}}, " ", {{Outbound.LastName}})</code>'},
      {v:'d',l:'<code>concat("Outbound.Salutation Outbound.FirstName Outbound.LastName")</code>'}
    ],correct:'c',hint:'You need concat() AND explicit space separators between the pieces — otherwise the names smash together.',ans:'concat({{Outbound.Salutation}}, " ", {{Outbound.FirstName}}, " ", {{Outbound.LastName}})',ex:'Option B would produce "Mr.JohnSmith" with no spaces. Only option C inserts literal space separators between the values.'},
  ]},
  {id:3,lbl:'Tier 3',nm:'Practitioner',bc:'b3',xp:150,challenges:[
    {id:'t3c1',type:'fill',pts:30,q:'Fill in the blank to format the customer call start time as MM/dd/yyyy. Hint: the Raw variant is already a number in milliseconds, so it can be passed directly to formatDate() with no wrapper.',tpl:'formatDate({{Scripter.Raw Customer Call Start Time}}, "___")',blanks:[['MM/dd/yyyy']],hint:'The format string uses MM for month, dd for day, yyyy for year. Example: "MM/dd/yyyy" produces 01/15/2025.',ans:'formatDate({{Scripter.Raw Customer Call Start Time}}, "MM/dd/yyyy")',ex:'<code>formatDate({{Scripter.Raw Customer Call Start Time}}, "MM/dd/yyyy")</code> — the <strong>Raw</strong> variant of a date variable is already a number in milliseconds, so it can be passed directly to formatDate() with no <code>dateToMilliseconds()</code> wrapper. The non-Raw variants are locale-formatted strings that DO need the wrapper.'},
    {id:'t3c2',type:'write',pts:30,q:'Show a countdown until the customer has been on the call for 5 minutes. Use durationToMilliseconds() and formatDuration().',hint:'5 min = 5 * 60 * 1000 ms. Subtract elapsed from 5 min, wrap in formatDuration().',fn:a=>a.includes('durationToMilliseconds')&&a.includes('Scripter.Customer Call Duration')&&(a.includes('5 * 60')||a.includes('300000')||a.includes('5*60')),ans:'formatDuration(5 * 60 * 1000 - durationToMilliseconds({{Scripter.Customer Call Duration}}))',ex:'<code>formatDuration(5 * 60 * 1000 - durationToMilliseconds({{Scripter.Customer Call Duration}}))</code> — this pattern comes directly from the official Genesys Cloud docs.'},
    {id:'t3c3',type:'write',pts:35,q:'Validate a US zip code using match(). Require exactly 5 digits anchored at start and end.',hint:'Anchored regex for exactly 5 digits: ^\\d{5}$',fn:a=>a.includes('match')&&a.includes('{{ZipCode}}')&&a.includes('\\d{5}')&&a.includes('^')&&a.includes('$'),ans:'match({{ZipCode}}, "^\\d{5}$")',ex:'<code>match({{ZipCode}},"^\\d{5}$")</code> — ^ anchors start, $ anchors end, \\d{5} = exactly 5 digits.'},
    {id:'t3c4',type:'bug',pts:35,q:'This expression is supposed to round RawScore to 2 decimal places. What is wrong with it?',code:'math.round({{RawScore}}, 2)',opts:[
      {v:'a',l:'The second argument should be 0.01 instead of 2'},
      {v:'b',l:'RawScore needs to be quoted as a string'},
      {v:'c',l:'Drop the <code>math.</code> prefix — Genesys Cloud functions are called without it'},
      {v:'d',l:'round() only takes one argument in Genesys Cloud'}
    ],correct:'c',hint:'One specific prefix should be dropped from function calls that use a math namespace.',ans:'round({{RawScore}}, 2)',ex:'<code>round({{RawScore}}, 2)</code> — Genesys Cloud functions like round() are called directly, without any <code>math.</code> prefix. This is a common mistake when copying examples from other documentation.'},
    {id:'t3c5',type:'write',pts:40,q:"Chain two conditions with AND: 'IsVIP' equals true AND 'AccountStatus' equals 'active'.",hint:'Use the AND keyword between two equal() calls. Genesys uses AND / OR / NOT keywords.',fn:a=>a.includes('IsVIP')&&a.includes('AND')&&a.includes('AccountStatus')&&a.includes('active'),ans:'equal({{IsVIP}}, true) AND equal({{AccountStatus}}, "active")',ex:'<code>equal({{IsVIP}},true) AND equal({{AccountStatus}},"active")</code> — Genesys Cloud uses the AND / OR / NOT keywords rather than &&, ||, !.'},
  ]},
  {id:4,lbl:'Tier 4',nm:'Expert',bc:'b4',xp:300,challenges:[
    {id:'t4c1',type:'write',pts:50,q:"Build using concat(): 'Hello [FirstName]! Your call ID is [Interaction Id].'",hint:'Mix literals (in quotes) with variables in one concat() call.',fn:a=>a.includes('concat')&&a.includes('{{FirstName}}')&&a.includes('Scripter.Interaction Id'),ans:'concat("Hello ", {{FirstName}}, "! Your call ID is ", {{Scripter.Interaction Id}}, ".")',ex:'<code>concat("Hello ",{{FirstName}},"! Your call ID is ",{{Scripter.Interaction Id}},".")</code>'},
    {id:'t4c2',type:'write',pts:50,q:"Nested ifElse: Score >= 90 → 'Gold', Score >= 70 → 'Silver', else 'Bronze'.",hint:'Nest a second ifElse() as the false-branch of the first.',fn:a=>(a.match(/ifElse/g)||[]).length>=2&&a.includes('{{Score}}')&&a.includes('Gold')&&a.includes('Silver')&&a.includes('Bronze'),ans:'ifElse({{Score}} >= 90, "Gold", ifElse({{Score}} >= 70, "Silver", "Bronze"))',ex:'<code>ifElse({{Score}}>=90,"Gold",ifElse({{Score}}>=70,"Silver","Bronze"))</code>'},
    {id:'t4c3',type:'output',pts:55,q:'If <code>{{Score}} = 75</code>, what does this expression return?',code:'ifElse({{Score}} >= 90, "Gold", ifElse({{Score}} >= 70, "Silver", "Bronze"))',opts:[
      {v:'a',l:'<code>"Gold"</code>'},
      {v:'b',l:'<code>"Silver"</code>'},
      {v:'c',l:'<code>"Bronze"</code>'},
      {v:'d',l:'An error — the conditions overlap'}
    ],correct:'b',hint:'Walk through it step by step. The outer ifElse checks >= 90 first. If that is false, the inner ifElse runs.',ans:'"Silver"',ex:'Since 75 is not >= 90, the outer ifElse() falls through to the inner one. 75 IS >= 70, so it returns <code>"Silver"</code>. Nested ifElse() evaluates top to bottom — order matters.'},
    {id:'t4c4',type:'fill',pts:55,q:'Fill in the blanks to add 5 minutes to the customer call start time and format it. Hint: the Raw variant is already in milliseconds, so you can do arithmetic on it directly.',tpl:'formatDate({{Scripter.Raw Customer Call Start Time}} + ___ * ___ * ___)',blanks:[['5'],['60'],['1000']],hint:'5 minutes → convert to milliseconds: 5 × 60 × 1000.',ans:'formatDate({{Scripter.Raw Customer Call Start Time}} + 5 * 60 * 1000)',ex:'<code>formatDate({{Scripter.Raw Customer Call Start Time}} + 5 * 60 * 1000)</code> — 5 × 60 × 1000 = 300000 ms. Because the Raw variant is already a number, you can add to it directly without any conversion wrapper.'},
    {id:'t4c5',type:'write',pts:60,q:"Check if 'PhoneNumber' is exactly 10 characters long using length() and equal().",hint:'equal(length(theVariable), 10)',fn:a=>a.includes('equal')&&a.includes('length')&&a.includes('{{PhoneNumber}}')&&a.includes('10'),ans:'equal(length({{PhoneNumber}}), 10)',ex:'<code>equal(length({{PhoneNumber}}),10)</code>'},
  ]},
  {id:5,lbl:'Tier 5',nm:'Architect',bc:'b5',xp:520,challenges:[
    {id:'t5c1',type:'write',pts:75,q:"Chain: trim whitespace from 'CustomerName', convert to uppercase, then prepend 'ACCOUNT: '.",hint:'concat("ACCOUNT: ", upper(trim({{CustomerName}})))',fn:a=>a.includes('concat')&&a.includes('upper')&&a.includes('trim')&&a.includes('CustomerName')&&a.includes('ACCOUNT'),ans:'concat("ACCOUNT: ", upper(trim({{CustomerName}})))',ex:'<code>concat("ACCOUNT: ",upper(trim({{CustomerName}})))</code> — innermost function runs first: trim → upper → concat.'},
    {id:'t5c2',type:'write',pts:75,q:"Full call summary: 'Call [Id] | Agent: [Name] | Type: [Type] | Duration: [formatted HH:MM:SS]'",hint:'Use concat() with Scripter built-ins and formatDuration(durationToMilliseconds(...)).',fn:a=>a.includes('Scripter.Interaction Id')&&a.includes('Scripter.Agent Name')&&a.includes('Scripter.Interaction Type')&&a.includes('formatDuration')&&a.includes('Scripter.Customer Call Duration'),ans:'concat("Call ", {{Scripter.Interaction Id}}, " | Agent: ", {{Scripter.Agent Name}}, " | Type: ", {{Scripter.Interaction Type}}, " | Duration: ", formatDuration(durationToMilliseconds({{Scripter.Customer Call Duration}})))',ex:'Complex concat with 4 built-in variables plus a nested duration function.'},
    {id:'t5c3',type:'write',pts:80,q:"Boolean: return true if Interaction Type is 'call' AND duration exceeds 300,000 ms.",hint:'equal() for the type check, > for duration, joined with AND. Use durationToMilliseconds().',fn:a=>a.includes('Scripter.Interaction Type')&&a.includes('call')&&a.includes('AND')&&a.includes('durationToMilliseconds')&&a.includes('Scripter.Customer Call Duration'),ans:'equal({{Scripter.Interaction Type}}, "call") AND durationToMilliseconds({{Scripter.Customer Call Duration}}) > 300000',ex:'Combine an equal() type check with a duration math comparison using AND.'},
    {id:'t5c4',type:'bug',pts:80,q:'This expression is supposed to validate an 8-character alphanumeric AccountNumber, but it has a bug:',code:'match({{AccountNumber}}, "[a-zA-Z0-9]{8}")',opts:[
      {v:'a',l:'Missing anchors — without <code>^</code> and <code>$</code> it matches any 8 alphanumeric chars inside a longer string'},
      {v:'b',l:'The character class should use <code>\\w</code> instead of <code>[a-zA-Z0-9]</code>'},
      {v:'c',l:'match() does not support regex in Genesys Cloud'},
      {v:'d',l:'The quantifier should be <code>*</code> instead of <code>{8}</code>'}
    ],correct:'a',hint:'Think about what happens if the user types a 20-character string that happens to contain 8 valid characters in a row.',ans:'match({{AccountNumber}}, "^[a-zA-Z0-9]{8}$")',ex:'Without <code>^</code> and <code>$</code> anchors, a 20-character string with any 8 valid chars in a row would pass. Anchors are critical for "exactly this length" checks. Correct: <code>match({{AccountNumber}}, "^[a-zA-Z0-9]{8}$")</code>'},
    {id:'t5c5',type:'write',pts:90,q:"Nested ifElse: 'Gold VIP' if IsVIP=true AND Score>=90, 'Silver VIP' if IsVIP=true AND Score>=70, else 'Standard'.",hint:'Outer ifElse checks Gold. Inner ifElse checks Silver. Use AND to combine conditions in each branch.',fn:a=>(a.match(/ifElse/g)||[]).length>=2&&a.includes('IsVIP')&&a.includes('Score')&&a.includes('Gold VIP')&&a.includes('Silver VIP')&&a.includes('Standard')&&a.includes('AND'),ans:'ifElse(equal({{IsVIP}}, true) AND {{Score}} >= 90, "Gold VIP", ifElse(equal({{IsVIP}}, true) AND {{Score}} >= 70, "Silver VIP", "Standard"))',ex:'Nested ifElse with compound AND conditions in each branch — the most complex training pattern.'},
  ]}
];
const RANKS=[{l:'Rookie',m:0},{l:'Associate',m:60},{l:'Practitioner',m:200},{l:'Expert',m:380},{l:'Architect',m:600}];
const MXP=700;
let TS={xp:0,streak:0,done:new Set(),wrong:{},hint:{},revealed:{},tier:1};
function rank(xp){let r=RANKS[0];for(const x of RANKS)if(xp>=x.m)r=x;return r.l;}
function upHUD(){
  document.getElementById('hxp').textContent=TS.xp;
  document.getElementById('hstr').textContent=TS.streak;
  document.getElementById('hdon').textContent=TS.done.size;
  document.getElementById('hrnk').textContent=rank(TS.xp);
  const p=Math.min(100,Math.round(TS.xp/MXP*100));
  document.getElementById('xpb').style.width=p+'%';
  document.getElementById('xpp').textContent=p+'%';
}
function rTierNav(){
  const nav=document.getElementById('tnav');if(!nav)return;nav.innerHTML='';
  TIERS.forEach(t=>{
    const ul=TS.xp>=t.xp;
    const b=document.createElement('button');
    b.className='tb'+(ul?' unlocked':'  locked')+(TS.tier===t.id&&ul?' act':'');
    b.textContent=t.lbl+' — '+t.nm+(ul?'':' 🔒');
    if(ul)b.onclick=()=>{TS.tier=t.id;rAll();};
    nav.appendChild(b);
  });
}
function rStrip(){
  const el=document.getElementById('pstrip');if(!el)return;el.innerHTML='';
  const t=TIERS.find(t=>t.id===TS.tier);if(!t)return;
  t.challenges.forEach((c,i)=>{
    const d=document.createElement('div');
    d.className='pd'+(TS.done.has(c.id)?' done':'');
    d.textContent=TS.done.has(c.id)?'✓':(i+1);
    el.appendChild(d);
  });
}
function rChallenges(){
  const area=document.getElementById('carea');if(!area)return;area.innerHTML='';
  const t=TIERS.find(t=>t.id===TS.tier);if(!t)return;
  t.challenges.forEach(c=>{
    const done=TS.done.has(c.id),revealed=TS.revealed&&TS.revealed[c.id],hv=!!TS.hint[c.id];
    const type=c.type||'write';
    const div=document.createElement('div');
    div.className='cc'+(done?' done':'')+(revealed?' revealed':'');div.id='c-'+c.id;
    const typeLabel={write:'Write',mc:'Multiple Choice',fill:'Fill in the Blanks',bug:'Find the Bug',output:'Predict the Output'}[type]||'Write';
    const typeColor={write:'btype',mc:'btype mc',fill:'btype fill',bug:'btype bug',output:'btype out'}[type]||'btype';
    let statusBadge='';
    if(done)statusBadge='<span class="badge bdone">&#10003; Completed</span>';
    else if(revealed)statusBadge='<span class="badge brev">&#128065; Revealed (0 XP)</span>';
    let body='';
    if(done||revealed){
      body=`<div class="fb ${done?'fbok':'fbrev'}"><strong>${done?'Correct!':'Answer revealed.'}</strong> ${c.ex}</div><div class="ansbox"><div class="ansl">&#128221; Canonical answer</div><div class="ansv"><code>${esc(c.ans||'(no canonical answer)')}</code></div></div>`;
    }else{
      if(type==='write'){
        body=`<div class="arow"><input class="ainp" id="i-${c.id}" placeholder="Type your Genesys Cloud expression here…" autocomplete="off" autocorrect="off" spellcheck="false"/><button class="bchk" onclick="chk('${c.id}')">Check &#9654;</button><button class="bhint" onclick="tHint('${c.id}')">Hint</button><button class="bshow" onclick="showAns('${c.id}')">&#128065; Show answer</button></div>`;
      }else if(type==='mc'){
        let optsH='<div class="mcopts">';
        c.opts.forEach(o=>{optsH+=`<label class="mco"><input type="radio" name="mc-${c.id}" value="${o.v}"><span>${o.l}</span></label>`;});
        optsH+='</div>';
        body=optsH+`<div class="arow arow2"><button class="bchk" onclick="chk('${c.id}')">Check &#9654;</button><button class="bhint" onclick="tHint('${c.id}')">Hint</button><button class="bshow" onclick="showAns('${c.id}')">&#128065; Show answer</button></div>`;
      }else if(type==='bug'||type==='output'){
        let optsH=`<div class="codeblk"><code>${esc(c.code)}</code></div><div class="mcopts">`;
        c.opts.forEach(o=>{optsH+=`<label class="mco"><input type="radio" name="mc-${c.id}" value="${o.v}"><span>${o.l}</span></label>`;});
        optsH+='</div>';
        body=optsH+`<div class="arow arow2"><button class="bchk" onclick="chk('${c.id}')">Check &#9654;</button><button class="bhint" onclick="tHint('${c.id}')">Hint</button><button class="bshow" onclick="showAns('${c.id}')">&#128065; Show answer</button></div>`;
      }else if(type==='fill'){
        // Build fill-in template with input boxes where ___ appears
        let fillH='<div class="fillbox">';
        const parts=c.tpl.split('___');
        parts.forEach((p,i)=>{
          fillH+=`<span class="fillt">${esc(p)}</span>`;
          if(i<parts.length-1){fillH+=`<input class="filli" id="fi-${c.id}-${i}" placeholder="___" size="12" autocomplete="off" autocorrect="off" spellcheck="false"/>`;}
        });
        fillH+='</div>';
        body=fillH+`<div class="arow arow2"><button class="bchk" onclick="chk('${c.id}')">Check &#9654;</button><button class="bhint" onclick="tHint('${c.id}')">Hint</button><button class="bshow" onclick="showAns('${c.id}')">&#128065; Show answer</button></div>`;
      }
      body+=`<div id="f-${c.id}"></div>`;
    }
    div.innerHTML=`<div class="brow"><span class="badge ${t.bc}">${t.lbl} — ${t.nm}</span><span class="badge ${typeColor}">${typeLabel}</span><span class="badge bxp">+${c.pts} XP</span>${statusBadge}</div>
      <div class="qt">${c.q}</div>
      <div class="hbox${hv?' vis':''}" id="h-${c.id}">&#128161; <strong>Hint:</strong> ${c.hint}</div>
      ${body}`;
    area.appendChild(div);
    if(!done&&!revealed&&type==='write'){const inp=document.getElementById('i-'+c.id);if(inp)inp.addEventListener('keydown',e=>{if(e.key==='Enter')chk(c.id);});}
    if(!done&&!revealed&&type==='fill'){
      for(let i=0;i<(c.blanks||[]).length;i++){
        const fi=document.getElementById(`fi-${c.id}-${i}`);
        if(fi)fi.addEventListener('keydown',e=>{if(e.key==='Enter')chk(c.id);});
      }
    }
  });
}
function tHint(id){TS.hint[id]=!TS.hint[id];const e=document.getElementById('h-'+id);if(e)e.classList.toggle('vis',!!TS.hint[id]);}
function showAns(id){
  if(!confirm('Reveal the canonical answer? You will see the solution but earn 0 XP for this challenge.'))return;
  if(!TS.revealed)TS.revealed={};
  TS.revealed[id]=true;
  TS.streak=0;
  rAll();
}
function chk(id){
  const t=TIERS.find(t=>t.challenges.some(c=>c.id===id));
  const c=t.challenges.find(x=>x.id===id);
  const fb=document.getElementById('f-'+id);
  if(!fb)return;
  const type=c.type||'write';
  let pass=false,errMsg='';
  if(type==='write'){
    const inp=document.getElementById('i-'+id);
    if(!inp)return;
    if(!inp.value.trim()){fb.innerHTML='<div class="fb fberr">Please enter an expression first.</div>';return;}
    pass=c.fn(inp.value);
    errMsg='Not quite. Variable names are case-sensitive and curly braces must be doubled: <code>{{Like.This}}</code>';
  }else if(type==='mc'||type==='bug'||type==='output'){
    const sel=document.querySelector(`input[name="mc-${id}"]:checked`);
    if(!sel){fb.innerHTML='<div class="fb fberr">Please select an option first.</div>';return;}
    pass=(sel.value===c.correct);
    errMsg='Not quite. Re-read the options carefully — one of the other choices is correct.';
  }else if(type==='fill'){
    let allOk=true,anyEmpty=false;
    for(let i=0;i<c.blanks.length;i++){
      const fi=document.getElementById(`fi-${id}-${i}`);
      if(!fi){allOk=false;break;}
      const v=fi.value.trim();
      if(!v){anyEmpty=true;allOk=false;break;}
      const accept=c.blanks[i];
      // accept if matches any alternative (normalized whitespace)
      const vn=v.replace(/\s+/g,'');
      const ok=accept.some(a=>a.replace(/\s+/g,'')===vn);
      if(!ok){allOk=false;break;}
    }
    if(anyEmpty){fb.innerHTML='<div class="fb fberr">Please fill in every blank first.</div>';return;}
    pass=allOk;
    errMsg='Not quite. Check each blank against the hint. Quotes and casing matter.';
  }
  if(pass){
    TS.done.add(id);const bon=TS.streak>=2?5:0;TS.streak++;TS.xp+=c.pts+bon;
    showToast('+'+(c.pts+bon)+' XP'+(bon>0?' — Streak bonus!':'')+(TS.streak>=3?' 🔥':''));
    rAll();
  }else{
    TS.streak=0;TS.wrong[id]=(TS.wrong[id]||0)+1;
    fb.innerHTML=`<div class="fb fberr">${errMsg}${TS.wrong[id]>=2?' Try the Hint button, or use Show answer to see the solution.':''}</div>`;
  }
}
function rAll(){rTierNav();rStrip();rChallenges();upHUD();}
/* rAll() will be called after successful authentication */

/* ════════════════════════════════════════════════
   BUILDER SHARED HELPERS
════════════════════════════════════════════════ */
const OP_OPTS=[{v:'equals',l:'equals — is exactly the same as'},{v:'notequals',l:'does NOT equal'},{v:'gt',l:'is greater than (numbers)'},{v:'gte',l:'is greater than or equal to'},{v:'lt',l:'is less than (numbers)'},{v:'lte',l:'is less than or equal to'}];
const OP_SYM={equals:'equal',notequals:'NOT equal',gt:'>',gte:'>=',lt:'<',lte:'<='};
const OP_LBL={equals:'is exactly equal to',notequals:'does NOT equal',gt:'is greater than',gte:'is greater than or equal to',lt:'is less than',lte:'is less than or equal to'};
const DATE_OPTS=[{v:'Scripter.Raw Customer Call Start Time',l:'Customer call start time'},{v:'Scripter.Raw Agent Call Start Time',l:'Agent call start time'}];
const DATE_STRING_OPTS=[{v:'Scripter.Customer Call Start Time',l:'Customer call start time (locale-formatted string)'},{v:'Scripter.Agent Call Start Time',l:'Agent call start time (locale-formatted string)'}];
const DUR_OPTS=[{v:'Scripter.Customer Call Duration',l:'Customer call duration'},{v:'Scripter.Agent Call Duration',l:'Agent call duration'}];
function mkV(v){if(!v)return'';if(v.startsWith('"')||v.startsWith('{{'))return v;return`{{${v}}}`;}
function mkVal(v){if(!v)return'';if(v.startsWith('"')||v.startsWith('{{'))return v;if(/^-?\d+(\.\d+)?$/.test(v))return v;return`"${v}"`;}
function mkCond(vn,op,cv){
  if(op==='equals')return`equal({{${vn}}}, ${mkVal(cv)})`;
  if(op==='notequals')return`NOT equal({{${vn}}}, ${mkVal(cv)})`;
  return`{{${vn}}} ${OP_SYM[op]} ${mkVal(cv)}`;
}
function fg(pfx,id,label,hint,ph,isSel,opts,why){
  const fullId=pfx+'-bi-'+id;
  const state=window['__state_'+pfx]||{};
  const val=state[id]||'';
  let h=`<div class="fgroup"><label class="flabel" for="${fullId}">${label}</label>`;
  if(why)h+=`<span class="fwhy">&#128161; <strong>Why this matters:</strong> ${why}</span>`;
  if(hint)h+=`<span class="fhint">&#9999;&#65039; ${hint}</span>`;
  if(isSel){
    h+=`<select class="fsel" id="${fullId}" onchange="oiSel('${pfx}','${id}',this.value)">`;
    opts.forEach(o=>h+=`<option value="${o.v}"${val===o.v?' selected':''}>${o.l}</option>`);
    h+=`</select>`;
  }else{
    h+=`<input class="finp" id="${fullId}" placeholder="${ph||''}" value="${val.replace(/"/g,'&quot;')}" oninput="oi('${pfx}','${id}',this.value)" autocomplete="off" autocorrect="off" spellcheck="false">`;
  }
  return h+`</div>`;
}
function oi(pfx,id,val){
  // For typed text input. Does NOT re-render fields (would steal focus).
  if(!window['__state_'+pfx])window['__state_'+pfx]={};
  window['__state_'+pfx][id]=val;
  window['__buildOut_'+pfx]&&window['__buildOut_'+pfx]();
}
function oiSel(pfx,id,val){
  // For <select> changes. Selects don't have a focus problem the same way,
  // and changing a select sometimes affects which fields are visible,
  // so we DO re-render fields here.
  if(!window['__state_'+pfx])window['__state_'+pfx]={};
  window['__state_'+pfx][id]=val;
  window['__rFields_'+pfx]&&window['__rFields_'+pfx]();
  window['__buildOut_'+pfx]&&window['__buildOut_'+pfx]();
}
function gv(pfx,id){return((window['__state_'+pfx]||{})[id]||'').trim();}
function showBuildPfx(pfx){
  document.getElementById(pfx+'-s2card').style.display='block';
  document.getElementById(pfx+'-exr').style.display='block';
  document.getElementById(pfx+'-bdwrap').style.display='block';
}
function clearBuildPfx(pfx,rTypeGridFn){
  window['__aid_'+pfx]=null;
  window['__state_'+pfx]={};
  document.getElementById(pfx+'-s2card').style.display='none';
  document.getElementById(pfx+'-exr').style.display='none';
  document.getElementById(pfx+'-bdwrap').style.display='none';
  document.getElementById(pfx+'-bout').innerHTML='<span class="exph">Fill in the fields above to generate your expression…</span>';
  document.getElementById(pfx+'-bdcontent').innerHTML='<span class="bdempty">Complete the fields above to see a full breakdown.</span>';
  rTypeGridFn&&rTypeGridFn();
}

/* ════════════════════════════════════════════════
   STRING BUILDER
════════════════════════════════════════════════ */
const STR_VT_INFO={
  basic:`<strong>&#128230; Basic String Variable</strong> — Stores a fixed piece of text set via the <strong>Set Variable</strong> action. Not computed at runtime — the value stays fixed until an action explicitly changes it.<br><strong>Use for:</strong> Account numbers, status labels, welcome messages, product names, or any text set from an Architect flow or typed directly.<br><strong>Assignments:</strong> Static text · Copy from another variable · Interpolated text (mix fixed text with {{variable}} placeholders)`,
  dynStr:`<strong>&#9889; Dynamic String Variable</strong> — Computes its own text value at runtime. Recalculates automatically when any referenced variable changes. Marked with ⚡ in the script editor.<br><strong>Use for:</strong> Formatted names · Cleaned phone numbers · Conditional messages · Date displays · Extracted text · Call summaries · Any string calculated live during the interaction.<br><strong>Rule:</strong> Expression must return <strong>text</strong>. Numbers or true/false will cause runtime errors.`,
  list:`<strong>&#128203; String List Variable</strong> — Stores <strong>multiple text values</strong> as comma-separated items in one field. Cannot be dynamic.<br><strong>Use for:</strong> Multiple responses, dropdown options, collected names, multi-value contact list data, agent option lists.<br><strong>To add items:</strong> Set Variable action → Push (enter a text value).<br><strong>To read items:</strong> Use <code>getIndexValue({{ListVar}}, index)</code> in a Dynamic String to retrieve one item. Use <code>indexOf({{ListVar}}, value)</code> in a Dynamic Number to find the position of a specific value.`
};
const STR_SCENARIOS={
  basic:[
    {id:'sb1',icon:'📝',name:'Store a fixed label or code',desc:"Save text like 'Active', 'SALES-001', or a welcome message",rec:'b-static'},
    {id:'sb2',icon:'📋',name:'Copy from another variable',desc:"Set this variable equal to another variable's current value",rec:'b-copy'},
    {id:'sb3',icon:'🔗',name:'Combine text and variables',desc:'Build a string mixing fixed words with live variable values',rec:'b-interp'},
    {id:'sb4',icon:'🪪',name:'Tag the interaction type or channel',desc:'Store the interaction type, queue name, or channel for display',rec:'b-copy'},
    {id:'sb5',icon:'💬',name:'Build a greeting message',desc:"Pre-fill a greeting using the customer's name or contact data",rec:'b-interp'},
  ],
  dynStr:[
    {id:'sd1',icon:'👤',name:"Display a person's full name",desc:'Format first, last, salutation from outbound contact list',rec:'d-join3'},
    {id:'sd2',icon:'💬',name:'Build a greeting or message',desc:'Combine a fixed greeting with agent name or customer name',rec:'d-join'},
    {id:'sd3',icon:'📞',name:'Clean a phone number',desc:'Remove dashes, spaces, parentheses — standardize digits',rec:'d-replace'},
    {id:'sd4',icon:'✂️',name:'Extract part of a string',desc:'Get area code, first N characters, last N characters, suffix',rec:'d-slice'},
    {id:'sd5',icon:'🔀',name:'Show different text based on a condition',desc:'Return one value if true, another if false — ifElse()',rec:'d-ifelse'},
    {id:'sd6',icon:'🔀🔀',name:'3 or more possible outcomes',desc:'Nested ifElse — e.g. Gold/Silver/Bronze based on a score',rec:'d-ifelseN'},
    {id:'sd7',icon:'🧹',name:'Clean up text — trim or change case',desc:'Remove spaces, uppercase, lowercase, or chain both',rec:'d-trim'},
    {id:'sd8',icon:'📅',name:'Display a date or time',desc:'Format call start time or agent start time for display',rec:'d-fmtdate'},
    {id:'sd9',icon:'📅🔧',name:'Format a date for an API',desc:'ISO 8601 format — 1999-12-31T19:00:00 — for integrations',rec:'d-fmtdatei'},
    {id:'sd10',icon:'⏱️',name:'Display the call duration',desc:'Show elapsed call time in HH:MM:SS readable format',rec:'d-fmtdur'},
    {id:'sd11',icon:'🎯',name:'Extract text matching a pattern',desc:'Use a regex to pull out a specific piece of text — match()',rec:'d-match'},
    {id:'sd12',icon:'⛓️',name:'Chain multiple operations',desc:'Apply trim + uppercase, or any two functions in sequence',rec:'d-chain'},
    {id:'sd13',icon:'📄',name:'Build a call log or summary',desc:'Combine ID, agent, type, and duration in one concat()',rec:'d-summary'},
    {id:'sd14',icon:'📋',name:'Read a value from a List variable',desc:'Retrieve a specific item from a List by its position',rec:'d-listget'},
    {id:'sd15',icon:'🔍',name:'Show where text appears in a string',desc:'Display or use the 0-based position of a word',rec:'d-indexof'},
  ],
  list:[
    {id:'sl1',icon:'➕',name:'Add a new item to the list',desc:'Append a value to the end of the list using Push',rec:'l-push'},
    {id:'sl2',icon:'📖',name:'Read an item from the list',desc:'Retrieve a specific item by position using getIndexValue()',rec:'l-getindex'},
    {id:'sl3',icon:'🔍',name:"Find an item's position",desc:'Search for a value and return where it is using indexOf()',rec:'l-indexof'},
  ]
};
const STR_TYPES={
  basic:[
    {id:'b-static',icon:'📝',name:'Assign static text',desc:'Type a fixed text value to store directly'},
    {id:'b-copy',icon:'📋',name:'Copy from another variable',desc:"Set equal to another variable's current value"},
    {id:'b-interp',icon:'🔗',name:'Interpolate text + variables',desc:'Mix fixed text with {{variable}} placeholders'},
  ],
  dynStr:[
    {id:'d-join',icon:'🔗',name:'Join 2 pieces — concat()',desc:'Stitch two text pieces together'},
    {id:'d-join3',icon:'🔗🔗',name:'Join 3+ pieces — concat()',desc:'Combine three or more values into one string'},
    {id:'d-upper',icon:'🔡',name:'Change case — upper()/lower()',desc:'ALL CAPS with upper() or all lowercase with lower()'},
    {id:'d-trim',icon:'✂️',name:'Trim spaces — trim()',desc:'Remove leading and trailing whitespace'},
    {id:'d-replace',icon:'🔄',name:'Find & replace — replace()',desc:'Find and replace (or delete) text'},
    {id:'d-substr',icon:'📐',name:'Substring by end position',desc:'Cut by start and end position — substring()'},
    {id:'d-slice',icon:'🍕',name:'Slice — supports negative positions',desc:'Cut text; negative positions count from right end'},
    {id:'d-substr2',icon:'📏',name:'Substr by length — substr()',desc:'Cut by start position and character count'},
    {id:'d-indexof',icon:'🔍',name:'Find position — indexOf()',desc:'0-based position of text; -1 if not found'},
    {id:'d-ifelse',icon:'🔀',name:'If/Then/Else — ifElse()',desc:'Two text outcomes from one condition'},
    {id:'d-ifelseN',icon:'🔀🔀',name:'Nested ifElse — 3+ outcomes',desc:'Multiple conditions, 3 or more possible results'},
    {id:'d-match',icon:'🎯',name:'Extract match — match()',desc:'Returns the text matching a regex pattern'},
    {id:'d-matchall',icon:'🎯🎯',name:'Nth match — matchAll()',desc:'Find all matches, return one by index'},
    {id:'d-fmtdate',icon:'📅',name:'Format date — formatDate()',desc:'Convert raw date to readable string'},
    {id:'d-fmtdatei',icon:'📅🔧',name:'ISO date — formatDateISO()',desc:'ISO 8601 format for APIs'},
    {id:'d-fmtdatel',icon:'🌐',name:'Locale date — formatLocaleDate()',desc:"Use agent's own local date format"},
    {id:'d-fmtdur',icon:'⏱️',name:'Duration — formatDuration()',desc:'Convert duration to HH:MM:SS string'},
    {id:'d-chain',icon:'⛓️',name:'Chain two functions',desc:'Nest two functions — e.g. upper(trim({{Var}}))'},
    {id:'d-summary',icon:'📄',name:'Call summary string',desc:'ID + agent + type + duration in one concat()'},
    {id:'d-listget',icon:'📋🔎',name:'Get List item — getIndexValue()',desc:'Retrieve one item from a List by position'},
  ],
  list:[
    {id:'l-push',icon:'📋➕',name:'Add item — Push',desc:'Append value via Set Variable action → Push'},
    {id:'l-getindex',icon:'📋🔎',name:'Read item at position',desc:'getIndexValue() — paste into a Dynamic String'},
    {id:'l-indexof',icon:'📋🔍',name:'Find position of item',desc:'indexOf() — paste into a Dynamic Number'},
    {id:'l-count',icon:'🔢',name:'Understand list positions',desc:'Lists are zero-based: first item is at index 0'},
  ]
};
const STR_TMPLS={
  basic:[
    {name:'Welcome message',desc:'Static greeting',t:'b-static',v:{sv:'"Hello, thank you for calling!"'}},
    {name:'Status — Active',desc:'Fixed status label',t:'b-static',v:{sv:'"Active"'}},
    {name:'Status — Pending',desc:'Fixed status label',t:'b-static',v:{sv:'"Pending Review"'}},
    {name:'Department code',desc:'Fixed dept/account code',t:'b-static',v:{sv:'"SALES-001"'}},
    {name:'Copy agent name',desc:'Scripter.Agent Name',t:'b-copy',v:{cv:'Scripter.Agent Name'}},
    {name:'Copy interaction ID',desc:'Scripter.Interaction Id',t:'b-copy',v:{cv:'Scripter.Interaction Id'}},
    {name:'Copy queue name',desc:'Scripter.Queue Name',t:'b-copy',v:{cv:'Scripter.Queue Name'}},
    {name:'Copy interaction type',desc:'Scripter.Interaction Type',t:'b-copy',v:{cv:'Scripter.Interaction Type'}},
    {name:'Full name (interpolated)',desc:'{{First}} {{Last}}',t:'b-interp',v:{iv:'{{Outbound.FirstName}} {{Outbound.LastName}}'}},
    {name:'Salutation + name',desc:'Mr./Ms. First Last',t:'b-interp',v:{iv:'{{Outbound.Salutation}} {{Outbound.FirstName}} {{Outbound.LastName}}'}},
    {name:'Call ID tag',desc:'Call ID + type label',t:'b-interp',v:{iv:'Call {{Scripter.Interaction Id}} | Type: {{Scripter.Interaction Type}}'}},
    {name:'Agent + queue label',desc:'Agent name in queue',t:'b-interp',v:{iv:'Agent: {{Scripter.Agent Name}} | Queue: {{Scripter.Queue Name}}'}},
  ],
  dynStr:[
    {name:'Full name',desc:'First + Last',t:'d-join',v:{jv1:'{{Outbound.FirstName}}',jsep:' ',jv2:'{{Outbound.LastName}}'}},
    {name:'Greeting + agent',desc:'Hello + agent name',t:'d-join',v:{jv1:'"Hello, "',jsep:'',jv2:'{{Scripter.Agent Name}}'}},
    {name:'Salutation + full name',desc:'Mr./Ms. First Last',t:'d-join3',v:{j3v1:'{{Outbound.Salutation}}',j3s1:' ',j3v2:'{{Outbound.FirstName}}',j3s2:' ',j3v3:'{{Outbound.LastName}}',j3s3:''}},
    {name:'Call summary',desc:'ID + agent + type + duration',t:'d-summary',v:{}},
    {name:'VIP check',desc:'Gold = VIP else Standard',t:'d-ifelse',v:{iev:'CustomerTier',ieop:'equals',ieval:'Gold',iet:'VIP',ief:'Standard'}},
    {name:'Score tier (3-way)',desc:'Gold / Silver / Bronze',t:'d-ifelseN',v:{ni1v:'Score',ni1op:'gte',ni1val:'90',ni1t:'Gold',ni2v:'Score',ni2op:'gte',ni2val:'70',ni2t:'Silver',niF:'Bronze'}},
    {name:'Interaction label',desc:'Call vs Digital',t:'d-ifelse',v:{iev:'Scripter.Interaction Type',ieop:'equals',ieval:'call',iet:'Inbound Call',ief:'Digital Interaction'}},
    {name:'Remove dashes',desc:'Strip dashes from phone',t:'d-replace',v:{repv:'PhoneNumber',repfind:'-',reprep:''}},
    {name:'Remove spaces',desc:'Strip spaces from input',t:'d-replace',v:{repv:'CustomerInput',repfind:' ',reprep:''}},
    {name:'Remove parentheses',desc:'Strip ( from phone',t:'d-replace',v:{repv:'PhoneNumber',repfind:'(',reprep:''}},
    {name:'Uppercase status',desc:'Status to ALL CAPS',t:'d-upper',v:{upv:'Status',updir:'upper'}},
    {name:'Lowercase input',desc:'CustomerInput to lowercase',t:'d-upper',v:{upv:'CustomerInput',updir:'lower'}},
    {name:'Trim agent input',desc:'Remove edge spaces',t:'d-trim',v:{trimv:'CustomerInput'}},
    {name:'Trim + uppercase',desc:'Chain trim then uppercase',t:'d-chain',v:{chfn:'upper',chinner:'trim',chv:'CustomerName'}},
    {name:'Trim + lowercase',desc:'Chain trim then lowercase',t:'d-chain',v:{chfn:'lower',chinner:'trim',chv:'CustomerInput'}},
    {name:'Area code (first 3)',desc:'slice() first 3 digits',t:'d-slice',v:{slv:'PhoneNumber',slstart:'0',slend:'3'}},
    {name:'Last 4 digits',desc:'slice() last 4 characters',t:'d-slice',v:{slv:'PhoneNumber',slstart:'-4',slend:''}},
    {name:'First 8 chars',desc:'substr() 8 chars from position 0',t:'d-substr2',v:{ss2v:'AccountNumber',ss2start:'0',ss2len:'8'}},
    {name:'Readable call start',desc:'Default formatDate() format',t:'d-fmtdate',v:{datev:'Scripter.Raw Customer Call Start Time'}},
    {name:'ISO call start',desc:'ISO 8601 for API calls',t:'d-fmtdatei',v:{datev2:'Scripter.Raw Customer Call Start Time'}},
    {name:'Agent call start',desc:'Agent start time readable',t:'d-fmtdate',v:{datev:'Scripter.Raw Agent Call Start Time'}},
    {name:'Call duration',desc:'HH:MM:SS readable duration',t:'d-fmtdur',v:{durv:'Scripter.Customer Call Duration'}},
    {name:'Agent call duration',desc:'Agent elapsed time',t:'d-fmtdur',v:{durv:'Scripter.Agent Call Duration'}},
    {name:'Extract area code',desc:'match() with capture group',t:'d-match',v:{msv:'PhoneNumber',mspat:'^(\\d{3})',msflags:'',mscap:'1'}},
    {name:'Extract ZIP code',desc:'match() 5 digits',t:'d-match',v:{msv:'AddressField',mspat:'\\d{5}',msflags:''}},
    {name:'Get first list item',desc:'getIndexValue position 0',t:'d-listget',v:{lgv:'OptionsList',lgidx:'0'}},
    {name:'Get second list item',desc:'getIndexValue position 1',t:'d-listget',v:{lgv:'OptionsList',lgidx:'1'}},
  ],
  list:[
    {name:'Push a value',desc:'Append item to the list',t:'l-push',v:{}},
    {name:'Read first item',desc:'getIndexValue position 0',t:'l-getindex',v:{lgv:'OptionsList',lgidx:'0'}},
    {name:'Read second item',desc:'getIndexValue position 1',t:'l-getindex',v:{lgv:'OptionsList',lgidx:'1'}},
    {name:"Find 'Gold'",desc:"indexOf 'Gold' in list",t:'l-indexof',v:{lsv:'OptionsList',lsearch:'Gold'}},
    {name:"Find 'Active'",desc:"indexOf 'Active' in StatusList",t:'l-indexof',v:{lsv:'StatusList',lsearch:'Active'}},
  ]
};

let strVT='basic',strAID=null,strASCN=null;
window['__state_str']={};

function setStrVT(vt){
  strVT=vt;strAID=null;strASCN=null;window['__state_str']={};
  ['basic','dyn','list'].forEach(k=>document.getElementById('strtab-'+k).classList.remove('active'));
  document.getElementById('strtab-'+(vt==='dynStr'?'dyn':vt)).classList.add('active');
  const info=document.getElementById('str-vt-info');
  info.className='vt-info '+(vt==='list'?'lst':'str');
  info.innerHTML=STR_VT_INFO[vt];
  rStrScenarios();rStrTmpls();rStrTypeGrid();clearBuildPfx('str',rStrTypeGrid);
}
function rStrScenarios(){
  const g=document.getElementById('str-scn-grid');g.innerHTML='';
  (STR_SCENARIOS[strVT]||[]).forEach(s=>{
    const c=document.createElement('button');c.className='scn'+(strASCN===s.id?' sel':'');
    c.innerHTML=`<span class="si">${s.icon}</span><span class="sn">${s.name}</span><span class="sd">${s.desc}</span>`;
    c.onclick=()=>{strASCN=s.id;strAID=s.rec;window['__state_str']={};rStrScenarios();rStrTypeGrid();rStrFields();showBuildPfx('str');document.getElementById('str-step2sub').textContent='★ Best match for your scenario — or choose any type';setTimeout(()=>document.getElementById('str-s2card').scrollIntoView({behavior:'smooth',block:'start'}),120);};
    g.appendChild(c);
  });
}
function rStrTmpls(){
  const g=document.getElementById('str-tmpl-grid');g.innerHTML='';
  (STR_TMPLS[strVT]||[]).forEach(t=>{
    const b=document.createElement('button');b.className='tbn';
    b.innerHTML=`<strong>${t.name}</strong><span>${t.desc}</span>`;
    b.onclick=()=>{strAID=t.t;window['__state_str']=Object.assign({},t.v);strASCN=null;rStrScenarios();rStrTypeGrid();rStrFields();showBuildPfx('str');};
    g.appendChild(b);
  });
}
function rStrTypeGrid(){
  const g=document.getElementById('str-type-grid');g.innerHTML='';
  const recId=strASCN?(STR_SCENARIOS[strVT]||[]).find(s=>s.id===strASCN)?.rec:null;
  (STR_TYPES[strVT]||[]).forEach(t=>{
    const c=document.createElement('button');
    c.className='tyc'+(strAID===t.id?' sel':'')+(t.id===recId&&strAID!==t.id?' rec':'');
    c.innerHTML=`<span class="ti">${t.icon}</span><span class="tn">${t.name}</span><span class="td">${t.desc}</span>`;
    c.onclick=()=>{strAID=t.id;window['__state_str']={};rStrTypeGrid();rStrFields();showBuildPfx('str');};
    g.appendChild(c);
  });
}
function resetStrBuilder(){strASCN=null;strAID=null;window['__state_str']={};rStrScenarios();rStrTmpls();clearBuildPfx('str',rStrTypeGrid);document.getElementById('str-step2sub').textContent='Browse all available expression types';}
window['__rFields_str']=()=>rStrFields();
window['__buildOut_str']=()=>rStrBuildOut();

const VTH='Variable name (no curly braces — we add them). Or wrap plain text in quotes like <code>"Hello"</code>.';
function rStrFields(){
  const f=document.getElementById('str-bfields');
  if(!strAID){f.innerHTML='';return;}
  const allT=[...(STR_TYPES.basic||[]),...(STR_TYPES.dynStr||[]),...(STR_TYPES.list||[])];
  const et=allT.find(x=>x.id===strAID);
  document.getElementById('str-s2sub').textContent=et?et.name:'Fill in the details';
  const p='str';

  const M={
    'b-static':fg(p,'sv','What text do you want to store?','Wrap in quotes to clarify it is a literal value — e.g. "Active" or "SALES-001".','e.g.  "Active"  or  "SALES-001"',false,null,'Basic String variables hold exactly the text you put here. It will not change at runtime unless a Set Variable action explicitly updates it.'),
    'b-copy':fg(p,'cv','Which variable do you want to copy the value from?','Type just the variable name — no curly braces.','e.g.  Scripter.Agent Name  or  CustomerTier',false,null,"This creates a snapshot of another variable's value at the moment the Set Variable action fires."),
    'b-interp':fg(p,'iv','Type your text — insert {{VariableName}} wherever you need a live value:','Wrap each variable name in double curly braces. Fixed text goes between them as-is.','e.g.  Hello {{Outbound.FirstName}}, your case ID is {{Scripter.Interaction Id}}.',false,null,'Interpolation works like a mail merge — fixed text acts as the template and each {{variable}} is replaced with its live value when the Set Variable action runs.'),
    'd-join':
      `<div class="ftip">&#128161; <strong>concat()</strong> joins arguments left to right. Use "Join 3+ pieces" for more than two values.</div>`+
      fg(p,'jv1','First piece:',VTH,'e.g.  Outbound.FirstName  or  "Hello, "',false,null,'The first value appears at the left end of the combined string.')+
      fg(p,'jsep','Separator (optional — leave blank for none):','A space between names is most common. Leave blank to join with nothing.','e.g.  a space or a comma')+
      fg(p,'jv2','Second piece:','Variable name or quoted text.','e.g.  Outbound.LastName  or  "!"'),
    'd-join3':
      `<div class="ftip">&#128161; <strong>concat() with 3+ pieces.</strong> Each separator and value is a separate argument joined left to right.</div>`+
      fg(p,'j3v1','Value 1:',VTH,'e.g.  Outbound.Salutation')+fg(p,'j3s1','Sep after value 1 (optional):','Leave blank for none.','e.g.  space')+
      fg(p,'j3v2','Value 2:',VTH,'e.g.  Outbound.FirstName')+fg(p,'j3s2','Sep after value 2 (optional):','Leave blank for none.','e.g.  space')+
      fg(p,'j3v3','Value 3:',VTH,'e.g.  Outbound.LastName')+
      fg(p,'j3s3','Value 4 (optional — leave blank if not needed):','Add a 4th value, separator, or literal here.','e.g.  ", VIP"  or leave blank'),
    'd-upper':
      fg(p,'upv','Which variable do you want to change?','Variable name — no curly braces.','e.g.  Status  or  CustomerName',false,null,'upper() and lower() are used to standardize text for comparisons or logging — e.g. ensuring an account code is always uppercase regardless of what the agent typed.')+
      fg(p,'updir','Which direction?',null,null,true,[{v:'upper',l:'ALL UPPERCASE — upper()'},{v:'lower',l:'all lowercase — lower()'}]),
    'd-trim':
      fg(p,'trimv','Which variable do you want to trim?','Variable name — no curly braces.','e.g.  CustomerInput  or  AgentNote',false,null,'Agents frequently type a leading or trailing space without noticing. trim() removes those invisible characters so they do not cause comparison mismatches.')+
      `<div class="fgroup"><label class="flabel">What trim() does</label><span class="fhint">&#9999;&#65039; Removes whitespace from the <strong>very start and end</strong> of the text only. Spaces in the middle are left untouched. To also change case, use the "Chain two functions" type.</span></div>`,
    'd-replace':
      `<div class="ftip">&#128161; <strong>Common uses:</strong> replace({{PhoneNumber}},"-","") removes all dashes. replace({{Input}}," ","") removes all spaces. Leave replacement empty to delete every match.</div>`+
      fg(p,'repv','Which variable do you want to modify?','Variable name — no curly braces.','e.g.  PhoneNumber  or  RawInput',false,null,'replace() replaces every occurrence of the search text — not just the first. It is not a single substitution.')+
      fg(p,'repfind','Find this character or text:','Case-sensitive by default.','e.g.  -  or  (  or a space')+
      fg(p,'reprep','Replace with (leave blank to delete):','Leave empty to delete every occurrence of the matched text.','e.g. leave empty to delete'),
    'd-substr':
      `<div class="ftip">&#128161; <strong>substring(start, end):</strong> end position is NOT included. First 3 chars: start=0, end=3. For negative positions (counting from right), use slice() instead.</div>`+
      fg(p,'subv','Which variable do you want to extract from?','Variable name — no curly braces.','e.g.  PhoneNumber  or  AccountNumber',false,null,'Common for pulling area codes, prefix codes from account numbers, or truncating long strings for display.')+
      fg(p,'substart','Start position (0 = first character):','Position 0 = first character, 1 = second, etc.','e.g.  0  or  3')+
      fg(p,'subend','End position (NOT included — leave blank for rest of string):','First 3 chars: start=0, end=3. Chars 3–6: start=3, end=6.','e.g.  3  or  7'),
    'd-slice':
      fg(p,'slv','Which variable do you want to slice?','Variable name — no curly braces.','e.g.  PhoneNumber  or  AccountId',false,null,'slice() accepts negative positions that count from the right end — e.g. -4 starts 4 chars from the end. Ideal for extracting the last N digits of a phone number.')+
      fg(p,'slstart','Start position (negative = count from right end):','0 = first char. -1 = last char. -4 = 4th from the end.','e.g.  0  or  -4')+
      fg(p,'slend','End position (optional — leave blank for rest of string):','Negative values count from the right. slice("ABCD",0,-1) returns "ABC".','e.g.  3  or  -1'),
    'd-substr2':
      `<div class="ftip">&#128161; <strong>substr(start, length):</strong> 3rd argument is a <strong>character count</strong>, not an end position. substr("ABCD",1,2) → "BC".</div>`+
      fg(p,'ss2v','Which variable do you want to extract from?','Variable name — no curly braces.','e.g.  AccountNumber  or  ProductCode',false,null,"Use substr() when you know how many characters you want, not where to stop — e.g. 'take 8 characters starting at position 0'.")+
      fg(p,'ss2start','Start position (0 = first character):','Position 0 = first character.','e.g.  0  or  2')+
      fg(p,'ss2len','How many characters do you want?','This is the character count — not an end position.','e.g.  4  or  8'),
    'd-indexof':
      fg(p,'ixv','Which variable do you want to search inside?','Variable name — no curly braces.','e.g.  FullName  or  CustomerNote',false,null,'indexOf() returns a number (position). To use it in a condition or display it, store the result in a Dynamic Number variable.')+
      fg(p,'ixsearch','What text are you looking for?','Returns the 0-based position where it first appears. Returns -1 if not found.','e.g.  Smith  or  @  or  VIP'),
    'd-ifelse':
      `<div class="ftip">&#128161; <strong>Single condition, two outcomes.</strong> For 3+ outcomes (e.g. Gold/Silver/Bronze), use the Nested ifElse type.</div>`+
      fg(p,'iev','Which variable are you checking?','Variable name — no curly braces.','e.g.  CustomerTier  or  Scripter.Interaction Type',false,null,'ifElse() re-evaluates live whenever any referenced variable changes — so if CustomerTier changes during the call, this Dynamic String immediately reflects the new value.')+
      fg(p,'ieop','What condition do you want to check?',null,null,true,OP_OPTS)+
      fg(p,'ieval','Compare it to this value:','Text is automatically quoted. Numbers are used as-is.','e.g.  Gold  or  90  or  call')+
      fg(p,'iet','If TRUE return this text:','Result when condition matches.','e.g.  VIP  or  Inbound Call')+
      fg(p,'ief','If FALSE return this instead:','Result when condition does NOT match.','e.g.  Standard  or  Digital'),
    'd-ifelseN':
      `<div class="ftip">&#128161; <strong>Nested ifElse:</strong> Conditions tested top to bottom — first match wins. If none match, returns the default.</div>`+
      fg(p,'ni1v','1st condition — which variable?','Variable name — no curly braces.','e.g.  Score  or  CustomerTier',false,null,'The outer ifElse tests this first. If true, Outcome 1 is returned immediately and nothing else is evaluated.')+
      fg(p,'ni1op','1st condition operator:',null,null,true,OP_OPTS)+
      fg(p,'ni1val','1st condition value:','','e.g.  90  or  Gold')+
      fg(p,'ni1t','Outcome 1 (1st condition TRUE):','','e.g.  Gold  or  VIP')+
      fg(p,'ni2v','2nd condition — which variable?','Only tested if the 1st condition was false.','e.g.  Score  or  CustomerTier')+
      fg(p,'ni2op','2nd condition operator:',null,null,true,OP_OPTS)+
      fg(p,'ni2val','2nd condition value:','','e.g.  70  or  Silver')+
      fg(p,'ni2t','Outcome 2 (2nd condition TRUE):','','e.g.  Silver  or  Standard')+
      fg(p,'niF','Default (all conditions FALSE):','Returned when no condition matches.','e.g.  Bronze  or  Basic'),
    'd-match':
      `<div class="ftip">&#128161; <strong>match() in a Dynamic String</strong> returns the matched text — not true/false. To just test whether something matches, use a Dynamic Boolean with match() instead.</div>`+
      fg(p,'msv','Which variable do you want to search?','Variable name — no curly braces.','e.g.  PhoneNumber  or  AddressField',false,null,'match() scans the text and returns the first matched portion. Use () capture groups to extract a specific part — e.g. ^(\\d{3}) returns just the area code.')+
      fg(p,'mspat','Regex pattern:','First text matching this pattern is returned. Use () capture groups for a specific part.','e.g.  \\d{3}  or  ^(\\d{3})  or  [A-Z]{2}')+
      fg(p,'msflags','Flags (optional):','<code>i</code> = case-insensitive. Leave blank for case-sensitive.','e.g.  i  or leave blank')+
      fg(p,'mscap','Capture group # (optional — blank = whole match):','0 = whole match, 1 = first () group, 2 = second.','e.g.  1  or leave blank'),
    'd-matchall':
      `<div class="ftip">&#128161; <strong>matchAll()</strong> finds all occurrences of the pattern, then returns the one at the index you pick. 0 = first match, 1 = second, etc.</div>`+
      fg(p,'mav','Which variable do you want to search?','Variable name — no curly braces.','e.g.  NotesField  or  CustomerComment',false,null,'matchAll() is useful when a field contains multiple occurrences and you need a specific one — e.g. the second phone number in a notes field.')+
      fg(p,'mapn','Regex pattern:','All occurrences found first, then you pick one by index.','e.g.  \\d{3}-\\d{4}  or  [A-Z]{3}')+
      fg(p,'maflags','Flags (optional):','<code>i</code> = case-insensitive.','e.g.  i  or leave blank')+
      fg(p,'maidx','Which match? (0 = first, 1 = second, etc.)','','e.g.  0  or  1'),
    'd-fmtdate':
      `<div class="ftip">&#128161; <strong>Use the Raw variant of the date variable.</strong> The Raw versions (like <code>{{Scripter.Raw Customer Call Start Time}}</code>) are already a number in milliseconds, which is exactly what <code>formatDate()</code> expects. Do <strong>not</strong> wrap the Raw variant in <code>dateToMilliseconds()</code> — that's only needed for the non-Raw, locale-formatted string variants.</div>`+
      fg(p,'datev','Which date variable?','Use the Raw version — it is already a number in milliseconds, ready to pass directly to formatDate().',null,true,DATE_OPTS,'Raw built-in date variables hold the raw numeric epoch timestamp. Non-Raw variants are locale-formatted strings that would need dateToMilliseconds() first — but Raw skips that step.')+
      fg(p,'datefmt','Custom format string (optional — leave blank for default):','Default: <code>01/01/2000 12:00:00 am (+00:00)</code>. Tokens: <code>MM/dd/yyyy</code> · <code>eeee, MMMM do yyyy</code> · <code>h:mm a</code>','e.g.  MM/dd/yyyy  or leave blank'),
    'd-fmtdatei':
      fg(p,'datev2','Which date variable?','Use the Raw version — already in milliseconds, ready to pass directly.',null,true,DATE_OPTS,'ISO 8601 is the international standard for date exchange. Use when passing dates to APIs, data actions, or external systems.')+
      `<div class="fgroup"><label class="flabel">Output format</label><span class="fhint">&#9999;&#65039; Produces: <code>1999-12-31T19:00:00-05:00</code>. Includes the agent's local UTC offset. Format is fixed by the ISO 8601 standard — no custom format options.</span></div>`,
    'd-fmtdatel':
      fg(p,'datev3','Which date variable?','Use the Raw version — already in milliseconds.',null,true,DATE_OPTS,"formatLocaleDate() uses each agent's own system locale — US agents see MM/dd/yyyy, UK agents see dd/MM/yyyy automatically.")+
      fg(p,'localefmt','Custom format string (optional — leave blank for locale default):',"Leave blank for the agent's locale default. Uses the same tokens as formatDate().",'e.g.  MM/dd/yyyy  or leave blank'),
    'd-fmtdur':
      fg(p,'durv','Which duration variable?','Outputs a readable string like 00:04:32.',null,true,DUR_OPTS,'Both functions are required together. durationToMilliseconds() converts the raw string to a number; formatDuration() converts that number to HH:MM:SS.')+
      `<div class="fgroup"><label class="flabel">Output and tips</label><span class="fhint">&#9999;&#65039; Produces: <code>00:04:32</code>. For a countdown (e.g. time until 5 min): <code>formatDuration(5*60*1000 - durationToMilliseconds({{Scripter.Customer Call Duration}}))</code>.</span></div>`,
    'd-chain':
      `<div class="ftip">&#128161; <strong>Chaining:</strong> Inner function runs first. Example: upper(trim({{Var}})) — trim runs first removing spaces, then upper converts the result to uppercase.</div>`+
      fg(p,'chfn','Outer function (runs second — last):','',null,true,[{v:'upper',l:'upper() — ALL CAPS after the inner function'},{v:'lower',l:'lower() — lowercase after the inner function'},{v:'trim',l:'trim() — remove edge spaces after the inner function'}],'Think of chaining as a pipeline: the variable enters at the innermost level and the result flows outward. Innermost always runs first.')+
      fg(p,'chinner','Inner function (runs first):','',null,true,[{v:'trim',l:'trim() — remove edge spaces first'},{v:'upper',l:'upper() — uppercase first'},{v:'lower',l:'lower() — lowercase first'}])+
      fg(p,'chv','Which variable are you applying these to?','Variable name — no curly braces.','e.g.  CustomerName  or  AccountNumber'),
    'd-summary':
      `<div class="fgroup"><label class="flabel">Call summary expression — ready to copy</label><span class="fhint">&#9999;&#65039; Combines four Scripter built-in variables in one string. No configuration needed.</span></div>
       <div class="fgroup"><label class="flabel">Example output</label><span class="fhint">&#9999;&#65039; <code>Call: a1b2c3d4 | Agent: Jane Smith | Type: call | Duration: 00:04:32</code></span></div>`,
    'd-listget':
      `<div class="ftip">&#128161; Paste this expression into a <strong>Dynamic String</strong> variable — List variables cannot hold expressions.</div>`+
      fg(p,'lgv','Which List variable?','List variable name — no curly braces.','e.g.  OptionsList  or  ProductSelections',false,null,'getIndexValue() retrieves one item by position. Position 0 = first item. A runtime error occurs if the index exceeds the list size minus one.')+
      fg(p,'lgidx','Which position?','0 = first item, 1 = second, 2 = third, etc.','e.g.  0'),
    'l-push':
      `<div class="fgroup"><label class="flabel">How to add items to a List variable</label>
       <span class="fwhy">&#128161; <strong>Why use Push?</strong> Push is the only way to add items to a List variable at runtime. Each Push appends one value to the end of the list in order.</span>
       <span class="fhint">&#9999;&#65039; In the Genesys Cloud script editor: <strong>Set Variable</strong> action → select your List variable → choose <strong>Push</strong> → enter the value to add.<br>There is no expression code to copy for Push — it is configured entirely through the Set Variable action UI.</span></div>`,
    'l-getindex':
      `<div class="ftip">&#128161; Paste this into a <strong>Dynamic String</strong> variable — List variables cannot hold expressions.</div>`+
      fg(p,'lgv','Which List variable?','List variable name — no curly braces.','e.g.  OptionsList  or  PhoneNumberList',false,null,'getIndexValue() retrieves one item at a specific position. Position 0 = first item. An error occurs if the index is out of range.')+
      fg(p,'lgidx','Which position?','0 = first item, 1 = second, etc.','e.g.  0')+
      `<div class="fgroup"><label class="flabel">Where to use this expression</label><span class="fhint">&#9999;&#65039; Copy the expression below and paste it into a <strong>Dynamic String</strong> variable's expression field in the script editor.</span></div>`,
    'l-indexof':
      `<div class="ftip">&#128161; Paste this into a <strong>Dynamic Number</strong> variable. The result is a position number — not text.</div>`+
      fg(p,'lsv','Which List variable?','List variable name — no curly braces.','e.g.  OptionsList  or  StatusList',false,null,'indexOf() searches the list from left to right for the first occurrence of your value. Returns -1 if not found — useful as a "not in list" signal.')+
      fg(p,'lsearch','What value are you looking for?','Returns 0-based position or -1 if not found.','e.g.  Gold  or  Active'),
    'l-count':
      `<div class="fgroup"><label class="flabel">How list positions work</label>
       <span class="fhint">&#9999;&#65039; Genesys Cloud List variables do not have a built-in length function. Items are stored in order at zero-based positions. Position 0 = first item. If you try to access a position that does not exist, a runtime error occurs.<br><br>
       <strong>Practical approach:</strong> Track item count separately using a Basic Number variable. Increment it by 1 with each Push action to keep a running total.</span></div>`,
  };

  f.innerHTML=M[strAID]||`<div class="fgroup"><span class="fhint">Select an expression type above to see the fields.</span></div>`;
  ['str-bi-ieop','str-bi-ni1op','str-bi-ni2op','str-bi-updir','str-bi-chfn','str-bi-chinner','str-bi-datev','str-bi-datev2','str-bi-datev3','str-bi-durv'].forEach(id=>{
    const el=document.getElementById(id);
    const key=id.replace('str-bi-','');
    const st=window['__state_str']||{};
    if(el&&st[key])el.value=st[key];
  });
  rStrBuildOut();
}
function rStrBuildOut(){
  const AID=strAID;
  const g=(id)=>gv('str',id);
  const bout=document.getElementById('str-bout');
  if(!AID){bout.innerHTML='<span class="exph">Pick an expression type above to get started…</span>';renderBD(null,'str-bdcontent');return;}
  let expr='',parts=[];
  try{
    if(AID==='b-static'){
      expr=g('sv')||'';
      parts=[{t:'cs',s:expr||'""',d:'The exact text value stored in this variable. Fixed — will not change at runtime unless a Set Variable action updates it.'}];
    }else if(AID==='b-copy'){
      const v=g('cv');expr=v?`{{${v}}}`:'';
      parts=[{t:'cv',s:`{{${v||'VAR'}}}`,d:`Copies the current value of <code>{{${v||'VAR'}}}</code> at the moment the Set Variable action fires.`}];
    }else if(AID==='b-interp'){
      expr=g('iv')||'';
      parts=[{t:'cs',s:expr||'""',d:"An interpolated string. Fixed text appears exactly as typed. Each <code>{{variable}}</code> placeholder is replaced with that variable's live value when the Set Variable action runs."}];
    }else if(AID==='d-join'){
      const a=mkV(g('jv1')),s=g('jsep'),b=mkV(g('jv2'));
      if(s){expr=`concat(${a||'""'}, "${s}", ${b||'""'})`;parts=[{t:'cf',s:'concat(',d:'<strong>concat()</strong> joins every argument left to right into one string.'},{t:'cv',s:a||'""',d:`1st piece: ${g('jv1')||'...'}`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${s}"`,d:`Separator: ${s===' '?'a space character':'"'+s+'"'}`},{t:'cp',s:', ',d:'Comma'},{t:'cv',s:b||'""',d:`2nd piece: ${g('jv2')||'...'}`},{t:'cp',s:')',d:'Closes concat()'}];}
      else{expr=`concat(${a||'""'}, ${b||'""'})`;parts=[{t:'cf',s:'concat(',d:'<strong>concat()</strong> joins arguments left to right.'},{t:'cv',s:a||'""',d:`1st: ${g('jv1')||'...'}`},{t:'cp',s:', ',d:'Comma'},{t:'cv',s:b||'""',d:`2nd: ${g('jv2')||'...'}`},{t:'cp',s:')',d:'Closes concat()'}];}
    }else if(AID==='d-join3'){
      const args=[];
      if(g('j3v1'))args.push(mkV(g('j3v1')));if(g('j3s1'))args.push(`"${g('j3s1')}"`);
      if(g('j3v2'))args.push(mkV(g('j3v2')));if(g('j3s2'))args.push(`"${g('j3s2')}"`);
      if(g('j3v3'))args.push(mkV(g('j3v3')));if(g('j3s3'))args.push(mkV(g('j3s3')));
      expr=`concat(${args.join(', ')})`;
      parts=[{t:'cf',s:'concat(',d:'<strong>concat()</strong> joins all arguments left to right.'},...args.flatMap((a,i)=>[{t:a.startsWith('{{')?'cv':'cs',s:a,d:`Arg ${i+1}`},...(i<args.length-1?[{t:'cp',s:', ',d:'Comma'}]:[])])  ,{t:'cp',s:')',d:'Closes concat()'}];
    }else if(AID==='d-upper'){
      const vn=g('upv'),dir=g('updir')||'upper';
      expr=`${dir}({{${vn||'VAR'}}})`;
      parts=[{t:'cf',s:`${dir}(`,d:dir==='upper'?'<strong>upper()</strong> converts every letter to UPPERCASE.':'<strong>lower()</strong> converts every letter to lowercase.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:')',d:`Closes ${dir}()`}];
    }else if(AID==='d-trim'){
      const vn=g('trimv');expr=`trim({{${vn||'VAR'}}})`;
      parts=[{t:'cf',s:'trim(',d:'<strong>trim()</strong> removes whitespace from the very start and end. Middle spaces are untouched.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:')',d:'Closes trim()'}];
    }else if(AID==='d-replace'){
      const vn=g('repv'),find=g('repfind'),rep=g('reprep');
      expr=`replace({{${vn||'VAR'}}}, "${find}", "${rep}")`;
      parts=[{t:'cf',s:'replace(',d:'<strong>replace()</strong> finds and replaces every occurrence of the search text. Empty replacement = delete.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${find}"`,d:`Find: "${find||'...'}" — the text or character to locate`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${rep}"`,d:rep?`Replace with: "${rep}"`:'<strong>Empty string</strong> — deletes every matched occurrence'},{t:'cp',s:')',d:'Closes replace()'}];
    }else if(AID==='d-substr'){
      const vn=g('subv'),s=g('substart')||'0',e=g('subend');
      const sc=parseInt(s)||0,ec=e?parseInt(e):null;
      expr=e?`substring({{${vn||'VAR'}}}, ${s}, ${e})`:`substring({{${vn||'VAR'}}}, ${s})`;
      parts=[{t:'cf',s:'substring(',d:`<strong>substring()</strong> extracts ${ec!==null?ec-sc+' character(s)':'the rest of the string'} starting at position ${sc}.`},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:s,d:`Start: position ${s} (0 = first character)`},...(e?[{t:'cp',s:', ',d:'Comma'},{t:'cn',s:e,d:`End: position ${e} — character here is NOT included`}]:[]),{t:'cp',s:')',d:'Closes substring()'}];
    }else if(AID==='d-slice'){
      const vn=g('slv'),s=g('slstart')||'0',e=g('slend');
      expr=e?`slice({{${vn||'VAR'}}}, ${s}, ${e})`:`slice({{${vn||'VAR'}}}, ${s})`;
      parts=[{t:'cf',s:'slice(',d:'<strong>slice()</strong> extracts text by position. Supports negative positions that count from the right end of the string.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:s,d:`Start: ${s}${parseInt(s)<0?' (from right end)':''}`},...(e?[{t:'cp',s:', ',d:'Comma'},{t:'cn',s:e,d:`End: ${e}${parseInt(e)<0?' (from right end)':''} — this position is NOT included`}]:[]),{t:'cp',s:')',d:'Closes slice()'}];
    }else if(AID==='d-substr2'){
      const vn=g('ss2v'),st=g('ss2start')||'0',ln=g('ss2len')||'1';
      expr=`substr({{${vn||'VAR'}}}, ${st}, ${ln})`;
      parts=[{t:'cf',s:'substr(',d:`<strong>substr()</strong> extracts ${ln} character(s) starting at position ${st}. Unlike substring(), the 3rd argument is a character <strong>count</strong> — not an end position.`},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:st,d:`Start position: ${st}`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:ln,d:`Length: return ${ln} character(s)`},{t:'cp',s:')',d:'Closes substr()'}];
    }else if(AID==='d-indexof'){
      const vn=g('ixv'),srch=g('ixsearch');
      expr=`indexOf({{${vn||'VAR'}}}, "${srch||'text'}")`;
      parts=[{t:'cf',s:'indexOf(',d:'<strong>indexOf()</strong> finds where text appears and returns its 0-based position. Returns -1 if not found. The result is a number — store it in a Dynamic Number variable to use it.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Search inside: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${srch||'text'}"`,d:`Find: "${srch||'text'}"`},{t:'cp',s:')',d:'Closes indexOf()'}];
    }else if(AID==='d-ifelse'){
      const vn=g('iev'),op=g('ieop')||'equals',cv=g('ieval'),t=g('iet'),f2=g('ief');
      const cond=mkCond(vn||'VAR',op,cv),tv=mkVal(t),fv=mkVal(f2);
      expr=`ifElse(${cond}, ${tv||'""'}, ${fv||'""'})`;
      parts=[{t:'cf',s:'ifElse(',d:'<strong>ifElse()</strong> evaluates a condition. If TRUE returns the second argument. If FALSE returns the third.'},{t:'cv',s:cond,d:`Condition: Is <code>{{${vn||'VAR'}}}</code> ${OP_LBL[op]||'equal to'} <code>${cv||'...'}</code>?`},{t:'cp',s:', ',d:'Comma — separates condition from TRUE result'},{t:'cs',s:tv||'""',d:`TRUE result: "${t||'...'}" — returned when condition matches`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:fv||'""',d:`FALSE result: "${f2||'...'}" — returned when condition does NOT match`},{t:'cp',s:')',d:'Closes ifElse()'}];
    }else if(AID==='d-ifelseN'){
      const v1=g('ni1v')||'VAR',op1=g('ni1op')||'gte',val1=g('ni1val'),t1=g('ni1t');
      const v2=g('ni2v')||'VAR',op2=g('ni2op')||'gte',val2=g('ni2val'),t2=g('ni2t'),fb=g('niF');
      const c1=mkCond(v1,op1,val1),c2=mkCond(v2,op2,val2);
      const r1=mkVal(t1)||'"Outcome1"',r2=mkVal(t2)||'"Outcome2"',rf=mkVal(fb)||'"Default"';
      expr=`ifElse(${c1}, ${r1}, ifElse(${c2}, ${r2}, ${rf}))`;
      parts=[{t:'cf',s:'ifElse(',d:'<strong>Outer ifElse()</strong> — tests the first condition. TRUE → Outcome 1. FALSE → falls through to the inner ifElse.'},{t:'cv',s:c1,d:`First condition: Is <code>{{${v1}}}</code> ${OP_LBL[op1]||'...'} <code>${val1||'...'}</code>?`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:r1,d:`Outcome 1 (first condition TRUE): "${t1||'...'}" — returned immediately`},{t:'cp',s:', ',d:'Comma — FALSE leads to inner ifElse'},{t:'cf',s:'ifElse(',d:'<strong>Inner ifElse()</strong> — only reached if the first condition was false.'},{t:'cv',s:c2,d:`Second condition: Is <code>{{${v2}}}</code> ${OP_LBL[op2]||'...'} <code>${val2||'...'}</code>?`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:r2,d:`Outcome 2 (second condition TRUE): "${t2||'...'}" — returned if second matches`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:rf,d:`Default (all conditions FALSE): "${fb||'...'}" — the fallback when nothing matched`},{t:'cp',s:'))',d:'Two closing parentheses — closes inner ifElse() first, then outer'}];
    }else if(AID==='d-match'){
      const vn=g('msv'),pat=g('mspat'),flags=g('msflags'),cap=g('mscap');
      const args=[`{{${vn||'VAR'}}}`,`"${pat||'PATTERN'}"`,...(flags?[`"${flags}"`]:[]),...(cap?[cap]:[])];
      expr=`match(${args.join(', ')})`;
      parts=[{t:'cf',s:'match(',d:'<strong>match()</strong> in a Dynamic String returns the matched text itself — not true/false.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Search in: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${pat||'...'}"`,d:'Pattern: the first text matching this regex is returned'},...(flags?[{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${flags}"`,d:`Flag: "${flags}"${flags==='i'?' — case-insensitive matching':''}`}]:[]),...(cap?[{t:'cp',s:', ',d:'Comma'},{t:'cn',s:cap,d:`Capture group ${cap}: returns this specific group (0 = whole match, 1 = first () group)`}]:[]),{t:'cp',s:')',d:'Closes match()'}];
    }else if(AID==='d-matchall'){
      const vn=g('mav'),pat=g('mapn'),flags=g('maflags'),idx=g('maidx')||'0';
      expr=`matchAll({{${vn||'VAR'}}}, "${pat||'PATTERN'}", "${flags||''}", ${idx})`;
      parts=[{t:'cf',s:'matchAll(',d:'<strong>matchAll()</strong> finds every occurrence of the pattern, then returns the one at the specified index.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${pat||'...'}"`,d:'Pattern: all occurrences found first'},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${flags||''}"`,d:`Flags: ${flags||'none'}`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:idx,d:`Match index: return occurrence #${idx} (0 = first, 1 = second…)`},{t:'cp',s:')',d:'Closes matchAll()'}];
    }else if(AID==='d-fmtdate'){
      const vn=g('datev')||'Scripter.Raw Customer Call Start Time',fmt=g('datefmt');
      expr=fmt?`formatDate({{${vn}}}, "${fmt}")`:`formatDate({{${vn}}})`;
      parts=[{t:'cf',s:'formatDate(',d:'<strong>formatDate()</strong> converts milliseconds into a readable date/time string in the agent\'s timezone. The Raw variant of a date variable is already in milliseconds — no conversion needed.'},{t:'cv',s:`{{${vn}}}`,d:`Date variable: <code>{{${vn}}}</code> — the <strong>Raw</strong> variant is already a number in milliseconds. Do NOT wrap it in dateToMilliseconds() — that's only for non-Raw (string) date variables.`},{t:'cp',s:')',d:'Closes formatDate()'},...(fmt?[{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${fmt}"`,d:`Custom format: "${fmt}"`}]:[])];
    }else if(AID==='d-fmtdatei'){
      const vn=g('datev2')||'Scripter.Raw Customer Call Start Time';
      expr=`formatDateISO({{${vn}}})`;
      parts=[{t:'cf',s:'formatDateISO(',d:'<strong>formatDateISO()</strong> outputs ISO 8601 format — e.g. 1999-12-31T19:00:00-05:00. Ideal for APIs and system integrations.'},{t:'cv',s:`{{${vn}}}`,d:`Date variable: <code>{{${vn}}}</code> — the Raw variant is already in milliseconds, ready to pass directly.`},{t:'cp',s:')',d:'Closes formatDateISO()'}];
    }else if(AID==='d-fmtdatel'){
      const vn=g('datev3')||'Scripter.Raw Customer Call Start Time',fmt=g('localefmt');
      expr=fmt?`formatLocaleDate({{${vn}}}, "${fmt}")`:`formatLocaleDate({{${vn}}})`;
      parts=[{t:'cf',s:'formatLocaleDate(',d:"<strong>formatLocaleDate()</strong> formats the date using the agent's own system locale and timezone settings. Each agent sees the date in their own regional format."},{t:'cv',s:`{{${vn}}}`,d:`Date variable: <code>{{${vn}}}</code> — Raw variant, already in milliseconds.`},{t:'cp',s:')',d:'Closes formatLocaleDate()'},...(fmt?[{t:'cs',s:`"${fmt}"`,d:`Format: "${fmt}"`}]:[])];
    }else if(AID==='d-fmtdur'){
      const vn=g('durv')||'Scripter.Customer Call Duration';
      expr=`formatDuration(durationToMilliseconds({{${vn}}}))`;
      parts=[{t:'cf',s:'formatDuration(',d:'<strong>formatDuration()</strong> converts milliseconds into a readable time string like 00:04:32.'},{t:'cf',s:'durationToMilliseconds(',d:'<strong>durationToMilliseconds()</strong> converts the raw duration string to milliseconds first.'},{t:'cv',s:`{{${vn}}}`,d:`Duration variable: <code>{{${vn}}}</code>`},{t:'cp',s:'))',d:'Two closing parentheses — innermost function runs first'}];
    }else if(AID==='d-chain'){
      const outer=g('chfn')||'upper',inner=g('chinner')||'trim',vn=g('chv');
      expr=`${outer}(${inner}({{${vn||'VAR'}}}))`;
      parts=[{t:'cf',s:`${outer}(`,d:`<strong>${outer}()</strong> is the OUTER function — it runs second and processes the result of the inner function.`},{t:'cf',s:`${inner}(`,d:`<strong>${inner}()</strong> is the INNER function — it runs first directly on the variable.`},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code> — the innermost function acts on this first`},{t:'cp',s:'))',d:'Two closing parentheses — closes inner function first, then outer'}];
    }else if(AID==='d-summary'){
      expr=`concat("Call: ", {{Scripter.Interaction Id}}, " | Agent: ", {{Scripter.Agent Name}}, " | Type: ", {{Scripter.Interaction Type}}, " | Duration: ", formatDuration(durationToMilliseconds({{Scripter.Customer Call Duration}})))`;
      parts=[{t:'cf',s:'concat(',d:'<strong>concat()</strong> joins all arguments. Uses 4 Scripter built-in variables and a nested duration formatter.'},{t:'cs',s:'"Call: "',d:'Literal label text'},{t:'cp',s:', ',d:'Comma'},{t:'cv',s:'{{Scripter.Interaction Id}}',d:'Unique conversation ID — same as the API conversationId'},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:'" | Agent: "',d:'Literal separator'},{t:'cp',s:', ',d:'Comma'},{t:'cv',s:'{{Scripter.Agent Name}}',d:"Logged-in agent's display name"},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:'" | Type: "',d:'Literal separator'},{t:'cp',s:', ',d:'Comma'},{t:'cv',s:'{{Scripter.Interaction Type}}',d:'Channel type — call, chat, email, etc.'},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:'" | Duration: "',d:'Literal separator'},{t:'cp',s:', ',d:'Comma'},{t:'cf',s:'formatDuration(durationToMilliseconds({{Scripter.Customer Call Duration}}))',d:'Nested function pair: converts raw duration to readable HH:MM:SS'},{t:'cp',s:')',d:'Closes the outer concat()'}];
    }else if(AID==='d-listget'||AID==='l-getindex'){
      const vn=g('lgv'),idx=g('lgidx')||'0';
      expr=`getIndexValue({{${vn||'ListVar'}}}, ${idx})`;
      parts=[{t:'cf',s:'getIndexValue(',d:'<strong>getIndexValue()</strong> retrieves one item from a List variable by its zero-based position.'},{t:'cv',s:`{{${vn||'ListVar'}}}`,d:`List variable: <code>{{${vn||'ListVar'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:idx,d:`Position: ${idx} — position 0 = first item, 1 = second item, etc.`},{t:'cp',s:')',d:'Closes getIndexValue() — returns the item value as a text string'}];
    }else if(AID==='l-indexof'){
      const vn=g('lsv'),srch=g('lsearch');
      expr=`indexOf({{${vn||'ListVar'}}}, "${srch||'value'}")`;
      parts=[{t:'cf',s:'indexOf(',d:'<strong>indexOf()</strong> searches a List variable for a specific value and returns its 0-based position. Returns -1 if not found. Paste into a Dynamic Number variable.'},{t:'cv',s:`{{${vn||'ListVar'}}}`,d:`List variable: <code>{{${vn||'ListVar'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${srch||'value'}"`,d:`Find: "${srch||'value'}" — the value to locate in the list`},{t:'cp',s:')',d:'Closes indexOf() — returns a number (position) or -1'}];
    }else if(AID==='l-push'||AID==='l-count'){
      expr='';bout.innerHTML='<span class="exph">'+( AID==='l-push'?'Push uses the Set Variable action — no expression to copy. See guidance above.':'List positions are zero-based. See the explanation above.')+'</span>';
      renderBD([],'str-bdcontent');return;
    }
  }catch(e){expr='';parts=[];}
  if(expr){bout.textContent=expr;}else{bout.innerHTML='<span class="exph">Fill in the fields above to generate your expression…</span>';}
  renderBD(parts,'str-bdcontent');
}

/* ════════════════════════════════════════════════
   NUMBER BUILDER
════════════════════════════════════════════════ */
const NUM_VT_INFO={
  basic:`<strong>&#128230; Basic Number Variable</strong> — Stores a fixed whole number assigned via the <strong>Set Variable</strong> action. Not computed continuously.<br><strong>Use for:</strong> Counters, scores, quantities, or any number set from an Architect input or data action.<br><strong>Assignments:</strong> Integer (type a whole number) · Math Expression (same syntax as Dynamic Number) · Copy from another numeric variable`,
  dynNum:`<strong>&#9889; Dynamic Number Variable</strong> — Computes its own numeric value at runtime. Recalculates automatically when referenced variables change. Marked ⚡ in the script editor.<br><strong>Use for:</strong> Arithmetic results · Date/duration in milliseconds · Character counts · List positions · Rounding scores · Any value that must be calculated during the interaction.<br><strong>Rule:</strong> Expression must return a <strong>number</strong>. Text or true/false will cause runtime errors.<br><strong>Math functions:</strong> Functions like <code>round()</code>, <code>floor()</code>, <code>ceil()</code>, <code>abs()</code>, <code>min()</code>, <code>max()</code> are called directly without any prefix.`,
  list:`<strong>&#128203; Number List Variable</strong> — Stores <strong>multiple numeric values</strong> as comma-separated items in one field. Created as a List variable with a Number underlying type. Cannot be dynamic.<br><strong>Use for:</strong> Series of call durations · Quiz or survey scores · A set of wait times · Any collection of numeric values that belong together.<br><strong>To add items:</strong> Set Variable action → Push (enter a whole number).<br><strong>To read items:</strong> Use <code>getIndexValue()</code> in a <strong>Dynamic Number</strong> — it returns one number from the list. Use <code>indexOf()</code> in a Dynamic Number to find where a specific value sits.`
};
const NUM_SCENARIOS={
  basic:[
    {id:'nb1',icon:'0️⃣',name:'Set a counter to zero',desc:"Initialize a counter or score variable at 0",rec:'b-int'},
    {id:'nb2',icon:'🔢',name:'Assign a specific number',desc:"Set this variable to a fixed integer value",rec:'b-int'},
    {id:'nb3',icon:'📋',name:'Copy from another number variable',desc:"Set this variable equal to another numeric variable's value",rec:'b-copy'},
    {id:'nb4',icon:'➕',name:'Calculate using a formula',desc:"Use arithmetic to set the value when the action fires",rec:'b-math'},
  ],
  dynNum:[
    {id:'nd1',icon:'➕',name:'Do arithmetic on variables',desc:'Add, subtract, multiply, divide, or raise to a power',rec:'d-arith'},
    {id:'nd2',icon:'🔵',name:'Round a number',desc:'Round to N decimal places using round()',rec:'d-round'},
    {id:'nd3',icon:'📏',name:'Count characters in a variable',desc:'How many characters is this text variable? length()',rec:'d-length'},
    {id:'nd4',icon:'🕐',name:'Convert a string date to milliseconds',desc:'Use with non-Raw date variants — dateToMilliseconds()',rec:'d-datetoms'},
    {id:'nd5',icon:'⏱️',name:'Convert call duration to milliseconds',desc:'For duration comparisons or arithmetic — durationToMilliseconds()',rec:'d-durtoms'},
    {id:'nd6',icon:'🔍',name:'Find where text appears',desc:'Position of a word in a string or list — indexOf()',rec:'d-indexof'},
    {id:'nd7',icon:'📊',name:'Get the absolute value',desc:'Remove the negative sign from a number — abs()',rec:'d-abs'},
    {id:'nd8',icon:'⚖️',name:'Get the min or max of two values',desc:'Return the smaller or larger of two numbers',rec:'d-minmax'},
  ],
  list:[
    {id:'nl1',icon:'➕',name:'Add a number to the list',desc:'Append a numeric value to the end via Push',rec:'ln-push'},
    {id:'nl2',icon:'📖',name:'Read a number at a position',desc:'Retrieve one number by position — getIndexValue()',rec:'ln-getindex'},
    {id:'nl3',icon:'🔍',name:"Find a number's position",desc:'Search for a numeric value and return its position — indexOf()',rec:'ln-indexof'},
    {id:'nl4',icon:'🔢',name:'Understand list positions',desc:'Lists are zero-based: first item is at index 0',rec:'ln-count'},
  ]
};
const NUM_TYPES={
  basic:[
    {id:'b-int',icon:'🔢',name:'Assign an integer',desc:'Type a fixed whole number to store'},
    {id:'b-copy',icon:'📋',name:'Copy from another variable',desc:"Set equal to another numeric variable's value"},
    {id:'b-math',icon:'➕',name:'Assign a math expression',desc:'Calculate at runtime using the same syntax as Dynamic Number'},
  ],
  dynNum:[
    {id:'d-arith',icon:'➕',name:'Arithmetic (+−×÷%^)',desc:'Add, subtract, multiply, divide, modulo, or power'},
    {id:'d-round',icon:'🔵',name:'Round — round()',desc:'Round to N decimal places'},
    {id:'d-abs',icon:'📊',name:'Absolute value — abs()',desc:'Remove negative sign; always returns positive or zero'},
    {id:'d-minmax',icon:'⚖️',name:'Min or Max of two values',desc:'min() returns smaller; max() returns larger'},
    {id:'d-length',icon:'📏',name:'Count characters — length()',desc:'Number of characters in a text variable'},
    {id:'d-indexof',icon:'🔍',name:'Find position — indexOf()',desc:'0-based position of text in a string or list; -1 if not found'},
    {id:'d-datetoms',icon:'🕐',name:'String date → milliseconds',desc:'Convert a non-Raw date string using dateToMilliseconds()'},
    {id:'d-durtoms',icon:'⏱️',name:'Duration → milliseconds',desc:'Convert duration to a number using durationToMilliseconds()'},
    {id:'d-listidx',icon:'📋🔍',name:'Find item in List — indexOf()',desc:'Position of a value in a List variable; -1 if not found'},
  ],
  list:[
    {id:'ln-push',icon:'📋➕',name:'Add number — Push',desc:'Append numeric value via Set Variable action → Push'},
    {id:'ln-getindex',icon:'📋🔎',name:'Read number at position',desc:'getIndexValue() — paste into a Dynamic Number'},
    {id:'ln-indexof',icon:'📋🔍',name:'Find position of number',desc:'indexOf() — find where a specific number sits'},
    {id:'ln-count',icon:'🔢',name:'Understand list positions',desc:'Zero-based indexing — first number is at index 0'},
  ]
};
const NUM_TMPLS={
  basic:[
    {name:'Initialize to zero',desc:'Start a counter at 0',t:'b-int',v:{iv:'0'}},
    {name:'Set a score',desc:'Assign a fixed score value',t:'b-int',v:{iv:'100'}},
    {name:'Set threshold',desc:'Fixed comparison threshold',t:'b-int',v:{iv:'300000'}},
    {name:'Copy call count',desc:'Copy from another number var',t:'b-copy',v:{cv:'CallCount'}},
  ],
  dynNum:[
    {name:'Add two variables',desc:'CallCount + TransferCount',t:'d-arith',v:{aop:'add',av1:'CallCount',av2:'TransferCount'}},
    {name:'Subtract variables',desc:'Total minus Handled',t:'d-arith',v:{aop:'subtract',av1:'Total',av2:'Handled'}},
    {name:'Round a score',desc:'RawScore to 2 decimal places',t:'d-round',v:{rv:'RawScore',rp:'2'}},
    {name:'Round to whole number',desc:'RawScore to 0 decimal places',t:'d-round',v:{rv:'RawScore',rp:'0'}},
    {name:'Absolute value',desc:'abs() on ScoreDelta',t:'d-abs',v:{abv:'ScoreDelta'}},
    {name:'Count characters',desc:'Length of CustomerInput',t:'d-length',v:{lenv:'CustomerInput'}},
    {name:'Check account # length',desc:'Length of AccountNumber',t:'d-length',v:{lenv:'AccountNumber'}},
    {name:'Customer duration ms',desc:'Customer call duration as ms',t:'d-durtoms',v:{durv:'Scripter.Customer Call Duration'}},
    {name:'Agent duration ms',desc:'Agent call duration as ms',t:'d-durtoms',v:{durv:'Scripter.Agent Call Duration'}},
    {name:'Call start ms',desc:'Convert call start time string to ms',t:'d-datetoms',v:{datems:'Scripter.Customer Call Start Time'}},
    {name:'Find Gold in list',desc:'indexOf() on a List variable',t:'d-listidx',v:{lsv:'OptionsList',lsearch:'Gold'}},
    {name:'Find text position',desc:'indexOf() in a string variable',t:'d-indexof',v:{ixv:'FullName',ixsearch:'Smith'}},
    {name:'Max of two values',desc:'max() — larger of two',t:'d-minmax',v:{mmop:'max',mmv1:'WaitTime',mmv2:'0'}},
    {name:'Min of two values',desc:'min() — smaller of two',t:'d-minmax',v:{mmop:'min',mmv1:'Score',mmv2:'100'}},
  ],
  list:[
    {name:'Push a number',desc:'Append numeric value to the list',t:'ln-push',v:{}},
    {name:'Read first score',desc:'getIndexValue position 0',t:'ln-getindex',v:{lgv:'ScoreList',lgidx:'0'}},
    {name:'Read second duration',desc:'getIndexValue position 1',t:'ln-getindex',v:{lgv:'DurationList',lgidx:'1'}},
    {name:'Read third wait time',desc:'getIndexValue position 2',t:'ln-getindex',v:{lgv:'WaitTimeList',lgidx:'2'}},
    {name:'Find 100 in list',desc:'indexOf 100 in ScoreList',t:'ln-indexof',v:{lsv:'ScoreList',lsearch:'100'}},
    {name:'Find 0 in list',desc:'indexOf 0 in ScoreList',t:'ln-indexof',v:{lsv:'ScoreList',lsearch:'0'}},
  ]
};
const MATH_OPTS=[{v:'add',l:'Add ( + )'},{v:'subtract',l:'Subtract ( − )'},{v:'multiply',l:'Multiply ( × )'},{v:'divide',l:'Divide ( ÷ )'},{v:'modulo',l:'Remainder/Modulo ( % )'},{v:'power',l:'Power/Exponent ( ^ ) — e.g. 2^3 = 8'}];
const MATH_SYM={add:'+',subtract:'-',multiply:'*',divide:'/',modulo:'%',power:'^'};
const MATH_LBL={add:'addition (+)',subtract:'subtraction (−)',multiply:'multiplication (×)',divide:'division (÷)',modulo:'modulo — remainder after division (%)',power:'power/exponent (^)'};

let numVT='basic',numAID=null,numASCN=null;
window['__state_num']={};

function setNumVT(vt){
  numVT=vt;numAID=null;numASCN=null;window['__state_num']={};
  ['basic','dyn','list'].forEach(k=>document.getElementById('numtab-'+k).classList.remove('active'));
  document.getElementById('numtab-'+(vt==='dynNum'?'dyn':vt)).classList.add('active');
  const info=document.getElementById('num-vt-info');
  info.className='vt-info '+(vt==='list'?'lst':'num');
  info.innerHTML=NUM_VT_INFO[vt];
  rNumScenarios();rNumTmpls();rNumTypeGrid();clearBuildPfx('num',rNumTypeGrid);
}
function rNumScenarios(){
  const g=document.getElementById('num-scn-grid');g.innerHTML='';
  (NUM_SCENARIOS[numVT]||[]).forEach(s=>{
    const c=document.createElement('button');c.className='scn'+(numASCN===s.id?' sel':'');
    c.innerHTML=`<span class="si">${s.icon}</span><span class="sn">${s.name}</span><span class="sd">${s.desc}</span>`;
    c.onclick=()=>{numASCN=s.id;numAID=s.rec;window['__state_num']={};rNumScenarios();rNumTypeGrid();rNumFields();showBuildPfx('num');document.getElementById('num-step2sub').textContent='★ Best match for your scenario — or choose any type';setTimeout(()=>document.getElementById('num-s2card').scrollIntoView({behavior:'smooth',block:'start'}),120);};
    g.appendChild(c);
  });
}
function rNumTmpls(){
  const g=document.getElementById('num-tmpl-grid');g.innerHTML='';
  (NUM_TMPLS[numVT]||[]).forEach(t=>{
    const b=document.createElement('button');b.className='tbn';
    b.innerHTML=`<strong>${t.name}</strong><span>${t.desc}</span>`;
    b.onclick=()=>{numAID=t.t;window['__state_num']=Object.assign({},t.v);numASCN=null;rNumScenarios();rNumTypeGrid();rNumFields();showBuildPfx('num');};
    g.appendChild(b);
  });
}
function rNumTypeGrid(){
  const g=document.getElementById('num-type-grid');g.innerHTML='';
  const recId=numASCN?(NUM_SCENARIOS[numVT]||[]).find(s=>s.id===numASCN)?.rec:null;
  (NUM_TYPES[numVT]||[]).forEach(t=>{
    const c=document.createElement('button');
    c.className='tyc'+(numAID===t.id?' sel':'')+(t.id===recId&&numAID!==t.id?' rec':'');
    c.innerHTML=`<span class="ti">${t.icon}</span><span class="tn">${t.name}</span><span class="td">${t.desc}</span>`;
    c.onclick=()=>{numAID=t.id;window['__state_num']={};rNumTypeGrid();rNumFields();showBuildPfx('num');};
    g.appendChild(c);
  });
}
function resetNumBuilder(){numASCN=null;numAID=null;window['__state_num']={};rNumScenarios();rNumTmpls();clearBuildPfx('num',rNumTypeGrid);document.getElementById('num-step2sub').textContent='Browse all expression types';}
window['__rFields_num']=()=>rNumFields();
window['__buildOut_num']=()=>rNumBuildOut();

function rNumFields(){
  const f=document.getElementById('num-bfields');
  if(!numAID){f.innerHTML='';return;}
  const allT=[...(NUM_TYPES.basic||[]),...(NUM_TYPES.dynNum||[]),...(NUM_TYPES.list||[])];
  const et=allT.find(x=>x.id===numAID);
  document.getElementById('num-s2sub').textContent=et?et.name:'Fill in the details';
  const p='num';
  const isTwoVal=['add','subtract','multiply','divide','modulo','power'].includes(gv(p,'aop')||'add');
  const M={
    'b-int':fg(p,'iv','What integer (whole number) do you want to store?','Type a whole number — no decimal points.','e.g.  0  or  100  or  -5',false,null,'Basic Number variables store whole integers. For decimal numbers, use a Dynamic Number with round() instead.'),
    'b-copy':fg(p,'cv','Which numeric variable do you want to copy from?','Variable name — no curly braces.','e.g.  CallCount  or  Scripter.Customer Call Duration',false,null,"Copies the current value of that numeric variable at the moment the Set Variable action fires."),
    'b-math':fg(p,'me','Type your math expression:','Variables go in {{curly braces}}. Drop the math. prefix from any math functions.','e.g.  {{CallCount}} + {{TransferCount}}  or  round({{RawScore}}, 2)',false,null,'Uses the same syntax as a Dynamic Number variable. The result is calculated once when the Set Variable action fires.'),
    'd-arith':
      fg(p,'aop','What arithmetic operation do you need?',null,null,true,MATH_OPTS)+
      (isTwoVal
        ? fg(p,'av1','First number or variable:','Variable name (no curly braces) or a plain number.','e.g.  CallCount  or  45')+
          fg(p,'av2','Second number or variable:','Variable name or a plain number.','e.g.  TransferCount  or  10')
        : ''),
    'd-round':
      fg(p,'rv','Which variable do you want to round?','Variable name — no curly braces.','e.g.  RawScore  or  AverageHandleTime',false,null,'round(value, places) — math function. In Genesys Cloud, drop the math. prefix.')+
      fg(p,'rp','How many decimal places?','0 = whole numbers, 1 = one decimal place, 2 = currency-style accuracy.','e.g.  2  or  0'),
    'd-abs':
      fg(p,'abv','Which variable do you want the absolute value of?','Variable name — no curly braces. Returns the number without its negative sign.','e.g.  ScoreDelta  or  TemperatureChange',false,null,'abs() removes the negative sign. abs(-5) = 5. abs(5) = 5. Useful for measuring the magnitude of a difference regardless of direction.'),
    'd-minmax':
      fg(p,'mmop','Which function?',null,null,true,[{v:'min',l:'min() — return the smaller of the two values'},{v:'max',l:'max() — return the larger of the two values'}])+
      fg(p,'mmv1','First value or variable:','Variable name (no curly braces) or a plain number.','e.g.  WaitTime  or  0')+
      fg(p,'mmv2','Second value or variable:','Variable name or a plain number.','e.g.  MaxAllowed  or  300000'),
    'd-length':
      fg(p,'lenv','Which text variable do you want to count characters in?','Variable name — no curly braces. Returns the total character count as a number.','e.g.  CustomerInput  or  AccountNumber',false,null,'length() counts every character including spaces, punctuation, and numbers in the text. Useful for validating input — e.g. checking whether an account number is exactly 8 characters.'),
    'd-indexof':
      fg(p,'ixv','Which variable do you want to search inside?','Variable name — no curly braces. Can be a string or List variable.','e.g.  FullName  or  CustomerNote',false,null,'indexOf() returns a position number. -1 means the text was not found. Pair with a Dynamic Boolean expression like: dv >= 0 to check if it was found.')+
      fg(p,'ixsearch','What text or value are you looking for?','Returns 0-based position, or -1 if not found.','e.g.  Smith  or  @  or  Gold'),
    'd-datetoms':
      `<div class="ftip">&#128161; <strong>When to use this:</strong> <code>dateToMilliseconds()</code> converts a <strong>locale-formatted string</strong> date into a number. Use it with the <strong>non-Raw</strong> date variants (the locale-formatted strings). The Raw variants are <em>already</em> numbers in milliseconds — if you have a Raw variant, you don't need this function at all.</div>`+
      fg(p,'datems','Which date variable do you want to convert?','Use a non-Raw, locale-formatted string date variable. Raw variants are already numbers and do not need conversion.',null,true,DATE_STRING_OPTS,'dateToMilliseconds() takes a string like "01/15/2025 10:30:00 am (-05:00)" and returns a number like 1736955000000 (ms since January 1, 1970). Store in a Dynamic Number for date arithmetic.'),
    'd-durtoms':
      fg(p,'durv','Which duration variable do you want to convert?','Result is milliseconds — use for comparisons or arithmetic.',null,true,DUR_OPTS,'durationToMilliseconds() converts the raw duration string into a plain number. Store in a Dynamic Number to compare durations, build countdown timers, or check whether a threshold has been exceeded.'),
    'd-listidx':
      fg(p,'lsv','Which List variable do you want to search?','List variable name — no curly braces.','e.g.  OptionsList  or  StatusList',false,null,'indexOf() on a List variable searches from left to right for the first occurrence of your value. Returns -1 if the value is not in the list — useful as a "not in list" check.')+
      fg(p,'lsearch','What value are you looking for?','Returns 0-based position, or -1 if the value is not in the list.','e.g.  Gold  or  Active'),
    'ln-push':
      `<div class="fgroup"><label class="flabel">How to add a number to a Number List variable</label>
       <span class="fwhy">&#128161; <strong>Why use Push?</strong> Push is the only way to add items to a List variable at runtime. Each Push appends one numeric value to the end of the list in order.</span>
       <span class="fhint">&#9999;&#65039; In the Genesys Cloud script editor: <strong>Set Variable</strong> action &rarr; select your Number List variable &rarr; choose <strong>Push</strong> &rarr; enter the whole number to add.<br>There is no expression code to copy for Push &mdash; it is configured entirely through the Set Variable action UI.</span></div>`,
    'ln-getindex':
      `<div class="ftip">&#128161; Paste this into a <strong>Dynamic Number</strong> variable &mdash; List variables cannot hold expressions. The result is a number you can do arithmetic with.</div>`+
      fg(p,'lgv','Which Number List variable?','List variable name &mdash; no curly braces.','e.g.  ScoreList  or  DurationList',false,null,'getIndexValue() on a Number List returns the number at the given position. Position 0 = first number. An error occurs if the index is out of range.')+
      fg(p,'lgidx','Which position?','0 = first item, 1 = second, etc.','e.g.  0')+
      `<div class="fgroup"><label class="flabel">Where to use this expression</label><span class="fhint">&#9999;&#65039; Copy the expression below and paste it into a <strong>Dynamic Number</strong> variable's expression field in the script editor. The result will be a plain number.</span></div>`,
    'ln-indexof':
      `<div class="ftip">&#128161; Paste this into a <strong>Dynamic Number</strong> variable. The result is a position number &mdash; not the value itself.</div>`+
      fg(p,'lsv','Which Number List variable?','List variable name &mdash; no curly braces.','e.g.  ScoreList  or  AttemptList',false,null,'indexOf() searches the Number List from left to right for the first occurrence of your numeric value. Returns -1 if not found &mdash; useful as a "not in list" signal.')+
      fg(p,'lsearch','Which numeric value are you looking for?','Returns 0-based position, or -1 if not found. Use a plain number, not a variable reference.','e.g.  100  or  0  or  300000'),
    'ln-count':
      `<div class="fgroup"><label class="flabel">How Number List positions work</label>
       <span class="fhint">&#9999;&#65039; Genesys Cloud List variables do not expose a built-in length function. Numbers are stored in order at zero-based positions. Position 0 = first number. If you try to access a position that does not exist, a runtime error occurs.<br><br>
       <strong>Practical approach:</strong> Track the count separately using a Basic Number variable. Increment it by 1 each time you Push a new value to keep a running total.</span></div>`,
  };
  f.innerHTML=M[numAID]||`<div class="fgroup"><span class="fhint">Select an expression type above to see the fields.</span></div>`;
  ['num-bi-aop','num-bi-mmop','num-bi-datems','num-bi-durv'].forEach(id=>{
    const el=document.getElementById(id);
    const key=id.replace('num-bi-','');
    const st=window['__state_num']||{};
    if(el&&st[key])el.value=st[key];
  });
  rNumBuildOut();
}
function rNumBuildOut(){
  const AID=numAID;
  const g=(id)=>gv('num',id);
  const bout=document.getElementById('num-bout');
  if(!AID){bout.innerHTML='<span class="exph">Pick an expression type above…</span>';renderBD(null,'num-bdcontent');return;}
  let expr='',parts=[];
  try{
    if(AID==='b-int'){
      const v=g('iv');expr=v||'0';
      parts=[{t:'cn',s:expr,d:`The integer value <strong>${expr}</strong> stored directly. Fixed — will not change at runtime unless a Set Variable action updates it.`}];
    }else if(AID==='b-copy'){
      const v=g('cv');expr=v?`{{${v}}}`:'';
      parts=[{t:'cv',s:`{{${v||'VAR'}}}`,d:`Copies the current numeric value of <code>{{${v||'VAR'}}}</code> at the moment the Set Variable action runs.`}];
    }else if(AID==='b-math'){
      const v=g('me');expr=v||'';
      parts=[{t:'cv',s:expr||'...',d:'A math expression calculated once when the Set Variable action fires. Uses the same syntax as a Dynamic Number variable.'}];
    }else if(AID==='d-arith'){
      const op=g('aop')||'add';
      const v1=mkV(g('av1'))||'0',v2=mkV(g('av2'))||'0';
      const sym=MATH_SYM[op];
      expr=`${v1} ${sym} ${v2}`;
      parts=[{t:'cv',s:v1,d:`Left value: ${g('av1')||'first variable or number'}`},{t:'co',s:` ${sym} `,d:`Operator: <strong>${MATH_LBL[op]}</strong>`},{t:'cv',s:v2,d:`Right value: ${g('av2')||'second variable or number'}`}];
    }else if(AID==='d-round'){
      const vn=g('rv'),rp=g('rp')||'2';
      expr=`round({{${vn||'VAR'}}}, ${rp})`;
      parts=[{t:'cf',s:'round(',d:'<strong>round()</strong> — math function. In Genesys Cloud, drop the math. prefix.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Value to round: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:rp,d:`Decimal places: round to ${rp} place${rp==='1'?'':'s'}. Use 0 for whole number rounding.`},{t:'cp',s:')',d:'Closes round()'}];
    }else if(AID==='d-abs'){
      const vn=g('abv');
      expr=`abs({{${vn||'VAR'}}})`;
      parts=[{t:'cf',s:'abs(',d:'<strong>abs()</strong> returns the absolute value — removes the negative sign. abs(-5) = 5, abs(5) = 5.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:')',d:'Closes abs()'}];
    }else if(AID==='d-minmax'){
      const op=g('mmop')||'min';
      const v1=mkV(g('mmv1'))||'0',v2=mkV(g('mmv2'))||'0';
      expr=`${op}(${v1}, ${v2})`;
      parts=[{t:'cf',s:`${op}(`,d:`<strong>${op}()</strong> compares two values and returns the ${op==='min'?'smallest':'largest'} of the two.`},{t:'cv',s:v1,d:`First value: ${g('mmv1')||'first variable or number'}`},{t:'cp',s:', ',d:'Comma'},{t:'cv',s:v2,d:`Second value: ${g('mmv2')||'second variable or number'}`},{t:'cp',s:')',d:`Closes ${op}() — returns the ${op==='min'?'smaller':'larger'} value`}];
    }else if(AID==='d-length'){
      const vn=g('lenv');
      expr=`length({{${vn||'VAR'}}})`;
      parts=[{t:'cf',s:'length(',d:'<strong>length()</strong> counts the total number of characters in the variable\'s text value and returns that count as a number.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable to measure: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:')',d:'Closes length() — result is a whole number'}];
    }else if(AID==='d-indexof'){
      const vn=g('ixv'),srch=g('ixsearch');
      expr=`indexOf({{${vn||'VAR'}}}, "${srch||'text'}")`;
      parts=[{t:'cf',s:'indexOf(',d:'<strong>indexOf()</strong> returns the 0-based position of the search value inside a string or list. Returns -1 if not found. Store in a Dynamic Number variable.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Search inside: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${srch||'text'}"`,d:`Find: "${srch||'text'}"`},{t:'cp',s:')',d:'Closes indexOf() — returns a number (position) or -1'}];
    }else if(AID==='d-datetoms'){
      const vn=g('datems')||'Scripter.Customer Call Start Time';
      expr=`dateToMilliseconds({{${vn}}})`;
      parts=[{t:'cf',s:'dateToMilliseconds(',d:'<strong>dateToMilliseconds()</strong> converts a locale-formatted date string into milliseconds since January 1, 1970. Use with the non-Raw date variants. The Raw variants are already numbers and do not need this function.'},{t:'cv',s:`{{${vn}}}`,d:`Date variable: <code>{{${vn}}}</code>. This is a string like "01/15/2025 10:30:00 am (-05:00)" — dateToMilliseconds() converts it to a plain number.`},{t:'cp',s:')',d:'Closes dateToMilliseconds() — returns a large number (milliseconds since epoch)'}];
    }else if(AID==='d-durtoms'){
      const vn=g('durv')||'Scripter.Customer Call Duration';
      expr=`durationToMilliseconds({{${vn}}})`;
      parts=[{t:'cf',s:'durationToMilliseconds(',d:'<strong>durationToMilliseconds()</strong> converts a raw duration string (like "00:04:32") into a plain number in milliseconds. Use to compare durations, do arithmetic, or build countdown timers.'},{t:'cv',s:`{{${vn}}}`,d:`Duration variable: <code>{{${vn}}}</code>`},{t:'cp',s:')',d:'Closes durationToMilliseconds() — returns total milliseconds'}];
    }else if(AID==='d-listidx'){
      const vn=g('lsv'),srch=g('lsearch');
      expr=`indexOf({{${vn||'ListVar'}}}, "${srch||'value'}")`;
      parts=[{t:'cf',s:'indexOf(',d:'<strong>indexOf()</strong> on a List variable searches for a specific value and returns its 0-based position. Returns -1 if the value is not in the list.'},{t:'cv',s:`{{${vn||'ListVar'}}}`,d:`List variable: <code>{{${vn||'ListVar'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${srch||'value'}"`,d:`Find: "${srch||'value'}" — the item to locate in the list`},{t:'cp',s:')',d:'Closes indexOf() — returns position (0-based) or -1'}];
    }else if(AID==='ln-getindex'){
      const vn=g('lgv'),idx=g('lgidx')||'0';
      expr=`getIndexValue({{${vn||'NumList'}}}, ${idx})`;
      parts=[{t:'cf',s:'getIndexValue(',d:'<strong>getIndexValue()</strong> retrieves the number at the specified position from a Number List. Position 0 = first number.'},{t:'cv',s:`{{${vn||'NumList'}}}`,d:`Number List variable: <code>{{${vn||'NumList'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:idx,d:`Position: ${idx} (0-based — ${idx==='0'?'first item':idx==='1'?'second item':'item #'+(parseInt(idx)+1)})`},{t:'cp',s:')',d:'Closes getIndexValue() — returns the number at that position'}];
    }else if(AID==='ln-indexof'){
      const vn=g('lsv'),srch=g('lsearch')||'0';
      expr=`indexOf({{${vn||'NumList'}}}, ${srch})`;
      parts=[{t:'cf',s:'indexOf(',d:'<strong>indexOf()</strong> on a Number List searches from left to right for the first occurrence of a numeric value. Returns -1 if not found.'},{t:'cv',s:`{{${vn||'NumList'}}}`,d:`Number List variable: <code>{{${vn||'NumList'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:srch,d:`Find: <strong>${srch}</strong> (a numeric value, not quoted)`},{t:'cp',s:')',d:'Closes indexOf() — returns position (0-based) or -1'}];
    }else if(AID==='ln-push'||AID==='ln-count'){
      expr='';bout.innerHTML='<span class="exph">'+(AID==='ln-push'?'Push uses the Set Variable action &mdash; no expression to copy. See guidance above.':'Number List positions are zero-based. See the explanation above.')+'</span>';
    }
  }catch(e){expr='';parts=[];}
  if(expr){bout.textContent=expr;}else if(AID!=='ln-push' && AID!=='ln-count'){bout.innerHTML='<span class="exph">Fill in the fields above to generate your expression…</span>';}
  renderBD(parts,'num-bdcontent');
}

/* ════════════════════════════════════════════════
   BOOLEAN BUILDER
════════════════════════════════════════════════ */
const BOOL_VT_INFO={
  basic:`<strong>&#128230; Basic True/False Variable</strong> — Stores a fixed <strong>true</strong> or <strong>false</strong> value set via the <strong>Set Variable</strong> action.<br><strong>Use for:</strong> Tracking whether an agent completed a step, whether a customer accepted terms, or any simple yes/no flag that gets set by a button click or action.<br><strong>Assignments:</strong> True · False · Expression (any true/false expression) · Copy from another Boolean variable`,
  dynBool:`<strong>&#9889; Dynamic Boolean Variable</strong> — Computes its own <strong>true or false</strong> value at runtime. Recalculates automatically when referenced variables change. Marked ⚡ in the script editor.<br><strong>Use for:</strong> Validating form input · Checking customer tier · Controlling component visibility · Any yes/no decision that must evaluate live during the interaction.<br><strong>Rule:</strong> Expression must return <strong>true or false</strong>. Text or numbers will cause runtime errors.<br><strong>Tip:</strong> Use <code>equal()</code> instead of <code>==</code> for strict, reliable comparisons.`,
  list:`<strong>&#128203; True/False List Variable</strong> — Stores <strong>multiple true/false values</strong> as comma-separated items in one field. Created as a List variable with a True/False underlying type. Cannot be dynamic.<br><strong>Honest note:</strong> Boolean lists are rare in practice — most yes/no flags are better as individual variables. They can be useful for tracking a <em>sequence</em> of results: validation checkpoints, step-completion flags across a multi-step form, or a series of agent confirmations.<br><strong>To add items:</strong> Set Variable action → Push (enter True or False).<br><strong>To read items:</strong> Use <code>getIndexValue()</code> in a <strong>Dynamic Boolean</strong> — it returns one true/false from the list. Use <code>indexOf()</code> in a Dynamic Number to find the first position of a true or false value.`
};
const BOOL_SCENARIOS={
  basic:[
    {id:'bb1',icon:'✅',name:'Set this variable to True',desc:'Explicitly assign the value true',rec:'b-true'},
    {id:'bb2',icon:'❌',name:'Set this variable to False',desc:'Explicitly assign the value false',rec:'b-false'},
    {id:'bb3',icon:'📋',name:'Copy from another Boolean variable',desc:"Set equal to another True/False variable's current value",rec:'b-copy'},
    {id:'bb4',icon:'🔀',name:'Assign a true/false expression',desc:'Evaluate a condition once when the Set Variable action fires',rec:'b-expr'},
  ],
  dynBool:[
    {id:'bd1',icon:'⚖️',name:'Compare a variable to a value',desc:'Check if a variable equals, is greater, or less than something',rec:'d-compare'},
    {id:'bd2',icon:'🟰',name:'Strict equality check',desc:'Check both value AND type using equal()',rec:'d-equal'},
    {id:'bd3',icon:'🔗',name:'Both conditions must be true — AND',desc:'Combine two conditions; returns true only if both are true',rec:'d-and'},
    {id:'bd4',icon:'🔀',name:'Either condition must be true — OR',desc:'Combine two conditions; returns true if at least one is true',rec:'d-or'},
    {id:'bd5',icon:'🚫',name:'Invert a condition — NOT',desc:'Flip a result: true becomes false, false becomes true',rec:'d-not'},
    {id:'bd6',icon:'✅',name:'Validate a value with a pattern',desc:'Does the variable match a regex? — match() returns true/false',rec:'d-validate'},
    {id:'bd7',icon:'📏',name:'Check how long a text variable is',desc:'Compare the character count to a threshold number',rec:'d-length'},
    {id:'bd8',icon:'⏱️',name:'Check whether call duration exceeds a threshold',desc:'Has the call been running longer than X seconds?',rec:'d-dur'},
  ],
  list:[
    {id:'bl1',icon:'➕',name:'Add true or false to the list',desc:'Append a true/false value via Push',rec:'lb-push'},
    {id:'bl2',icon:'📖',name:'Read a value at a position',desc:'Retrieve one true/false by position — getIndexValue()',rec:'lb-getindex'},
    {id:'bl3',icon:'🔍',name:'Find first true or false',desc:'Find the first position where true or false appears — indexOf()',rec:'lb-indexof'},
    {id:'bl4',icon:'🔢',name:'Understand list positions',desc:'Lists are zero-based: first item is at index 0',rec:'lb-count'},
  ]
};
const BOOL_TYPES={
  basic:[
    {id:'b-true',icon:'✅',name:'Set to True',desc:'Explicitly assign the literal value true'},
    {id:'b-false',icon:'❌',name:'Set to False',desc:'Explicitly assign the literal value false'},
    {id:'b-copy',icon:'📋',name:'Copy from another Boolean variable',desc:"Set equal to another True/False variable's value"},
    {id:'b-expr',icon:'🔀',name:'Assign a true/false expression',desc:'Evaluate a condition when the Set Variable action fires'},
  ],
  dynBool:[
    {id:'d-equal',icon:'🟰',name:'Strict equality — equal()',desc:'Check both value AND type — safer than =='},
    {id:'d-compare',icon:'⚖️',name:'Compare a variable',desc:'equals, not equals, greater than, less than, etc.'},
    {id:'d-and',icon:'🔗',name:'AND — both must be true',desc:'Returns true only if both conditions are true'},
    {id:'d-or',icon:'🔀',name:'OR — either must be true',desc:'Returns true if at least one condition is true'},
    {id:'d-not',icon:'🚫',name:'NOT — invert a condition',desc:'Flips true to false and false to true'},
    {id:'d-validate',icon:'✅',name:'Validate with regex — match()',desc:'Does the variable match a pattern? Returns true/false'},
    {id:'d-matchb',icon:'🎯',name:'Pattern match (Boolean) — match()',desc:'Does the variable contain or match a regex? true/false'},
    {id:'d-length',icon:'📏',name:'Check text length',desc:'Compare character count to a target number'},
    {id:'d-dur',icon:'⏱️',name:'Check call duration vs threshold',desc:'Has the call exceeded a time limit?'},
  ],
  list:[
    {id:'lb-push',icon:'📋➕',name:'Add true/false — Push',desc:'Append value via Set Variable action → Push'},
    {id:'lb-getindex',icon:'📋🔎',name:'Read value at position',desc:'getIndexValue() — paste into a Dynamic Boolean'},
    {id:'lb-indexof',icon:'📋🔍',name:'Find first true or first false',desc:'indexOf() — returns position in a Dynamic Number'},
    {id:'lb-count',icon:'🔢',name:'Understand list positions',desc:'Zero-based indexing — first item is at index 0'},
  ]
};
const BOOL_TMPLS={
  basic:[
    {name:'Set True',desc:'Explicitly assign true',t:'b-true',v:{}},
    {name:'Set False',desc:'Explicitly assign false',t:'b-false',v:{}},
    {name:'Copy IsVIP value',desc:'Copy from another Boolean',t:'b-copy',v:{cv:'IsVIP'}},
    {name:'Copy HasAccepted',desc:'Copy acceptance flag',t:'b-copy',v:{cv:'HasAcceptedTerms'}},
  ],
  dynBool:[
    {name:'Is Gold tier?',desc:'CustomerTier equals Gold',t:'d-compare',v:{cmpv:'CustomerTier',cmpop:'equals',cmpval:'Gold'}},
    {name:'Score >= 90?',desc:'Score is at least 90',t:'d-compare',v:{cmpv:'Score',cmpop:'gte',cmpval:'90'}},
    {name:'Strict type check',desc:'equal() both value and type',t:'d-equal',v:{eqv1:'Scripter.Interaction Type',eqv2:'call'}},
    {name:'Is it a call?',desc:'Interaction Type is call',t:'d-compare',v:{cmpv:'Scripter.Interaction Type',cmpop:'equals',cmpval:'call'}},
    {name:'Validate zip code',desc:'Exactly 5 digits — true/false',t:'d-validate',v:{valv:'ZipCode',valpat:'5-digit US zip code'}},
    {name:'Validate email',desc:'Valid email format check',t:'d-validate',v:{valv:'EmailAddress',valpat:'email address'}},
    {name:'Validate 10-digit phone',desc:'10 digits no dashes',t:'d-validate',v:{valv:'PhoneNumber',valpat:'10-digit phone number'}},
    {name:'Validate 8-char account ID',desc:'8 letters or numbers',t:'d-validate',v:{valv:'AccountNumber',valpat:'8-char alphanumeric'}},
    {name:'VIP AND high score',desc:'Both conditions must be true',t:'d-and',v:{andl:'equal({{IsVIP}},true)',andr:'{{Score}} >= 90'}},
    {name:'Call OR callback',desc:'Either channel type',t:'d-or',v:{orl:'equal({{Scripter.Interaction Type}},"call")',orr:'equal({{Scripter.Interaction Type}},"callback")'}},
    {name:'NOT closed',desc:'Status is not closed',t:'d-not',v:{notv:'equal({{Status}},"closed")'}},
    {name:'Call over 5 min?',desc:'Duration > 300,000 ms',t:'d-dur',v:{durv:'Scripter.Customer Call Duration',durthresh:'300000',durop:'gt'}},
    {name:'Exact 8 chars?',desc:'AccountNumber length = 8',t:'d-length',v:{lenv:'AccountNumber',lenop:'equals',lenthresh:'8'}},
    {name:'Input at least 5 chars?',desc:'CustomerInput length >= 5',t:'d-length',v:{lenv:'CustomerInput',lenop:'gte',lenthresh:'5'}},
  ],
  list:[
    {name:'Push true or false',desc:'Append a true/false value',t:'lb-push',v:{}},
    {name:'Read first checkpoint',desc:'getIndexValue position 0',t:'lb-getindex',v:{lgv:'CheckpointList',lgidx:'0'}},
    {name:'Read second result',desc:'getIndexValue position 1',t:'lb-getindex',v:{lgv:'ValidationList',lgidx:'1'}},
    {name:'Read third confirmation',desc:'getIndexValue position 2',t:'lb-getindex',v:{lgv:'ConfirmationList',lgidx:'2'}},
    {name:'Find first true',desc:'Position of first true value',t:'lb-indexof',v:{lsv:'ValidationList',lsearch:'true'}},
    {name:'Find first false',desc:'Position of first false value',t:'lb-indexof',v:{lsv:'CheckpointList',lsearch:'false'}},
  ]
};
const PATS={'5-digit US zip code':'^\\d{5}$','10-digit phone number':'^\\d{10}$','email address':'^[^@]+@[^@]+\\.[^@]+$','numbers only':'^\\d+$','letters only':'^[a-zA-Z]+$','8-char alphanumeric':'^[a-zA-Z0-9]{8}$','1–4 digits':'^\\d{1,4}$'};
const PAT_DESC={'5-digit US zip code':'exactly 5 digits (0–9)','10-digit phone number':'exactly 10 digits with no separators','email address':'a value with @ and a domain','numbers only':'only digit characters, any length','letters only':'only letters A–Z, no numbers or symbols','8-char alphanumeric':'exactly 8 letters or digits','1–4 digits':'between 1 and 4 digit characters'};
const CMP_OPTS=[{v:'equals',l:'exactly equals'},{v:'notequals',l:'does NOT equal'},{v:'gt',l:'is greater than'},{v:'gte',l:'is greater than or equal to'},{v:'lt',l:'is less than'},{v:'lte',l:'is less than or equal to'}];

let boolVT='basic',boolAID=null,boolASCN=null;
window['__state_bool']={};

function setBoolVT(vt){
  boolVT=vt;boolAID=null;boolASCN=null;window['__state_bool']={};
  ['basic','dyn','list'].forEach(k=>document.getElementById('booltab-'+k).classList.remove('active'));
  document.getElementById('booltab-'+(vt==='dynBool'?'dyn':vt)).classList.add('active');
  const info=document.getElementById('bool-vt-info');
  info.className='vt-info '+(vt==='list'?'lst':'bool');
  info.innerHTML=BOOL_VT_INFO[vt];
  rBoolScenarios();rBoolTmpls();rBoolTypeGrid();clearBuildPfx('bool',rBoolTypeGrid);
}
function rBoolScenarios(){
  const g=document.getElementById('bool-scn-grid');g.innerHTML='';
  (BOOL_SCENARIOS[boolVT]||[]).forEach(s=>{
    const c=document.createElement('button');c.className='scn'+(boolASCN===s.id?' sel':'');
    c.innerHTML=`<span class="si">${s.icon}</span><span class="sn">${s.name}</span><span class="sd">${s.desc}</span>`;
    c.onclick=()=>{boolASCN=s.id;boolAID=s.rec;window['__state_bool']={};rBoolScenarios();rBoolTypeGrid();rBoolFields();showBuildPfx('bool');document.getElementById('bool-step2sub').textContent='★ Best match for your scenario — or choose any type';setTimeout(()=>document.getElementById('bool-s2card').scrollIntoView({behavior:'smooth',block:'start'}),120);};
    g.appendChild(c);
  });
}
function rBoolTmpls(){
  const g=document.getElementById('bool-tmpl-grid');g.innerHTML='';
  (BOOL_TMPLS[boolVT]||[]).forEach(t=>{
    const b=document.createElement('button');b.className='tbn';
    b.innerHTML=`<strong>${t.name}</strong><span>${t.desc}</span>`;
    b.onclick=()=>{boolAID=t.t;window['__state_bool']=Object.assign({},t.v);boolASCN=null;rBoolScenarios();rBoolTypeGrid();rBoolFields();showBuildPfx('bool');};
    g.appendChild(b);
  });
}
function rBoolTypeGrid(){
  const g=document.getElementById('bool-type-grid');g.innerHTML='';
  const recId=boolASCN?(BOOL_SCENARIOS[boolVT]||[]).find(s=>s.id===boolASCN)?.rec:null;
  (BOOL_TYPES[boolVT]||[]).forEach(t=>{
    const c=document.createElement('button');
    c.className='tyc'+(boolAID===t.id?' sel':'')+(t.id===recId&&boolAID!==t.id?' rec':'');
    c.innerHTML=`<span class="ti">${t.icon}</span><span class="tn">${t.name}</span><span class="td">${t.desc}</span>`;
    c.onclick=()=>{boolAID=t.id;window['__state_bool']={};rBoolTypeGrid();rBoolFields();showBuildPfx('bool');};
    g.appendChild(c);
  });
}
function resetBoolBuilder(){boolASCN=null;boolAID=null;window['__state_bool']={};rBoolScenarios();rBoolTmpls();clearBuildPfx('bool',rBoolTypeGrid);document.getElementById('bool-step2sub').textContent='Browse all expression types';}
window['__rFields_bool']=()=>rBoolFields();
window['__buildOut_bool']=()=>rBoolBuildOut();

function rBoolFields(){
  const f=document.getElementById('bool-bfields');
  if(!boolAID){f.innerHTML='';return;}
  const allT=[...(BOOL_TYPES.basic||[]),...(BOOL_TYPES.dynBool||[]),...(BOOL_TYPES.list||[])];
  const et=allT.find(x=>x.id===boolAID);
  document.getElementById('bool-s2sub').textContent=et?et.name:'Fill in the details';
  const p='bool';
  const M={
    'b-true':`<div class="fgroup"><label class="flabel">What this does</label><span class="fhint">&#9999;&#65039; Assigns the literal value <strong>true</strong> to the variable. In the script editor: Set Variable action → select your True/False variable → choose <strong>True</strong>. No expression needed.</span></div>`,
    'b-false':`<div class="fgroup"><label class="flabel">What this does</label><span class="fhint">&#9999;&#65039; Assigns the literal value <strong>false</strong> to the variable. In the script editor: Set Variable action → select your True/False variable → choose <strong>False</strong>. No expression needed.</span></div>`,
    'b-copy':fg(p,'cv','Which Boolean variable do you want to copy the value from?','Variable name — no curly braces.','e.g.  IsVIP  or  HasAcceptedTerms',false,null,'Copies the current true/false value of that variable at the moment the Set Variable action fires.'),
    'b-expr':fg(p,'bexpr','Type your true/false expression:','Variables go in {{curly braces}}. Expression must evaluate to true or false.','e.g.  equal({{CustomerTier}},"Gold")  or  {{Score}} >= 90',false,null,'Uses the same syntax as a Dynamic Boolean variable. The result is calculated once when the Set Variable action fires — it does not recalculate automatically.'),
    'd-equal':
      fg(p,'eqv1','First value to compare:','Variable name (no curly braces) or a quoted literal.','e.g.  CustomerTier  or  Scripter.Interaction Type',false,null,'equal() checks both value AND type. This makes it safer than == which only checks value and can give unexpected results when comparing strings and numbers.  equal(1,"1") returns false because the types differ.')+
      `<div class="fgroup"><label class="flabel">How equal() differs from ==</label><span class="fhint">&#9999;&#65039; <strong>equal(a,b)</strong> checks value AND type. <code>equal(1,"1")</code> → <strong>false</strong> (number vs string). <code>1 == "1"</code> → <strong>true</strong> (value only). Use equal() for reliable, predictable comparisons.</span></div>`+
      fg(p,'eqv2','Second value to compare it to:','Text values are automatically quoted. Numbers used as-is.','e.g.  Gold  or  active  or  call'),
    'd-compare':
      fg(p,'cmpv','Which variable are you checking?','Variable name — no curly braces.','e.g.  Score  or  CustomerTier  or  Scripter.Interaction Type',false,null,'ifElse() and comparison operators re-evaluate automatically whenever any referenced variable changes — so this Dynamic Boolean updates live during the interaction.')+
      fg(p,'cmpop','How do you want to compare it?',null,null,true,OP_OPTS)+
      fg(p,'cmpval','Compare it to this value:','Text is automatically quoted. Numbers used as-is.','e.g.  Gold  or  90  or  call'),
    'd-and':
      fg(p,'andl','First condition (left side of AND):','Type a complete true/false expression. Variables go in {{curly braces}}.','e.g.  equal({{IsVIP}},true)  or  {{Score}} >= 90',false,null,'The AND operator returns true ONLY IF both conditions are true. If either is false, the overall result is false.')+
      fg(p,'andr','Second condition (right side of AND):','Both this AND the first condition must be true for the result to be true.','e.g.  equal({{CustomerTier}},"Gold")  or  {{Score}} >= 70'),
    'd-or':
      fg(p,'orl','First condition (left side of OR):','Type a complete true/false expression.','e.g.  equal({{Type}},"call")  or  {{Score}} >= 90',false,null,'The OR operator returns true if AT LEAST ONE condition is true. Both being true also returns true. Only returns false when BOTH conditions are false.')+
      fg(p,'orr','Second condition (right side of OR):','If either this OR the first condition is true, the result is true.','e.g.  equal({{Type}},"callback")  or  {{Score}} >= 70'),
    'd-not':
      fg(p,'notv','Condition to invert:','Type a complete true/false expression. NOT flips the result.','e.g.  equal({{Status}},"closed")  or  {{Score}} >= 90',false,null,'NOT inverts whatever comes after it. NOT true → false. NOT false → true. Use it to express negative conditions — "is not X" or "has not happened."'),
    'd-validate':
      fg(p,'valv','Which variable do you want to validate?','Variable name — no curly braces.','e.g.  ZipCode  or  PhoneNumber  or  AccountNumber',false,null,'match() in a Dynamic Boolean checks whether the variable fits the pattern and returns true if it matches, false if it does not. Perfect for validating agent input before submitting it to a data action.')+
      fg(p,'valpat','What format are you checking for?',null,null,true,[
        {v:'5-digit US zip code',l:'5-digit US zip code (e.g. 32202)'},
        {v:'10-digit phone number',l:'10-digit phone — digits only, no dashes or spaces'},
        {v:'email address',l:'Email address (e.g. user@domain.com)'},
        {v:'numbers only',l:'Numbers only — any length'},
        {v:'letters only',l:'Letters only A–Z — no numbers or symbols'},
        {v:'8-char alphanumeric',l:'Exactly 8 letters or numbers — common for account IDs'},
        {v:'1–4 digits',l:'Between 1 and 4 digits — short codes or agent IDs'},
        {v:'custom',l:'Custom regex — I will type my own pattern'},
      ])+(gv(p,'valpat')==='custom'?fg(p,'valcustom','Your custom regex pattern:','Returns true if the variable matches, false if it does not.','e.g.  ^[A-Z]{3}\\d{4}$'):''),
    'd-matchb':
      fg(p,'mbv','Which variable do you want to check?','Variable name — no curly braces.','e.g.  CustomerNote  or  Description',false,null,'match() in a Dynamic Boolean returns true if the variable contains or matches the pattern anywhere in its text (unless you anchor with ^ and $).')+
      fg(p,'mbpat','Regex pattern to check for:','Returns true if the variable matches this pattern anywhere.','e.g.  \\d{5}  or  Gold  or  ^[A-Z]')+
      fg(p,'mbflags','Flags (optional):','<code>i</code> = case-insensitive so "Gold" also matches "gold" and "GOLD".','e.g.  i  or leave blank'),
    'd-length':
      fg(p,'lenv','Which variable\'s length do you want to check?','Variable name — no curly braces.','e.g.  AccountNumber  or  PhoneNumber',false,null,'length() counts characters. Combined with a comparison operator, it creates a condition — e.g. "is this input exactly 8 characters long?"')+
      fg(p,'lenop','How do you want to compare the length?',null,null,true,CMP_OPTS)+
      fg(p,'lenthresh','Compare to this number of characters:','The expression returns true if the character count meets this condition.','e.g.  10  or  8  or  5'),
    'd-dur':
      fg(p,'durv','Which duration variable do you want to check?','Select the built-in duration variable.',null,true,DUR_OPTS,null)+
      fg(p,'durop','How do you want to compare the duration?',null,null,true,CMP_OPTS)+
      fg(p,'durthresh','Compare to this many milliseconds:','5 minutes = 300,000 ms. 1 minute = 60,000 ms. 30 seconds = 30,000 ms.','e.g.  300000  for 5 minutes'),
    'lb-push':
      `<div class="fgroup"><label class="flabel">How to add a true/false value to a Boolean List variable</label>
       <span class="fwhy">&#128161; <strong>Why use Push?</strong> Push is the only way to add items to a List variable at runtime. Each Push appends one true/false value to the end of the list in order.</span>
       <span class="fhint">&#9999;&#65039; In the Genesys Cloud script editor: <strong>Set Variable</strong> action &rarr; select your Boolean List variable &rarr; choose <strong>Push</strong> &rarr; enter <strong>true</strong> or <strong>false</strong>.<br>There is no expression code to copy for Push &mdash; it is configured entirely through the Set Variable action UI.</span></div>`,
    'lb-getindex':
      `<div class="ftip">&#128161; Paste this into a <strong>Dynamic Boolean</strong> variable &mdash; List variables cannot hold expressions. The result is a true or false you can use in conditions.</div>`+
      fg(p,'lgv','Which Boolean List variable?','List variable name &mdash; no curly braces.','e.g.  CheckpointList  or  ValidationList',false,null,'getIndexValue() on a Boolean List returns the true/false at the given position. Position 0 = first item. An error occurs if the index is out of range.')+
      fg(p,'lgidx','Which position?','0 = first item, 1 = second, etc.','e.g.  0')+
      `<div class="fgroup"><label class="flabel">Where to use this expression</label><span class="fhint">&#9999;&#65039; Copy the expression below and paste it into a <strong>Dynamic Boolean</strong> variable's expression field in the script editor. The result will be true or false.</span></div>`,
    'lb-indexof':
      `<div class="ftip">&#128161; Paste this into a <strong>Dynamic Number</strong> variable. The result is a position number &mdash; not true/false.</div>`+
      fg(p,'lsv','Which Boolean List variable?','List variable name &mdash; no curly braces.','e.g.  ValidationList  or  CheckpointList',false,null,'indexOf() on a Boolean List scans from left to right looking for the first true (or first false) and returns its position. Returns -1 if no match. Useful for answering questions like "which step failed first?"')+
      fg(p,'lsearch','Looking for true or false?','Enter <strong>true</strong> to find the first true, or <strong>false</strong> to find the first false. Returns 0-based position, or -1 if not found.',null,true,[{v:'true',l:'true — find first true value'},{v:'false',l:'false — find first false value'}]),
    'lb-count':
      `<div class="fgroup"><label class="flabel">How Boolean List positions work</label>
       <span class="fhint">&#9999;&#65039; Genesys Cloud List variables do not expose a built-in length function. True/false values are stored in order at zero-based positions. Position 0 = first item. If you try to access a position that does not exist, a runtime error occurs.<br><br>
       <strong>Practical approach:</strong> Track the count separately using a Basic Number variable. Increment it by 1 each time you Push a new value to keep a running total.<br><br>
       <strong>Honest caveat:</strong> If you find yourself using a Boolean List, double-check whether individual Boolean variables would be clearer. Boolean Lists are most useful for <em>sequences</em> (step 1 result, step 2 result, step 3 result) where order matters.</span></div>`,
  };
  f.innerHTML=M[boolAID]||`<div class="fgroup"><span class="fhint">Select an expression type above to see the fields.</span></div>`;
  ['bool-bi-cmpop','bool-bi-lenop','bool-bi-durop','bool-bi-durv','bool-bi-valpat'].forEach(id=>{
    const el=document.getElementById(id);
    const key=id.replace('bool-bi-','');
    const st=window['__state_bool']||{};
    if(el&&st[key])el.value=st[key];
  });
  rBoolBuildOut();
}

function explRgx(p){
  const i=[];
  if(p.startsWith('^'))i.push('<code>^</code> = anchors the start — must begin here');
  if(p.endsWith('$'))i.push('<code>$</code> = anchors the end — must finish here');
  if(p.includes('\\d'))i.push('<code>\\d</code> = any digit character (0–9)');
  if(p.includes('[a-zA-Z0-9]'))i.push('<code>[a-zA-Z0-9]</code> = any letter or digit');
  if(p.includes('[a-zA-Z]'))i.push('<code>[a-zA-Z]</code> = any letter A–Z');
  if(p.includes('[^@]'))i.push('<code>[^@]</code> = any character that is NOT @');
  if(p.includes('\\.'))i.push('<code>\\.</code> = a literal dot character');
  const q=p.match(/\{(\d+),?(\d+)?\}/);
  if(q)i.push(q[2]?`<code>{${q[1]},${q[2]}}</code> = between ${q[1]} and ${q[2]} of the previous`:`<code>{${q[1]}}</code> = exactly ${q[1]} of the previous`);
  if(p.includes('+'))i.push('<code>+</code> = one or more of the previous');
  return i.length?i.join('; '):'See Genesys Cloud documentation for regex details.';
}

function rBoolBuildOut(){
  const AID=boolAID;
  const g=(id)=>gv('bool',id);
  const bout=document.getElementById('bool-bout');
  if(!AID){bout.innerHTML='<span class="exph">Pick an expression type above…</span>';renderBD(null,'bool-bdcontent');return;}
  let expr='',parts=[];
  const symD={equals:'equal(…)',notequals:'NOT equal(…)',gt:'>',gte:'>=',lt:'<',lte:'<='};
  try{
    if(AID==='b-true'){
      expr='true';
      parts=[{t:'cn',s:'true',d:'The literal boolean value <strong>true</strong>. In the Set Variable action, select True from the dropdown — no expression needed.'}];
    }else if(AID==='b-false'){
      expr='false';
      parts=[{t:'cn',s:'false',d:'The literal boolean value <strong>false</strong>. In the Set Variable action, select False from the dropdown — no expression needed.'}];
    }else if(AID==='b-copy'){
      const v=g('cv');expr=v?`{{${v}}}`:'';
      parts=[{t:'cv',s:`{{${v||'VAR'}}}`,d:`Copies the current true/false value of <code>{{${v||'VAR'}}}</code> at the moment the Set Variable action fires.`}];
    }else if(AID==='b-expr'){
      expr=g('bexpr')||'';
      parts=[{t:'cv',s:expr||'...',d:'A true/false expression evaluated once when the Set Variable action fires. Uses the same syntax as a Dynamic Boolean variable.'}];
    }else if(AID==='d-equal'){
      const v1=g('eqv1'),v2=g('eqv2');
      const a=mkV(v1)||'"..."',b=mkVal(v2)||'"..."';
      expr=`equal(${a}, ${b})`;
      parts=[{t:'cf',s:'equal(',d:'<strong>equal()</strong> performs a strict comparison — checks both VALUE and TYPE. More reliable than == for comparisons between strings and numbers.'},{t:'cv',s:a,d:`First value: ${v1||'...'}`},{t:'cp',s:', ',d:'Comma'},{t:'cv',s:b,d:`Second value: ${v2||'...'}`},{t:'cp',s:')',d:'Closes equal() — returns true if both value AND type match, false otherwise'}];
    }else if(AID==='d-compare'){
      const vn=g('cmpv'),op=g('cmpop')||'equals',cv=g('cmpval');
      expr=mkCond(vn||'VAR',op,cv);
      parts=[{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable being tested: <code>{{${vn||'VAR'}}}</code> — its current value is retrieved at runtime`},{t:'co',s:` ${symD[op]||'='} `,d:`Comparison: ${OP_LBL[op]||'equals'} — evaluates to true or false`},{t:'cs',s:mkVal(cv)||'"..."',d:`Compare against: ${cv||'...'}`}];
    }else if(AID==='d-and'){
      const l=g('andl'),r=g('andr');
      expr=`${l||'CONDITION_1'} AND ${r||'CONDITION_2'}`;
      parts=[{t:'cv',s:l||'CONDITION_1',d:'<strong>First condition (left side):</strong> This entire expression must evaluate to true.'},{t:'co',s:' AND ',d:'<strong>AND operator</strong> — the overall result is true ONLY IF both the left AND right conditions are both true. If either is false, the result is false.'},{t:'cv',s:r||'CONDITION_2',d:'<strong>Second condition (right side):</strong> This must also be true for the overall result to be true.'}];
    }else if(AID==='d-or'){
      const l=g('orl'),r=g('orr');
      expr=`${l||'CONDITION_1'} OR ${r||'CONDITION_2'}`;
      parts=[{t:'cv',s:l||'CONDITION_1',d:'<strong>First condition:</strong> If this is true, the overall result is true regardless of the right side.'},{t:'co',s:' OR ',d:'<strong>OR operator</strong> — the overall result is true if AT LEAST ONE condition is true. Only returns false when BOTH conditions are false.'},{t:'cv',s:r||'CONDITION_2',d:'<strong>Second condition:</strong> If this is true, the overall result is true regardless of the left side.'}];
    }else if(AID==='d-not'){
      const v=g('notv');
      expr=`NOT (${v||'CONDITION'})`;
      parts=[{t:'co',s:'NOT ',d:'<strong>NOT operator</strong> — inverts the result of whatever follows. True becomes false; false becomes true.'},{t:'cp',s:'(',d:'Opening parenthesis — groups the condition being inverted'},{t:'cv',s:v||'CONDITION',d:`Condition to invert: ${v||'your true/false expression'}`},{t:'cp',s:')',d:'Closing parenthesis'}];
    }else if(AID==='d-validate'){
      const vn=g('valv'),pat=g('valpat')||'5-digit US zip code';
      const regex=pat==='custom'?(g('valcustom')||'YOUR_PATTERN'):(PATS[pat]||'.*');
      expr=`match({{${vn||'VAR'}}}, "${regex}")`;
      parts=[{t:'cf',s:'match(',d:'<strong>match()</strong> in a Dynamic Boolean tests whether the variable fits the pattern. Returns <strong>true</strong> if it matches, <strong>false</strong> if it does not.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable to validate: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${regex}"`,d:`Pattern: checks for ${PAT_DESC[pat]||'your custom pattern'}.<br><strong>Breakdown:</strong> ${explRgx(regex)}`},{t:'cp',s:')',d:'Closes match() — result is true or false'}];
    }else if(AID==='d-matchb'){
      const vn=g('mbv'),pat=g('mbpat'),flags=g('mbflags');
      const args=[`{{${vn||'VAR'}}}`,`"${pat||'PATTERN'}"`,...(flags?[`"${flags}"`]:[])];
      expr=`match(${args.join(', ')})`;
      parts=[{t:'cf',s:'match(',d:'<strong>match()</strong> in a Dynamic Boolean returns true if the variable contains or matches the pattern, and false if it does not.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable to check: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${pat||'...'}"`,d:'Pattern: returns true if the variable matches this regex'},...(flags?[{t:'cp',s:', ',d:'Comma'},{t:'cs',s:`"${flags}"`,d:`Flag: "${flags}"${flags==='i'?' — enables case-insensitive matching so Gold matches gold, GOLD, etc.':''}`}]:[]),{t:'cp',s:')',d:'Closes match() — returns true or false'}];
    }else if(AID==='d-length'){
      const vn=g('lenv'),op=g('lenop')||'equals',thresh=g('lenthresh')||'0';
      const symD2={equals:'==',notequals:'!=',gt:'>',gte:'>=',lt:'<',lte:'<='};
      if(op==='equals'){
        expr=`equal(length({{${vn||'VAR'}}}) , ${thresh})`;
        parts=[{t:'cf',s:'equal(',d:'<strong>equal()</strong> checks if two values are exactly equal.'},{t:'cf',s:'length(',d:'<strong>length()</strong> counts the total characters in the variable.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:')',d:"Closes length() — produces the character count"},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:thresh,d:`Target: ${thresh} characters. Returns true if length is exactly ${thresh}.`},{t:'cp',s:')',d:'Closes equal() — returns true or false'}];
      }else{
        expr=`length({{${vn||'VAR'}}}) ${symD2[op]} ${thresh}`;
        parts=[{t:'cf',s:'length(',d:'<strong>length()</strong> counts the total characters in the variable.'},{t:'cv',s:`{{${vn||'VAR'}}}`,d:`Variable: <code>{{${vn||'VAR'}}}</code>`},{t:'cp',s:')',d:'Closes length() — produces the character count'},{t:'co',s:` ${symD2[op]} `,d:`Comparison: ${OP_LBL[op]||'compared to'} — evaluates to true or false`},{t:'cn',s:thresh,d:`Target: ${thresh} characters`}];
      }
    }else if(AID==='d-dur'){
      const vn=g('durv')||'Scripter.Customer Call Duration',op=g('durop')||'gt',thresh=g('durthresh')||'300000';
      const symD2={equals:'==',notequals:'!=',gt:'>',gte:'>=',lt:'<',lte:'<='};
      expr=`durationToMilliseconds({{${vn}}}) ${symD2[op]} ${thresh}`;
      const mins=((parseInt(thresh)||0)/60000).toFixed(1);
      parts=[{t:'cf',s:'durationToMilliseconds(',d:'<strong>durationToMilliseconds()</strong> converts the raw duration string into a plain number (milliseconds). This makes it possible to compare durations mathematically.'},{t:'cv',s:`{{${vn}}}`,d:`Duration variable: <code>{{${vn}}}</code>`},{t:'cp',s:')',d:'Closes durationToMilliseconds() — returns a number'},{t:'co',s:` ${symD2[op]} `,d:`Comparison: ${OP_LBL[op]||'compared to'} — evaluates to true or false`},{t:'cn',s:thresh,d:`Threshold: ${thresh} milliseconds (~${mins} minute${mins==='1.0'?'':'s'}). Returns true if the duration ${OP_LBL[op]||'equals'} this value.`}];
    }else if(AID==='lb-getindex'){
      const vn=g('lgv'),idx=g('lgidx')||'0';
      expr=`getIndexValue({{${vn||'BoolList'}}}, ${idx})`;
      parts=[{t:'cf',s:'getIndexValue(',d:'<strong>getIndexValue()</strong> retrieves the true/false at the specified position from a Boolean List. Position 0 = first item.'},{t:'cv',s:`{{${vn||'BoolList'}}}`,d:`Boolean List variable: <code>{{${vn||'BoolList'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cn',s:idx,d:`Position: ${idx} (0-based — ${idx==='0'?'first item':idx==='1'?'second item':'item #'+(parseInt(idx)+1)})`},{t:'cp',s:')',d:'Closes getIndexValue() — returns true or false'}];
    }else if(AID==='lb-indexof'){
      const vn=g('lsv'),srch=g('lsearch')||'true';
      expr=`indexOf({{${vn||'BoolList'}}}, ${srch})`;
      parts=[{t:'cf',s:'indexOf(',d:'<strong>indexOf()</strong> on a Boolean List scans from left to right for the first occurrence of true or false and returns its 0-based position. Returns -1 if no match.'},{t:'cv',s:`{{${vn||'BoolList'}}}`,d:`Boolean List variable: <code>{{${vn||'BoolList'}}}</code>`},{t:'cp',s:', ',d:'Comma'},{t:'cv',s:srch,d:`Find the first <strong>${srch}</strong> value in the list (not quoted — true/false are keywords, not strings)`},{t:'cp',s:')',d:'Closes indexOf() — returns position (0-based) or -1'}];
    }else if(AID==='lb-push'||AID==='lb-count'){
      expr='';bout.innerHTML='<span class="exph">'+(AID==='lb-push'?'Push uses the Set Variable action &mdash; no expression to copy. See guidance above.':'Boolean List positions are zero-based. See the explanation above.')+'</span>';
    }
  }catch(e){expr='';parts=[];}
  if(AID==='b-true'){bout.textContent='true';}
  else if(AID==='b-false'){bout.textContent='false';}
  else if(expr){bout.textContent=expr;}
  else{bout.innerHTML='<span class="exph">Fill in the fields above to generate your expression…</span>';}
  renderBD(parts,'bool-bdcontent');
}

/* ════════════════════════════════════════════════
   EXPRESSION CHECKER — static validation
════════════════════════════════════════════════ */
const KNOWN_FUNCTIONS=[
  // Genesys-specific string functions
  'concat','upper','lower','trim','replace','substring','substr','slice','indexOf','length',
  'ifElse','equal','match','matchAll','getIndexValue',
  // Date / duration
  'formatDate','formatDateISO','formatLocaleDate','formatDuration','dateToMilliseconds','durationToMilliseconds',
  // Numeric / math functions usable directly in Genesys Cloud dynamic expressions
  'round','floor','ceil','abs','min','max','sqrt','pow','mod','sign','exp','log',
  'add','subtract','multiply','divide','sum','mean','median','random',
  'number','string','boolean','parseFloat','parseInt','isNaN','isFinite','typeof'
];
const BOOL_KEYWORDS=['AND','OR','NOT','XOR'];

function runChecker(){
  const input=document.getElementById('chk-input');
  const out=document.getElementById('chk-results');
  const expr=input.value;
  if(!expr.trim()){
    out.innerHTML='<div class="chk-result chk-err"><strong>Empty expression.</strong> Paste an expression into the box above first.</div>';
    return;
  }
  const results=[];
  const push=(level,msg)=>results.push({level,msg});

  // Track correction state
  let corrected = expr;
  const corrections = []; // [{type, desc}]

  // --- Strip string literals for structural analysis (but note their positions) ---
  let inStr=false,strChar='',strStart=-1;
  let parenDepth=0,bracketDepth=0;
  let braceOpens=0,braceCloses=0;
  let singleBraceWarn=false;
  let singleBracePositions=[]; // for auto-correct
  let unterminatedString=false;
  let stripped='';
  const len=expr.length;
  for(let i=0;i<len;i++){
    const ch=expr[i],next=expr[i+1];
    if(inStr){
      if(ch==='\\' && i+1<len){i++;stripped+='  ';continue;}
      if(ch===strChar){inStr=false;stripped+=ch;continue;}
      stripped+=' ';
      continue;
    }
    if(ch==='"'||ch==="'"){inStr=true;strChar=ch;strStart=i;stripped+=ch;continue;}
    if(ch==='{' && next==='{'){braceOpens++;stripped+='  ';i++;continue;}
    if(ch==='}' && next==='}'){braceCloses++;stripped+='  ';i++;continue;}
    if(ch==='{' || ch==='}'){singleBraceWarn=true;singleBracePositions.push(i);stripped+=ch;continue;}
    if(ch==='(')parenDepth++;
    else if(ch===')')parenDepth--;
    if(ch==='[')bracketDepth++;
    else if(ch===']')bracketDepth--;
    stripped+=ch;
    if(parenDepth<0){push('err','Unmatched closing parenthesis <code>)</code> at position '+i+'. Too many closing parens before the corresponding open paren.');parenDepth=0;}
    if(bracketDepth<0){push('err','Unmatched closing bracket <code>]</code> at position '+i+'.');bracketDepth=0;}
  }
  if(inStr){unterminatedString=true;push('err','Unterminated string literal starting at position '+strStart+'. Missing closing <code>'+strChar+'</code>.');}
  if(parenDepth>0){
    push('err','Missing '+parenDepth+' closing parenthesis <code>)</code> &mdash; parens are unbalanced.');
    // AUTO-CORRECT L1: append missing closing parens
    corrected = corrected + ')'.repeat(parenDepth);
    corrections.push({type:'added', desc:'Added '+parenDepth+' missing closing parenthesis'+(parenDepth>1?'es':'')+' at the end'});
  }
  if(bracketDepth>0){
    push('err','Missing '+bracketDepth+' closing bracket <code>]</code>.');
    corrected = corrected + ']'.repeat(bracketDepth);
    corrections.push({type:'added', desc:'Added '+bracketDepth+' missing closing bracket'+(bracketDepth>1?'s':'')});
  }
  if(braceOpens!==braceCloses){
    push('err','Unbalanced <code>{{</code> and <code>}}</code>: '+braceOpens+' opens vs '+braceCloses+' closes. Every variable reference must be wrapped like <code>{{Name}}</code>.');
    // AUTO-CORRECT L1: add missing closing }}
    if(braceOpens > braceCloses){
      const diff = braceOpens - braceCloses;
      corrected = corrected + '}}'.repeat(diff);
      corrections.push({type:'added', desc:'Added '+diff+' missing closing <code>}}</code>'});
    }
  }
  if(singleBraceWarn){
    push('err','Single <code>{</code> or <code>}</code> found. Genesys Cloud variables require <strong>double</strong> curly braces: <code>{{VariableName}}</code>.');
    // AUTO-CORRECT L1: only if it looks like a clear single-brace variable wrapper like {Name} -> {{Name}}
    const singleBraceVarRe = /(^|[^{])\{([A-Za-z_][A-Za-z0-9_. ]*)\}([^}]|$)/g;
    if(singleBraceVarRe.test(corrected)){
      corrected = corrected.replace(/(^|[^{])\{([A-Za-z_][A-Za-z0-9_. ]*)\}([^}]|$)/g, (m, pre, name, post) => pre + '{{' + name + '}}' + post);
      corrections.push({type:'fixed', desc:'Converted single <code>{Variable}</code> to double <code>{{Variable}}</code>'});
    }
  }

  // --- Known-function check ---
  const unknownFns=new Set(),knownFnsUsed=new Set();
  const fnRe=/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  let m;
  while((m=fnRe.exec(stripped))!==null){
    const name=m[1];
    if(BOOL_KEYWORDS.includes(name))continue;
    if(KNOWN_FUNCTIONS.includes(name))knownFnsUsed.add(name);
    else unknownFns.add(name);
  }
  if(unknownFns.size){
    const list=[...unknownFns].map(f=>'<code>'+f+'()</code>').join(', ');
    push('warn','Unknown function(s): '+list+'. These are not in the Genesys Cloud built-in function list. Check for typos or verify against the reference.');
  }

  // --- math. prefix check --- (LEGACY note, we'll flag and AUTO-CORRECT L1)
  if(/\bmath\.[A-Za-z_]/.test(stripped)){
    push('err','Found <code>math.</code> prefix on a function call. Genesys Cloud functions are called <em>without</em> a <code>math.</code> prefix &mdash; for example <code>math.round(x,2)</code> should be just <code>round(x,2)</code>.');
    // AUTO-CORRECT L1
    corrected = corrected.replace(/\bmath\.(\w+)/g, '$1');
    corrections.push({type:'fixed', desc:'Removed the <code>math.</code> prefix from function calls'});
  }

  // --- JavaScript-style boolean operators --- AUTO-CORRECT L1
  if(/&&/.test(stripped)){
    push('warn','Found <code>&amp;&amp;</code>. Genesys Cloud uses <code>AND</code> as the boolean AND keyword.');
    corrected = corrected.replace(/&&/g, ' AND ').replace(/\s+/g,' ');
    corrections.push({type:'fixed', desc:'Replaced <code>&amp;&amp;</code> with <code>AND</code>'});
  }
  if(/\|\|/.test(stripped)){
    push('warn','Found <code>||</code>. Genesys Cloud uses <code>OR</code> as the boolean OR keyword.');
    corrected = corrected.replace(/\|\|/g, ' OR ').replace(/\s+/g,' ');
    corrections.push({type:'fixed', desc:'Replaced <code>||</code> with <code>OR</code>'});
  }
  if(/(^|[\s(,])!(?!=)/.test(stripped)){
    push('warn','Found <code>!</code> (negation). Genesys Cloud uses <code>NOT</code> as the boolean negation keyword.');
    // AUTO-CORRECT L1: replace !X with NOT X but only in safe contexts
    corrected = corrected.replace(/(^|[\s(,])!(?!=)/g, '$1NOT ');
    corrections.push({type:'fixed', desc:'Replaced <code>!</code> with <code>NOT</code>'});
  }

  // --- Empty argument check ---
  if(/\(\s*,/.test(stripped))push('err','Empty first argument detected &mdash; <code>(,</code>. A comma with no preceding value is invalid.');
  if(/,\s*,/.test(stripped))push('err','Empty argument between two commas &mdash; <code>, ,</code>. Every argument must have a value.');
  if(/,\s*\)/.test(stripped))push('err','Trailing comma with no value before <code>)</code>. Remove the extra comma.');

  // --- L1: dateToMilliseconds wrapped around a Raw date variable (anti-pattern) ---
  // The Raw variants (Scripter.Raw Customer Call Start Time, etc.) are already numbers
  // in milliseconds. Wrapping them in dateToMilliseconds() — which expects a string —
  // produces a runtime error in Genesys Cloud.
  if(/dateToMilliseconds\s*\(\s*\{\{\s*Scripter\.Raw\s/.test(expr)){
    push('err','Found <code>dateToMilliseconds()</code> wrapped around a <code>Scripter.Raw ...</code> date variable. The Raw variants are <strong>already numbers in milliseconds</strong> &mdash; passing them to <code>dateToMilliseconds()</code> (which expects a string) causes a runtime error. Pass the Raw variant directly to <code>formatDate()</code> instead.');
    // AUTO-CORRECT L1: strip the dateToMilliseconds() wrapper
    corrected = corrected.replace(/dateToMilliseconds\s*\(\s*(\{\{\s*Scripter\.Raw[^}]*\}\})\s*\)/g, '$1');
    corrections.push({type:'fixed', desc:'Removed <code>dateToMilliseconds()</code> wrapper from a Raw date variable &mdash; Raw variants are already in milliseconds'});
  }

  // --- L2: bare Scripter. reference without braces ---
  if(/\bScripter\.[A-Z]/.test(stripped) && !/\{\{\s*Scripter\./.test(expr)){
    push('warn','Found <code>Scripter.</code> reference outside <code>{{ }}</code>. Built-in Scripter variables must be wrapped: <code>{{Scripter.Agent Name}}</code>.');
    // AUTO-CORRECT L2: wrap Scripter.Foo / Scripter.Foo Bar in {{}}
    corrected = corrected.replace(/(^|[^{])(Scripter\.[A-Z][A-Za-z0-9_. ]*[A-Za-z0-9_])(\b)/g, (m, pre, ref, post) => pre + '{{' + ref + '}}' + post);
    corrections.push({type:'suggested', desc:'Wrapped bare <code>Scripter.</code> reference in <code>{{ }}</code> (suggestion, please verify)'});
  }

  // --- Success summary ---
  const hasErr=results.some(r=>r.level==='err');
  const hasWarn=results.some(r=>r.level==='warn');
  if(!hasErr && !hasWarn){
    push('ok','<strong>No issues found.</strong> The expression passes all structural and syntax checks. Note: static analysis cannot guarantee runtime correctness &mdash; always test in your script.');
  }else if(!hasErr){
    results.unshift({level:'ok',msg:'<strong>No errors.</strong> The expression is structurally valid but has '+(hasWarn?'warnings below':'notes')+'.'});
  }
  // Info: stats
  const stats=[];
  stats.push(braceOpens+' variable reference(s)');
  stats.push(knownFnsUsed.size+' known function(s)'+(knownFnsUsed.size?' ('+[...knownFnsUsed].join(', ')+')':''));
  stats.push((expr.length)+' character(s)');
  results.push({level:'info','msg':'<strong>Stats:</strong> '+stats.join(' &middot; ')});

  // Render
  const iconMap={ok:'&#9989;',warn:'&#9888;&#65039;',err:'&#10060;',info:'&#8505;&#65039;'};
  let outHtml = results.map(r=>`<div class="chk-result chk-${r.level}">${iconMap[r.level]} ${r.msg}</div>`).join('');

  // If we applied any corrections, show a "Suggested correction" card with diff and copy button
  if(corrections.length > 0 && corrected !== expr){
    const hasSuggested = corrections.some(c => c.type === 'suggested');
    const cardCls = hasSuggested ? 'chk-correct-card suggested' : 'chk-correct-card';
    outHtml += '<div class="' + cardCls + '">';
    outHtml += '<div class="chk-correct-hd">&#128736;&#65039; ' + (hasSuggested ? 'Suggested correction' : 'Corrected expression') + '</div>';
    outHtml += '<div class="chk-correct-sub">' + (hasSuggested ? 'One or more changes are my best guess at what you meant &mdash; review before using.' : 'All changes are mechanical fixes I am confident about.') + '</div>';
    outHtml += '<ul class="chk-correct-list">';
    corrections.forEach(c => {
      const iconMap2 = {added:'&#10133;', fixed:'&#128295;', suggested:'&#129300;'};
      outHtml += '<li><span class="chk-c-icon">' + (iconMap2[c.type] || '&#9679;') + '</span> ' + c.desc + '</li>';
    });
    outHtml += '</ul>';
    outHtml += '<div class="chk-correct-label">Corrected expression:</div>';
    outHtml += '<div class="chk-correct-box" id="chk-correct-box">' + esc(corrected) + '</div>';
    outHtml += '<button class="chk-correct-copy" onclick="chkCopyCorrected()">&#128203; Copy corrected expression</button>';
    outHtml += '</div>';
  }

  out.innerHTML = outHtml;
}

function chkCopyCorrected(){
  const box = document.getElementById('chk-correct-box');
  if(!box) return;
  const txt = box.textContent;
  if(navigator.clipboard){
    navigator.clipboard.writeText(txt).then(() => showToast('Copied corrected expression'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); showToast('Copied'); }catch(e){}
    document.body.removeChild(ta);
  }
}



/* ════════════════════════════════════════════════
   FLOW VISUALIZER
════════════════════════════════════════════════ */

// Lazy-loaded library state
let FV_LIBS_LOADED = false;
let FV_DAGRE = null;
let FV_YAML = null;

// Current flow state
let FV_FLOW = null;          // parsed normalized {nodes, edges, meta}
let FV_RAW = null;           // raw parsed YAML object
let FV_LAYOUT_DIR = 'TB';    // TB or LR
let FV_ZOOM = 1.0;
let FV_PAN = {x:0, y:0};
let FV_SELECTED_NODE = null;
let FV_SVG_EL = null;

// Action type registry — drives colors, labels, and category for the renderer
const FV_ACTION_TYPES = {
  // Audio
  playAudio: {label:'Play Audio', cat:'audio', icon:'\u{1F50A}'},
  playAudioOnSilence: {label:'Play Audio On Silence', cat:'audio', icon:'\u{1F50A}'},
  // Routing / transfers
  transferToAcd: {label:'Transfer to ACD', cat:'transfer', icon:'\u{1F501}'},
  transferToUser: {label:'Transfer to User', cat:'transfer', icon:'\u{1F464}'},
  transferToGroup: {label:'Transfer to Group', cat:'transfer', icon:'\u{1F465}'},
  transferToNumber: {label:'Transfer to Number', cat:'transfer', icon:'\u{1F4DE}'},
  transferToFlow: {label:'Transfer to Flow', cat:'transfer', icon:'\u{1F500}'},
  transferToFlowSecure: {label:'Transfer to Secure Flow', cat:'transfer', icon:'\u{1F510}'},
  transferToVoicemail: {label:'Transfer to Voicemail', cat:'transfer', icon:'\u{1F4FC}'},
  // Decisions / branching
  decision: {label:'Decision', cat:'decision', icon:'\u2754'},
  switch: {label:'Switch', cat:'decision', icon:'\u{1F500}'},
  loop: {label:'Loop', cat:'decision', icon:'\u{1F501}'},
  loopUntil: {label:'Loop Until', cat:'decision', icon:'\u{1F501}'},
  loopWhile: {label:'Loop While', cat:'decision', icon:'\u{1F501}'},
  // Data
  callData: {label:'Call Data Action', cat:'data', icon:'\u{1F4E1}'},
  callBot: {label:'Call Bot Flow', cat:'data', icon:'\u{1F916}'},
  callDialogEngineBot: {label:'Call Bot', cat:'data', icon:'\u{1F916}'},
  commonModule: {label:'Common Module', cat:'data', icon:'\u{1F9E9}'},
  callCommonModule: {label:'Call Common Module', cat:'data', icon:'\u{1F9E9}'},
  searchKnowledge: {label:'Search Knowledge', cat:'data', icon:'\u{1F4DA}'},
  // Lookups
  findQueue: {label:'Find Queue', cat:'lookup', icon:'\u{1F50D}'},
  findUser: {label:'Find User', cat:'lookup', icon:'\u{1F50D}'},
  findGroup: {label:'Find Group', cat:'lookup', icon:'\u{1F50D}'},
  findSystemPrompt: {label:'Find System Prompt', cat:'lookup', icon:'\u{1F50D}'},
  findUserPrompt: {label:'Find User Prompt', cat:'lookup', icon:'\u{1F50D}'},
  // Variables / data manipulation
  setVariables: {label:'Set Variables', cat:'variable', icon:'\u{1F4DD}'},
  updateData: {label:'Update Data', cat:'variable', icon:'\u{1F4DD}'},
  setParticipantData: {label:'Set Participant Data', cat:'variable', icon:'\u{1F4CB}'},
  getParticipantData: {label:'Get Participant Data', cat:'variable', icon:'\u{1F4CB}'},
  setFlowOutcome: {label:'Set Flow Outcome', cat:'variable', icon:'\u{1F3AF}'},
  setWhisperAudio: {label:'Set Whisper Audio', cat:'variable', icon:'\u{1F4AC}'},
  // Input collection
  collectInput: {label:'Collect Input', cat:'input', icon:'\u{1F4DE}'},
  dialByExtension: {label:'Dial By Extension', cat:'input', icon:'#\u20E3'},
  getResponse: {label:'Get Response', cat:'input', icon:'\u{1F4AC}'},
  ask: {label:'Ask', cat:'input', icon:'\u2753'},
  // Termination
  disconnect: {label:'Disconnect', cat:'end', icon:'\u{1F6D1}'},
  endFlow: {label:'End Flow', cat:'end', icon:'\u{1F6D1}'},
  endTask: {label:'End Task', cat:'end', icon:'\u{1F6D1}'},
  endState: {label:'End State', cat:'end', icon:'\u{1F6D1}'},
  // Navigation
  jumpToTask: {label:'Jump to Task', cat:'jump', icon:'\u21AA\u{FE0F}'},
  jumpToMenu: {label:'Jump to Menu', cat:'jump', icon:'\u21AA\u{FE0F}'},
  exitMenu: {label:'Exit Menu', cat:'jump', icon:'\u21A9\u{FE0F}'},
  previousMenu: {label:'Previous Menu', cat:'jump', icon:'\u21A9\u{FE0F}'},
  // Misc
  wait: {label:'Wait', cat:'misc', icon:'\u23F3'},
  loop_break: {label:'Break Loop', cat:'misc', icon:'\u26D4'},
  // Menu choices (rendered as nodes too)
  menuJumpToTask: {label:'Menu Choice \u2192 Task', cat:'menuchoice', icon:'\u{1F522}'},
  menuDisconnect: {label:'Menu Choice \u2192 Disconnect', cat:'menuchoice', icon:'\u{1F522}'},
  menuTransferToAcd: {label:'Menu Choice \u2192 ACD', cat:'menuchoice', icon:'\u{1F522}'},
  menuTransferToFlow: {label:'Menu Choice \u2192 Flow', cat:'menuchoice', icon:'\u{1F522}'},
  menuTransferToUser: {label:'Menu Choice \u2192 User', cat:'menuchoice', icon:'\u{1F522}'},
  menuTransferToNumber: {label:'Menu Choice \u2192 Number', cat:'menuchoice', icon:'\u{1F522}'},
  menuTransferToVoicemail: {label:'Menu Choice \u2192 Voicemail', cat:'menuchoice', icon:'\u{1F522}'},
  menuPreviousMenu: {label:'Menu Choice \u2192 Previous', cat:'menuchoice', icon:'\u{1F522}'},
  menuRepeat: {label:'Menu Choice \u2192 Repeat', cat:'menuchoice', icon:'\u{1F522}'},
  menuSubMenu: {label:'Menu Choice \u2192 Submenu', cat:'menuchoice', icon:'\u{1F522}'},
  // Synthetic
  __start: {label:'Start', cat:'start', icon:'\u25B6\u{FE0F}'},
  __menu: {label:'Menu', cat:'menu', icon:'\u{1F522}'},
  __task: {label:'Task', cat:'task', icon:'\u{1F4CB}'},
  __unknown: {label:'Unknown Action', cat:'unknown', icon:'\u2753'},
};

// Color palette per category — these are the box fills in the diagram
const FV_COLORS = {
  start:      {fill:'#2d6e2d', stroke:'#1f5020', text:'#fff'},
  audio:      {fill:'#185fa5', stroke:'#0e4276', text:'#fff'},
  transfer:   {fill:'#006272', stroke:'#003e49', text:'#fff'},
  decision:   {fill:'#c9a84c', stroke:'#7a5a0a', text:'#fff'},
  data:       {fill:'#7e2e94', stroke:'#561d65', text:'#fff'},
  lookup:     {fill:'#5a85a8', stroke:'#3a5e7a', text:'#fff'},
  variable:   {fill:'#993c1d', stroke:'#5e2410', text:'#fff'},
  input:      {fill:'#0a8a6c', stroke:'#06614c', text:'#fff'},
  end:        {fill:'#a32d2d', stroke:'#6e1c1c', text:'#fff'},
  jump:       {fill:'#5d6e7e', stroke:'#404e5b', text:'#fff'},
  menu:       {fill:'#7a5a0a', stroke:'#4a3603', text:'#fff'},
  menuchoice: {fill:'#a07522', stroke:'#5d440f', text:'#fff'},
  task:       {fill:'#0d2a2f', stroke:'#000', text:'#fff'},
  misc:       {fill:'#5d6e7e', stroke:'#404e5b', text:'#fff'},
  unknown:    {fill:'#888',    stroke:'#555',    text:'#fff'},
};

// Branch label aliases — make ugly raw branch names friendly
const FV_BRANCH_LABELS = {
  yes:'Yes', no:'No', 'true':'True', 'false':'False',
  success:'Success', failure:'Failure', timeout:'Timeout', 'error':'Error',
  found:'Found', notFound:'Not Found',
  done:'Done', match:'Match', noMatch:'No Match',
  primary:'Primary', secondary:'Secondary',
  next:'Next', repeat:'Repeat', exit:'Exit',
};

// Sample flow library
const FV_SAMPLES = {
  'queue-members': {
    name: 'Queue Members Check',
    desc: 'A real Genesys Cloud Blueprint sample. Inbound flow that finds a queue, calls a data action to check agent count, then routes to primary or secondary queue based on availability.',
    yaml: `inboundCall:
  name: Queue Members Check
  description: Inbound flow that checks the number of members in a queue using a data action.
  division: Home
  startUpRef: "/inboundCall/menus/menu[Main Menu_10]"
  defaultLanguage: en-us
  initialGreeting:
    tts: Hello, this is the initial greeting.
  menus:
    - menu:
        name: Main Menu
        refId: Main Menu_10
        audio:
          tts: Press 1 to connect to an agent. Press 2 to disconnect.
        choices:
          - menuDisconnect:
              name: Disconnect
              dtmf: digit_2
          - menuJumpToTask:
              name: Check the queue
              dtmf: digit_1
              targetTaskRef: "/inboundCall/tasks/task[Checking the queues_13]"
  tasks:
    - task:
        name: Checking the queues
        refId: Checking the queues_13
        actions:
          - findQueue:
              name: Find Queue
              findName:
                lit: Primary Queue Example
              findResult:
                var: Task.PrimaryQueue
              outputs:
                found:
                  actions:
                    - callData:
                        name: Check Queue For Members
                        outputs:
                          success:
                            actions:
                              - decision:
                                  name: Decision
                                  condition:
                                    exp: Task.total_agents_on_queue > 0
                                  outputs:
                                    "yes":
                                      actions:
                                        - transferToAcd:
                                            name: Transfer to Primary Queue
                                            targetQueue:
                                              exp: Task.PrimaryQueue
                                            preTransferAudio:
                                              tts: You are going to the main queue.
                                            outputs:
                                              failure:
                                                actions:
                                                  - playAudio:
                                                      name: Play Audio
                                                      audio:
                                                        tts: Failed to secure an agent in the main queue.
                                    "no":
                                      actions:
                                        - transferToAcd:
                                            name: Transfer to Secondary Queue
                                            targetQueue:
                                              lit:
                                                name: Secondary Queue Example
                                            preTransferAudio:
                                              tts: You are going to the secondary queue.
                                            outputs:
                                              failure:
                                                actions:
                                                  - playAudio:
                                                      name: Play Audio
                                                      audio:
                                                        tts: Failed to secure an agent in the secondary queue.
                          failure:
                            actions:
                              - playAudio:
                                  name: Failed data action
                                  audio:
                                    tts: Data Action failed.
                          timeout:
                            actions:
                              - playAudio:
                                  name: Time out
                                  audio:
                                    tts: Data Action timed out.
                notFound:
                  actions:
                    - playAudio:
                        name: Play Audio
                        audio:
                          tts: Failed to locate queue within your organisation.
          - playAudio:
              name: Play Audio
              audio:
                tts: Disconnecting
          - disconnect:
              name: Disconnect`
  },
  'simple-ivr': {
    name: 'Simple IVR Menu',
    desc: 'Classic two-option IVR: greet, present a menu, route to sales or support queue.',
    yaml: `inboundCall:
  name: Simple IVR
  description: Two-option menu routing inbound callers to Sales or Support.
  division: Home
  startUpRef: "/inboundCall/menus/menu[Main Menu_1]"
  defaultLanguage: en-us
  initialGreeting:
    tts: Thank you for calling. Please listen carefully as our menu options have changed.
  menus:
    - menu:
        name: Main Menu
        refId: Main Menu_1
        audio:
          tts: Press 1 for Sales. Press 2 for Support. Press 0 to repeat this menu.
        choices:
          - menuJumpToTask:
              name: Sales
              dtmf: digit_1
              targetTaskRef: "/inboundCall/tasks/task[Route to Sales_2]"
          - menuJumpToTask:
              name: Support
              dtmf: digit_2
              targetTaskRef: "/inboundCall/tasks/task[Route to Support_3]"
          - menuRepeat:
              name: Repeat menu
              dtmf: digit_0
  tasks:
    - task:
        name: Route to Sales
        refId: Route to Sales_2
        actions:
          - playAudio:
              name: Sales greeting
              audio:
                tts: Connecting you to our Sales team. Please hold.
          - transferToAcd:
              name: Transfer to Sales Queue
              targetQueue:
                lit:
                  name: Sales Queue
              priority:
                lit: 0
    - task:
        name: Route to Support
        refId: Route to Support_3
        actions:
          - playAudio:
              name: Support greeting
              audio:
                tts: Connecting you to our Support team. Please hold.
          - transferToAcd:
              name: Transfer to Support Queue
              targetQueue:
                lit:
                  name: Support Queue
              priority:
                lit: 0`
  },
  'afterhours': {
    name: 'After-Hours Routing',
    desc: 'Time-of-day check: during business hours, route to queue; otherwise play after-hours message and disconnect.',
    yaml: `inboundCall:
  name: After Hours Routing
  description: Time-based routing — business hours go to queue, off-hours play closed message.
  division: Home
  startUpRef: "/inboundCall/tasks/task[Check Hours_1]"
  defaultLanguage: en-us
  initialGreeting:
    tts: Thank you for calling.
  tasks:
    - task:
        name: Check Hours
        refId: Check Hours_1
        actions:
          - decision:
              name: Open right now?
              condition:
                exp: IsInSchedule("Business Hours")
              outputs:
                "yes":
                  actions:
                    - playAudio:
                        name: Open greeting
                        audio:
                          tts: Please hold while we connect you to an agent.
                    - transferToAcd:
                        name: Transfer to main queue
                        targetQueue:
                          lit:
                            name: Main Queue
                        priority:
                          lit: 0
                "no":
                  actions:
                    - playAudio:
                        name: After-hours message
                        audio:
                          tts: We are currently closed. Our hours are Monday through Friday, 8 AM to 6 PM Eastern. Please call back during business hours.
                    - disconnect:
                        name: Disconnect`
  },
};

// ── Library loader ────────────────────────────────────────────
async function fvEnsureLibs(){
  if(FV_LIBS_LOADED) return;
  const loading = document.getElementById('fv-canvas-loading');
  loading.classList.add('vis');
  try {
    await fvLoadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');
    await fvLoadScript('https://cdnjs.cloudflare.com/ajax/libs/dagre/0.8.5/dagre.min.js');
    FV_YAML = window.jsyaml;
    FV_DAGRE = window.dagre;
    if(!FV_YAML || !FV_DAGRE) throw new Error('Libraries loaded but globals not found');
    FV_LIBS_LOADED = true;
  } finally {
    loading.classList.remove('vis');
  }
}
function fvLoadScript(src){
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = () => rej(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

// ── Toolbar handlers ──────────────────────────────────────────
function fvFileChosen(ev){
  const f = ev.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = e => fvParseAndRender(e.target.result, f.name);
  reader.onerror = () => fvShowError('Failed to read file.');
  reader.readAsText(f);
  ev.target.value = ''; // allow re-uploading same file
}
function fvTogglePaste(){
  document.getElementById('fv-paste-area').classList.toggle('vis');
}
function fvPasteRender(){
  const txt = document.getElementById('fv-paste-textarea').value;
  if(!txt.trim()){ fvShowError('Paste box is empty.'); return; }
  fvParseAndRender(txt, '(pasted)');
  document.getElementById('fv-paste-area').classList.remove('vis');
}
function fvLoadSample(key){
  if(!key) return;
  const s = FV_SAMPLES[key];
  if(!s) return;
  fvParseAndRender(s.yaml, s.name);
  document.getElementById('fv-sample-select').value = '';
}
function fvToggleDir(){
  FV_LAYOUT_DIR = (FV_LAYOUT_DIR === 'TB') ? 'LR' : 'TB';
  document.getElementById('fv-dir-icon').innerHTML = (FV_LAYOUT_DIR === 'TB') ? '&#11015;&#65039;' : '&#10145;&#65039;';
  if(FV_FLOW) fvRenderFlow(FV_FLOW);
}
function fvToggleExportMenu(){
  document.getElementById('fv-export-menu').classList.toggle('vis');
}
document.addEventListener('click', e => {
  if(!e.target.closest('.fv-export-wrap')){
    const m = document.getElementById('fv-export-menu');
    if(m) m.classList.remove('vis');
  }
});

// ── Main parse + render entry point ───────────────────────────
async function fvParseAndRender(yamlText, sourceName){
  document.getElementById('fv-canvas-empty').style.display = 'none';
  try {
    await fvEnsureLibs();
  } catch(e){
    fvShowError('Failed to load required libraries from CDN. Are you online?\n\n' + e.message);
    return;
  }
  let raw;
  try {
    raw = FV_YAML.load(yamlText);
  } catch(e){
    fvShowError('YAML parse error:\n' + e.message);
    return;
  }
  if(!raw || typeof raw !== 'object'){
    fvShowError('YAML did not produce an object — empty or malformed file.');
    return;
  }
  FV_RAW = raw;
  let flow;
  try {
    flow = fvNormalizeArchitectFlow(raw);
  } catch(e){
    fvShowError('Failed to interpret YAML as a Genesys Architect flow:\n' + e.message + '\n\nMake sure you uploaded an Archy/Architect YAML export. The top level of the file should be one of: inboundCall, outboundCall, inQueueCall, inboundEmail, inboundShortMessage, inboundChat, workflow, bot, commonModule.');
    return;
  }
  FV_FLOW = flow;
  fvRenderFlow(flow);
  fvUpdateFlowInfo(flow);
  document.getElementById('fv-export-btn').disabled = false;
  document.getElementById('fv-zoom-controls').style.display = 'flex';
  document.getElementById('fv-zoom-pct').style.display = 'block';
  document.getElementById('fv-detail').innerHTML = '<div class="fv-detail-empty">Click any node in the diagram to see its full property details here.</div>';
  FV_SELECTED_NODE = null;
}

function fvShowError(msg){
  const canvas = document.getElementById('fv-canvas');
  canvas.innerHTML = '<div class="fv-canvas-error">' + esc(msg) + '</div>';
  document.getElementById('fv-canvas-empty').style.display = 'none';
  document.getElementById('fv-export-btn').disabled = true;
}

function fvUpdateFlowInfo(flow){
  document.getElementById('fv-flowinfo').style.display = 'flex';
  document.getElementById('fv-flowtype').textContent = flow.meta.flowType || 'flow';
  document.getElementById('fv-flowname').textContent = flow.meta.name || '(unnamed)';
  document.getElementById('fv-flowdesc').textContent = flow.meta.description || '';
  document.getElementById('fv-stat-nodes').textContent = flow.nodes.length;
  document.getElementById('fv-stat-edges').textContent = flow.edges.length;
  document.getElementById('fv-stat-tasks').textContent = flow.meta.taskCount || 0;
  document.getElementById('fv-stat-menus').textContent = flow.meta.menuCount || 0;
}

// ── PARSER: walk the Architect YAML and produce {nodes, edges, meta} ──
function fvNormalizeArchitectFlow(raw){
  // Find the top-level flow key
  const KNOWN_FLOW_TYPES = ['inboundCall','outboundCall','inQueueCall','inboundEmail','inboundShortMessage','inboundChat','workflow','bot','commonModule','secureCall','botFlow','digitalBot','workitem'];
  let flowType = null, flowBody = null;
  for(const k of Object.keys(raw)){
    if(KNOWN_FLOW_TYPES.includes(k)){ flowType = k; flowBody = raw[k]; break; }
  }
  if(!flowType){
    // Fall back: take the first key that has a 'name' property and looks flow-shaped
    for(const k of Object.keys(raw)){
      if(raw[k] && typeof raw[k] === 'object' && raw[k].name){ flowType = k; flowBody = raw[k]; break; }
    }
  }
  if(!flowType) throw new Error('No recognized top-level flow type found.');

  const ctx = {
    nodes: [],
    edges: [],
    nextId: 1,
    flowType,
    flowBody,
    taskRefIdToNodeId: {},      // refId -> node id (the synthetic Task entry node)
    menuRefIdToNodeId: {},      // refId -> node id (the synthetic Menu entry node)
    pendingJumps: [],           // [{fromId, taskRefIdQuoted}] resolved at the end
  };

  // Synthetic Start node
  const startNode = fvAddNode(ctx, '__start', 'Start', flowType, '/' + flowType, {});
  // Initial greeting (if present)
  let prevId = startNode.id;
  if(flowBody.initialGreeting){
    const igNode = fvAddNode(ctx, 'playAudio', 'Initial Greeting', 'playAudio', '/' + flowType + '/initialGreeting', flowBody.initialGreeting);
    fvAddEdge(ctx, prevId, igNode.id, '');
    prevId = igNode.id;
  }
  // Resolve startUpRef — it's a path like "/inboundCall/menus/menu[Main Menu_10]" or "/inboundCall/tasks/task[X]"
  const startRef = flowBody.startUpRef;
  let startTargetId = null;

  // First, materialize all menus and their entry nodes (so refs can resolve)
  const menus = flowBody.menus || [];
  ctx.menuCount = menus.length;
  menus.forEach((menuWrap, mi) => {
    const menu = menuWrap.menu || menuWrap;
    const refId = menu.refId || ('menu_'+mi);
    const path = '/' + flowType + '/menus[' + mi + ']/menu';
    const menuNode = fvAddNode(ctx, '__menu', menu.name || 'Menu', '__menu', path, menu);
    ctx.menuRefIdToNodeId[refId] = menuNode.id;
    // Walk choices and connect them under this menu
    (menu.choices || []).forEach((choiceWrap, ci) => {
      const choiceKey = Object.keys(choiceWrap)[0];
      const choice = choiceWrap[choiceKey];
      const cpath = path + '/choices[' + ci + ']/' + choiceKey;
      const cNode = fvAddNode(ctx, choiceKey, choice.name || choiceKey, choiceKey, cpath, choice);
      const dtmfLabel = choice.dtmf ? choice.dtmf.replace('digit_','Press ') : '';
      fvAddEdge(ctx, menuNode.id, cNode.id, dtmfLabel);
      // If this choice jumps to a task, queue a pending edge
      if(choice.targetTaskRef){
        ctx.pendingJumps.push({fromId: cNode.id, targetRef: choice.targetTaskRef, label:''});
      }
    });
  });

  // Now materialize all tasks and walk their actions
  const tasks = flowBody.tasks || [];
  ctx.taskCount = tasks.length;
  tasks.forEach((taskWrap, ti) => {
    const task = taskWrap.task || taskWrap;
    const refId = task.refId || ('task_'+ti);
    const path = '/' + flowType + '/tasks[' + ti + ']/task';
    const taskNode = fvAddNode(ctx, '__task', task.name || 'Task', '__task', path, task);
    ctx.taskRefIdToNodeId[refId] = taskNode.id;
    // Walk the task's action chain
    let chainPrev = taskNode.id;
    (task.actions || []).forEach((actionWrap, ai) => {
      const lastInBranch = fvWalkAction(ctx, actionWrap, path + '/actions[' + ai + ']', chainPrev, '');
      chainPrev = lastInBranch;
    });
  });

  // Resolve startUpRef
  if(startRef){
    const targetId = fvResolveRef(ctx, startRef);
    if(targetId !== null){
      fvAddEdge(ctx, prevId, targetId, 'start');
    }
  } else if(menus.length > 0){
    // No explicit startUpRef — assume first menu
    const firstMenu = menus[0].menu || menus[0];
    const targetId = ctx.menuRefIdToNodeId[firstMenu.refId];
    if(targetId) fvAddEdge(ctx, prevId, targetId, '');
  } else if(tasks.length > 0){
    const firstTask = tasks[0].task || tasks[0];
    const targetId = ctx.taskRefIdToNodeId[firstTask.refId];
    if(targetId) fvAddEdge(ctx, prevId, targetId, '');
  }

  // Resolve all pending jumps now that refs are populated
  ctx.pendingJumps.forEach(j => {
    const targetId = fvResolveRef(ctx, j.targetRef);
    if(targetId !== null) fvAddEdge(ctx, j.fromId, targetId, j.label || 'jump');
  });

  return {
    nodes: ctx.nodes,
    edges: ctx.edges,
    meta: {
      name: flowBody.name,
      description: flowBody.description,
      flowType,
      taskCount: ctx.taskCount || 0,
      menuCount: ctx.menuCount || 0,
    },
  };
}

// Walk a single action node. Returns the id of the "last" node in this branch
// (so the caller can chain the next sibling action after it).
function fvWalkAction(ctx, actionWrap, path, fromId, edgeLabel){
  if(!actionWrap || typeof actionWrap !== 'object') return fromId;
  const keys = Object.keys(actionWrap);
  if(keys.length !== 1){
    // Unexpected — skip
    return fromId;
  }
  const actionType = keys[0];
  const action = actionWrap[actionType] || {};
  const node = fvAddNode(ctx, actionType, action.name || actionType, actionType, path + '/' + actionType, action);
  fvAddEdge(ctx, fromId, node.id, edgeLabel);

  // Handle special action types that link elsewhere
  if(actionType === 'jumpToTask' && action.targetTaskRef){
    ctx.pendingJumps.push({fromId: node.id, targetRef: action.targetTaskRef, label:'jump'});
  } else if(actionType === 'jumpToMenu' && action.targetMenuRef){
    ctx.pendingJumps.push({fromId: node.id, targetRef: action.targetMenuRef, label:'jump'});
  }

  // Handle outputs (branches)
  const outputs = action.outputs;
  if(outputs && typeof outputs === 'object'){
    // Each branch is a key like 'yes'/'no'/'success'/'failure'/'found'/'notFound' etc.
    // Each branch value is { actions: [...] }
    // After ALL branches finish, the next sibling action chains off the LAST node in each branch
    // For simplicity (and to match how Architect itself draws it), we chain the next sibling
    // after the action node itself, not after every branch tail. Architect treats branches as
    // dead-ends unless they fall through, which the YAML doesn't make explicit.
    const branchKeys = Object.keys(outputs);
    branchKeys.forEach(branchKey => {
      const branchObj = outputs[branchKey] || {};
      const actions = branchObj.actions || [];
      const branchPath = path + '/' + actionType + '/outputs/' + branchKey;
      const friendlyLabel = FV_BRANCH_LABELS[branchKey] || branchKey;
      let chainPrev = node.id;
      let firstInBranch = true;
      actions.forEach((aw, idx) => {
        const lbl = firstInBranch ? friendlyLabel : '';
        chainPrev = fvWalkAction(ctx, aw, branchPath + '/actions[' + idx + ']', chainPrev, lbl);
        firstInBranch = false;
      });
      // If a branch has no actions, draw a leaf "end of branch" stub so leadership sees the branch exists
      if(actions.length === 0){
        const leafNode = fvAddNode(ctx, 'endState', 'End ' + friendlyLabel, 'endState', branchPath, {});
        fvAddEdge(ctx, node.id, leafNode.id, friendlyLabel);
      }
    });
  }
  return node.id;
}

function fvAddNode(ctx, actionType, label, displayType, path, raw){
  const id = 'n' + (ctx.nextId++);
  const reg = FV_ACTION_TYPES[actionType] || FV_ACTION_TYPES.__unknown;
  ctx.nodes.push({
    id,
    label: label || reg.label,
    actionType,
    displayType,
    cat: reg.cat,
    icon: reg.icon,
    path,
    raw,
  });
  return ctx.nodes[ctx.nodes.length-1];
}
function fvAddEdge(ctx, fromId, toId, label){
  if(!fromId || !toId) return;
  ctx.edges.push({from: fromId, to: toId, label: label || ''});
}
function fvResolveRef(ctx, ref){
  // ref looks like "/inboundCall/tasks/task[Checking the queues_13]" or
  //                 "/inboundCall/menus/menu[Main Menu_10]"
  if(!ref || typeof ref !== 'string') return null;
  const m = ref.match(/\/(tasks|menus)\/(?:task|menu)\[([^\]]+)\]/);
  if(!m) return null;
  const kind = m[1], refId = m[2];
  if(kind === 'tasks') return ctx.taskRefIdToNodeId[refId] || null;
  if(kind === 'menus') return ctx.menuRefIdToNodeId[refId] || null;
  return null;
}

// ── RENDERER: dagre layout + SVG draw ─────────────────────────
function fvRenderFlow(flow){
  const canvas = document.getElementById('fv-canvas');
  canvas.innerHTML = '';

  // Build dagre graph
  const g = new FV_DAGRE.graphlib.Graph();
  g.setGraph({rankdir: FV_LAYOUT_DIR, nodesep: 30, ranksep: 50, marginx: 30, marginy: 30});
  g.setDefaultEdgeLabel(() => ({}));

  flow.nodes.forEach(n => {
    // Estimate node size based on label length
    const lbl = n.label || '';
    const w = Math.max(140, Math.min(260, lbl.length * 7 + 40));
    const h = 56;
    g.setNode(n.id, {width: w, height: h, ref: n});
  });
  flow.edges.forEach(e => {
    g.setEdge(e.from, e.to, {label: e.label || ''});
  });

  FV_DAGRE.layout(g);

  // Compute graph size
  const gMeta = g.graph();
  const W = Math.max(800, gMeta.width + 60);
  const H = Math.max(560, gMeta.height + 60);

  // Build SVG
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  // Arrow marker
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = '<marker id="fv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0d2a2f"/></marker>';
  svg.appendChild(defs);

  // Edges first (so nodes draw on top)
  g.edges().forEach(eRef => {
    const edgeData = g.edge(eRef);
    if(!edgeData || !edgeData.points) return;
    const pts = edgeData.points;
    const d = pts.map((p,i) => (i===0?'M':'L') + p.x + ',' + p.y).join(' ');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#3a5f68');
    path.setAttribute('stroke-width', '1.7');
    path.setAttribute('marker-end', 'url(#fv-arrow)');
    svg.appendChild(path);
    // Edge label
    if(edgeData.label){
      const mid = pts[Math.floor(pts.length/2)];
      const txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', mid.x);
      txt.setAttribute('y', mid.y - 4);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('class', 'fv-edge-label');
      txt.textContent = edgeData.label;
      // Background pill for legibility
      const tw = (edgeData.label.length * 5.5) + 10;
      const bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', mid.x - tw/2);
      bg.setAttribute('y', mid.y - 14);
      bg.setAttribute('width', tw);
      bg.setAttribute('height', 14);
      bg.setAttribute('rx', 3);
      bg.setAttribute('class', 'fv-edge-label-bg');
      svg.appendChild(bg);
      svg.appendChild(txt);
    }
  });

  // Nodes
  g.nodes().forEach(nid => {
    const ndata = g.node(nid);
    if(!ndata || !ndata.ref) return;
    const ref = ndata.ref;
    const colors = FV_COLORS[ref.cat] || FV_COLORS.unknown;
    const x = ndata.x - ndata.width/2;
    const y = ndata.y - ndata.height/2;

    const grp = document.createElementNS(svgNS, 'g');
    grp.setAttribute('class', 'fv-node');
    grp.setAttribute('data-node-id', nid);
    grp.addEventListener('click', () => fvSelectNode(nid));

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', ndata.width);
    rect.setAttribute('height', ndata.height);
    rect.setAttribute('rx', 7);
    rect.setAttribute('fill', colors.fill);
    rect.setAttribute('stroke', colors.stroke);
    rect.setAttribute('stroke-width', '1.5');
    grp.appendChild(rect);

    // Type label (top)
    const typeT = document.createElementNS(svgNS, 'text');
    typeT.setAttribute('x', ndata.x);
    typeT.setAttribute('y', y + 17);
    typeT.setAttribute('text-anchor', 'middle');
    typeT.setAttribute('class', 'fv-node-type');
    const typeReg = FV_ACTION_TYPES[ref.actionType] || FV_ACTION_TYPES.__unknown;
    typeT.textContent = (ref.icon ? ref.icon + '  ' : '') + typeReg.label;
    grp.appendChild(typeT);

    // Name label (bottom)
    const nameT = document.createElementNS(svgNS, 'text');
    nameT.setAttribute('x', ndata.x);
    nameT.setAttribute('y', y + 38);
    nameT.setAttribute('text-anchor', 'middle');
    nameT.setAttribute('class', 'fv-node-label');
    let lbl = ref.label || '';
    if(lbl.length > 32) lbl = lbl.slice(0,30) + '\u2026';
    nameT.textContent = lbl;
    grp.appendChild(nameT);

    svg.appendChild(grp);
  });

  canvas.appendChild(svg);
  FV_SVG_EL = svg;
  FV_ZOOM = 1;
  FV_PAN = {x:0, y:0};
  fvApplyZoom();
  // Setup pan
  fvSetupPanZoom();
}

function fvApplyZoom(){
  if(!FV_SVG_EL) return;
  FV_SVG_EL.style.transformOrigin = '0 0';
  FV_SVG_EL.style.transform = 'translate(' + FV_PAN.x + 'px,' + FV_PAN.y + 'px) scale(' + FV_ZOOM + ')';
  document.getElementById('fv-zoom-pct').textContent = Math.round(FV_ZOOM * 100) + '%';
}
function fvZoom(factor){
  FV_ZOOM = Math.max(0.2, Math.min(3, FV_ZOOM * factor));
  fvApplyZoom();
}
function fvFitToScreen(){
  FV_ZOOM = 1;
  FV_PAN = {x:0, y:0};
  fvApplyZoom();
}
function fvSetupPanZoom(){
  const canvas = document.getElementById('fv-canvas');
  let dragging = false, lastX=0, lastY=0;
  canvas.onmousedown = e => {
    if(e.target.closest('.fv-node')) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.classList.add('dragging');
  };
  canvas.onmousemove = e => {
    if(!dragging) return;
    FV_PAN.x += (e.clientX - lastX);
    FV_PAN.y += (e.clientY - lastY);
    lastX = e.clientX; lastY = e.clientY;
    fvApplyZoom();
  };
  canvas.onmouseup = canvas.onmouseleave = () => { dragging = false; canvas.classList.remove('dragging'); };
  canvas.onwheel = e => {
    e.preventDefault();
    fvZoom(e.deltaY > 0 ? 1/1.1 : 1.1);
  };
}

function fvSelectNode(nid){
  // Visual selection
  document.querySelectorAll('.fv-node').forEach(g => g.classList.remove('selected'));
  const grp = document.querySelector('.fv-node[data-node-id="' + nid + '"]');
  if(grp) grp.classList.add('selected');
  // Find node
  const node = FV_FLOW.nodes.find(n => n.id === nid);
  if(!node) return;
  FV_SELECTED_NODE = node;
  // Render detail panel
  const reg = FV_ACTION_TYPES[node.actionType] || FV_ACTION_TYPES.__unknown;
  const colors = FV_COLORS[node.cat] || FV_COLORS.unknown;
  let html = '<div class="fv-detail-hd">';
  html += '<div class="fv-detail-type" style="background:' + colors.fill + ';color:#fff">' + esc(reg.label) + '</div>';
  html += '<div class="fv-detail-name">' + esc(node.label) + '</div>';
  html += '<div class="fv-detail-path">' + esc(node.path) + '</div>';
  html += '</div>';
  html += '<table class="fv-detail-tbl">';
  html += fvRenderProps(node.raw, 0);
  html += '</table>';
  document.getElementById('fv-detail').innerHTML = html;
}

function fvRenderProps(obj, depth){
  if(obj == null) return '<tr><td colspan="2"><span class="fv-val-novalue">(no properties)</span></td></tr>';
  if(typeof obj !== 'object') return '<tr><td colspan="2">' + esc(String(obj)) + '</td></tr>';
  let h = '';
  for(const k of Object.keys(obj)){
    const v = obj[k];
    if(k === 'outputs') continue; // skip nested branches in detail panel — they're shown in the diagram
    h += '<tr>';
    h += '<th class="' + (depth>0?'nested':'') + '">' + esc(k) + '</th>';
    h += '<td>' + fvRenderValue(v, depth+1) + '</td>';
    h += '</tr>';
  }
  return h || '<tr><td colspan="2"><span class="fv-val-novalue">(empty)</span></td></tr>';
}
function fvRenderValue(v, depth){
  if(v == null) return '<span class="fv-val-novalue">null</span>';
  if(typeof v !== 'object') return esc(String(v));
  // Architect-style wrappers
  if('lit' in v){
    const lit = v.lit;
    if(lit && typeof lit === 'object'){
      // {seconds:40} or {ms:1500} etc.
      const parts = Object.entries(lit).map(([k,vv]) => k+': '+vv).join(', ');
      return '<span class="fv-val-lit">literal { ' + esc(parts) + ' }</span>';
    }
    return '<span class="fv-val-lit">literal: ' + esc(String(lit)) + '</span>';
  }
  if('exp' in v) return '<span class="fv-val-exp">expression: ' + esc(String(v.exp)) + '</span>';
  if('var' in v) return '<span class="fv-val-var">variable: ' + esc(String(v.var)) + '</span>';
  if('tts' in v) return '<span class="fv-val-tts">TTS: \u201C' + esc(String(v.tts)) + '\u201D</span>';
  if('ref' in v) return '<span>ref: ' + esc(String(v.ref)) + '</span>';
  if('noValue' in v) return '<span class="fv-val-novalue">(no value)</span>';
  // Nested object — recurse with a sub-table
  if(Array.isArray(v)){
    if(v.length === 0) return '<span class="fv-val-novalue">[]</span>';
    return '<table class="fv-detail-tbl" style="margin-top:4px">' + v.map((item,i) => '<tr><th class="nested">[' + i + ']</th><td>' + fvRenderValue(item, depth+1) + '</td></tr>').join('') + '</table>';
  }
  return '<table class="fv-detail-tbl" style="margin-top:4px">' + fvRenderProps(v, depth) + '</table>';
}

// ── EXPORT ────────────────────────────────────────────────────
function fvExport(format){
  document.getElementById('fv-export-menu').classList.remove('vis');
  if(!FV_SVG_EL || !FV_FLOW){ alert('No flow to export. Load a YAML first.'); return; }
  if(format === 'svg') fvExportSVG();
  else if(format === 'png') fvExportPNG();
  else if(format === 'drawio') fvExportDrawio();
}
function fvSerializeSVG(){
  // Inline computed styles so the standalone SVG is self-contained
  const clone = FV_SVG_EL.cloneNode(true);
  // Embed minimal CSS for label fonts
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    .fv-edge-label{font-family:Segoe UI,system-ui,sans-serif;font-size:10px;font-weight:600;fill:#3a5f68}
    .fv-edge-label-bg{fill:#fff;stroke:#b8dde3;stroke-width:1px}
    .fv-node-label{font-family:Segoe UI,system-ui,sans-serif;font-size:11px;font-weight:600;fill:#fff}
    .fv-node-type{font-family:Segoe UI,system-ui,sans-serif;font-size:9px;font-weight:700;fill:rgba(255,255,255,.78);text-transform:uppercase;letter-spacing:.03em}
  `;
  clone.insertBefore(style, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}
function fvDownload(filename, content, mime){
  const blob = (content instanceof Blob) ? content : new Blob([content], {type: mime || 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function fvSafeName(){
  const n = (FV_FLOW && FV_FLOW.meta && FV_FLOW.meta.name) || 'flow';
  return n.replace(/[^a-z0-9_-]+/gi,'_').toLowerCase();
}
function fvExportSVG(){
  const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + fvSerializeSVG();
  fvDownload(fvSafeName() + '.svg', svg, 'image/svg+xml');
}
function fvExportPNG(){
  const svgStr = fvSerializeSVG();
  const blob = new Blob([svgStr], {type:'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const w = FV_SVG_EL.viewBox.baseVal.width || FV_SVG_EL.width.baseVal.value || 1200;
    const h = FV_SVG_EL.viewBox.baseVal.height || FV_SVG_EL.height.baseVal.value || 800;
    const scale = 2; // 2x for retina-ish quality
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f7fdfe';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(b => fvDownload(fvSafeName() + '.png', b, 'image/png'));
    URL.revokeObjectURL(url);
  };
  img.onerror = () => { URL.revokeObjectURL(url); alert('PNG export failed.'); };
  img.src = url;
}
function fvExportDrawio(){
  // Minimal mxGraph XML compatible with draw.io / app.diagrams.net
  // Reference: https://drawio-app.com/extracting-the-xml-from-mxfiles/
  if(!FV_FLOW) return;
  // We need positions — re-run dagre to get them
  const g = new FV_DAGRE.graphlib.Graph();
  g.setGraph({rankdir: FV_LAYOUT_DIR, nodesep: 40, ranksep: 60, marginx: 20, marginy: 20});
  g.setDefaultEdgeLabel(() => ({}));
  FV_FLOW.nodes.forEach(n => {
    const lbl = n.label || '';
    g.setNode(n.id, {width: Math.max(140, Math.min(260, lbl.length*7+40)), height: 56, ref: n});
  });
  FV_FLOW.edges.forEach(e => g.setEdge(e.from, e.to, {label: e.label || ''}));
  FV_DAGRE.layout(g);

  let cells = '';
  cells += '<mxCell id="0"/>\n';
  cells += '<mxCell id="1" parent="0"/>\n';
  let cellId = 2;
  const idMap = {};
  g.nodes().forEach(nid => {
    const nd = g.node(nid);
    if(!nd) return;
    const ref = nd.ref;
    const colors = FV_COLORS[ref.cat] || FV_COLORS.unknown;
    const reg = FV_ACTION_TYPES[ref.actionType] || FV_ACTION_TYPES.__unknown;
    const x = nd.x - nd.width/2;
    const y = nd.y - nd.height/2;
    const label = (reg.label + '\n' + (ref.label || '')).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'&#10;');
    const style = 'rounded=1;whiteSpace=wrap;html=1;fontSize=11;fontStyle=1;fontColor=#FFFFFF;fillColor=' + colors.fill + ';strokeColor=' + colors.stroke + ';';
    const myId = cellId++;
    idMap[nid] = myId;
    cells += `<mxCell id="${myId}" value="${label}" style="${style}" vertex="1" parent="1"><mxGeometry x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${nd.width}" height="${nd.height}" as="geometry"/></mxCell>\n`;
  });
  g.edges().forEach(eRef => {
    const ed = g.edge(eRef);
    const fromId = idMap[eRef.v], toId = idMap[eRef.w];
    if(!fromId || !toId) return;
    const myId = cellId++;
    const lbl = (ed.label || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const style = 'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;exitDx=0;exitDy=0;strokeColor=#0d2a2f;fontSize=10;';
    cells += `<mxCell id="${myId}" value="${lbl}" style="${style}" edge="1" parent="1" source="${fromId}" target="${toId}"><mxGeometry relative="1" as="geometry"/></mxCell>\n`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="genesys-trainer" type="device">
  <diagram name="${esc((FV_FLOW.meta && FV_FLOW.meta.name) || 'Flow')}" id="flow1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="826" math="0" shadow="0">
      <root>
${cells}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  fvDownload(fvSafeName() + '.drawio', xml, 'application/xml');
}





/* ════════════════════════════════════════════════
   AUTH + API CLIENT
════════════════════════════════════════════════ */
let CURRENT_USER = null;
let CSRF_TOKEN = '';

async function apiPost(url, body){
  const headers = {'Content-Type':'application/json'};
  if(CSRF_TOKEN) headers['X-CSRF-Token'] = CSRF_TOKEN;
  const res = await fetch(url, {method:'POST', headers, credentials:'same-origin', body:JSON.stringify(body||{})});
  let data;
  try{ data = await res.json(); } catch(e){ throw new Error('Server returned a non-JSON response (HTTP '+res.status+'). Check that PHP is running and config.php is correct.'); }
  if(!data.ok) throw new Error(data.error || ('Request failed (HTTP '+res.status+')'));
  return data;
}
async function apiGet(url){
  const headers = {};
  if(CSRF_TOKEN) headers['X-CSRF-Token'] = CSRF_TOKEN;
  const res = await fetch(url, {method:'GET', headers, credentials:'same-origin'});
  let data;
  try{ data = await res.json(); } catch(e){ throw new Error('Server returned a non-JSON response (HTTP '+res.status+')'); }
  if(!data.ok) throw new Error(data.error || ('Request failed (HTTP '+res.status+')'));
  return data;
}

function authErr(msg){
  const el = document.getElementById('auth-err');
  el.textContent = msg;
  el.classList.add('vis');
}
function authErrClear(){
  document.getElementById('auth-err').classList.remove('vis');
}
function switchAuthTab(which){
  authErrClear();
  ['login','register'].forEach(k=>{
    document.getElementById('auth-tab-'+k).classList.toggle('active', k===which);
    document.getElementById('auth-pane-'+k).classList.toggle('active', k===which);
  });
}

async function doLogin(){
  authErrClear();
  const email = document.getElementById('auth-login-email').value.trim();
  const pass  = document.getElementById('auth-login-pass').value;
  if(!email || !pass){ authErr('Email and password are required.'); return; }
  const btn = document.getElementById('auth-login-btn');
  btn.disabled = true; btn.textContent = 'Logging in…';
  try {
    const data = await apiPost('api/login.php', {email, password:pass});
    CURRENT_USER = data.user;
    CSRF_TOKEN = data.csrf_token;
    await hydrateProgressFromServer();
    onAuthenticated();
  } catch(e){
    authErr(e.message);
  } finally {
    btn.disabled = false; btn.innerHTML = 'Log In &#9654;';
  }
}

async function doRegister(){
  authErrClear();
  const name   = document.getElementById('auth-reg-name').value.trim();
  const email  = document.getElementById('auth-reg-email').value.trim();
  const pass   = document.getElementById('auth-reg-pass').value;
  const invite = document.getElementById('auth-reg-invite').value.trim();
  if(!name || !email || !pass || !invite){ authErr('All fields are required.'); return; }
  if(pass.length < 8){ authErr('Password must be at least 8 characters.'); return; }
  const btn = document.getElementById('auth-reg-btn');
  btn.disabled = true; btn.textContent = 'Creating account…';
  try {
    const data = await apiPost('api/register.php', {display_name:name, email, password:pass, invite_code:invite});
    CURRENT_USER = data.user;
    CSRF_TOKEN = data.csrf_token;
    // New account — empty progress
    TS = {xp:0, streak:0, done:new Set(), wrong:{}, hint:{}, revealed:{}, tier:1};
    onAuthenticated();
  } catch(e){
    authErr(e.message);
  } finally {
    btn.disabled = false; btn.innerHTML = 'Create Account &#9654;';
  }
}

async function doLogout(){
  // No-op in open-access mode — kept for compatibility
}

function onAuthenticated(){
  // Open-access mode — no auth veil to hide, just render
  document.body.classList.remove('role-admin','role-trainee');
  rAll();
}

/* ════════════════════════════════════════════════
   PROGRESS SAVE HOOK
════════════════════════════════════════════════ */
// Replace the body of chk() and showAns() via wrapping — but we'll do this by
// overriding just the completion path. Since chk() already calls TS.done.add(id)
// and updates TS.xp, we hook by wrapping rAll — any time rAll is called after
// a new completion, we fire-and-forget a save. But we need per-challenge state
// so we track delta.
const _origRAll = rAll;
let _lastDone = new Set();
let _lastRevealed = {};
function rAllWithSave(){
  // Save progress to localStorage (no server required)
  try {
    localStorage.setItem('gca_progress', JSON.stringify({
      done:     Array.from(TS.done),
      revealed: Object.keys(TS.revealed || {}),
      xp:       TS.xp
    }));
  } catch(e){ console.warn('Could not save progress:', e); }
  _lastDone = new Set(TS.done);
  _lastRevealed = Object.assign({}, TS.revealed || {});
  _origRAll();
}
rAll = rAllWithSave;

/* ════════════════════════════════════════════════
   ADMIN DASHBOARD
════════════════════════════════════════════════ */
let ADM_ROSTER = [];
let ADM_SELECTED_ID = null;

async function loadAdminRoster(){
  if(!CURRENT_USER || CURRENT_USER.role !== 'admin') return;
  const tbody = document.getElementById('adm-tbody');
  tbody.innerHTML = '<tr><td colspan="7" class="adm-empty">Loading roster…</td></tr>';
  try {
    const data = await apiGet('api/admin-roster.php');
    ADM_ROSTER = data.users || [];
    renderAdminStats();
    renderAdminRoster();
  } catch(e){
    tbody.innerHTML = '<tr><td colspan="7" class="adm-empty" style="color:var(--red)">Failed to load: ' + esc(e.message) + '</td></tr>';
  }
}

function renderAdminStats(){
  document.getElementById('adm-sv-users').textContent = ADM_ROSTER.length;
  let comp = 0, rev = 0, xp = 0;
  ADM_ROSTER.forEach(u => { comp += u.completed_count; rev += u.revealed_count; xp += u.total_xp; });
  document.getElementById('adm-sv-completed').textContent = comp;
  document.getElementById('adm-sv-revealed').textContent = rev;
  document.getElementById('adm-sv-xp').textContent = xp;
}

function renderAdminRoster(){
  const q = (document.getElementById('adm-search').value || '').toLowerCase().trim();
  const tbody = document.getElementById('adm-tbody');
  const filtered = ADM_ROSTER.filter(u =>
    !q || u.email.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q)
  );
  if(!filtered.length){
    tbody.innerHTML = '<tr><td colspan="7" class="adm-empty">No users match.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(u => {
    const roleCls = u.role === 'admin' ? 'adm-role-admin' : 'adm-role-trainee';
    const last = u.last_login ? u.last_login.replace('T',' ').slice(0,16) : '—';
    const sel = (ADM_SELECTED_ID === u.id) ? ' sel' : '';
    return `<tr class="${sel}" onclick="showAdminDetail(${u.id})">
      <td><strong>${esc(u.display_name)}</strong></td>
      <td style="font-family:var(--mo);font-size:12px">${esc(u.email)}</td>
      <td><span class="adm-role-badge ${roleCls}">${u.role}</span></td>
      <td>${u.completed_count}</td>
      <td>${u.revealed_count}</td>
      <td><strong>${u.total_xp}</strong></td>
      <td style="font-size:11px;color:var(--t2)">${esc(last)}</td>
    </tr>`;
  }).join('');
}

async function showAdminDetail(user_id){
  ADM_SELECTED_ID = user_id;
  renderAdminRoster();
  const wrap = document.getElementById('adm-detail-wrap');
  wrap.innerHTML = '<div class="adm-detail"><div class="adm-empty">Loading user detail…</div></div>';
  try {
    const data = await apiGet('api/admin-user-detail.php?id=' + encodeURIComponent(user_id));
    const u = data.user, s = data.summary, p = data.progress || [];
    const isSelf = (CURRENT_USER && CURRENT_USER.id === u.id);
    const roleDropdown = isSelf
      ? `<span class="adm-role-badge adm-role-admin" title="You cannot change your own role">${u.role} (you)</span>`
      : `<select class="adm-act" onchange="adminSetRole(${u.id}, this.value)">
           <option value="trainee"${u.role==='trainee'?' selected':''}>trainee</option>
           <option value="admin"${u.role==='admin'?' selected':''}>admin</option>
         </select>`;
    let rows = '';
    if(p.length === 0){
      rows = '<tr><td colspan="5" class="adm-empty">No challenges attempted yet.</td></tr>';
    } else {
      rows = p.map(r => {
        const cls = r.status === 'completed' ? 'st-c' : 'st-r';
        const when = r.completed_at ? r.completed_at.replace('T',' ').slice(0,16) : '—';
        const hint = r.hint_used ? '&#128161; yes' : 'no';
        return `<tr>
          <td style="font-family:var(--mo)">${esc(r.challenge_id)}</td>
          <td class="${cls}">${r.status}</td>
          <td>${r.xp_awarded}</td>
          <td>${hint}</td>
          <td style="color:var(--t2)">${esc(when)}</td>
        </tr>`;
      }).join('');
    }
    wrap.innerHTML = `
      <div class="adm-detail">
        <div class="adm-detail-hd">
          <div>
            <div class="adm-detail-name">${esc(u.display_name)}</div>
            <div class="adm-detail-email">${esc(u.email)}</div>
          </div>
          <div class="adm-actions">
            ${roleDropdown}
            <button class="adm-act warn" onclick="adminResetProgress(${u.id}, '${esc(u.display_name).replace(/'/g,"\\'")}')">Reset progress</button>
            ${isSelf ? '' : `<button class="adm-act danger" onclick="adminDeleteUser(${u.id}, '${esc(u.display_name).replace(/'/g,"\\'")}')">Delete user</button>`}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
          <div class="adm-stat"><div class="adm-stat-v">${s.total_xp}</div><div class="adm-stat-l">Total XP</div></div>
          <div class="adm-stat"><div class="adm-stat-v">${s.completed_count}</div><div class="adm-stat-l">Completed</div></div>
          <div class="adm-stat"><div class="adm-stat-v">${s.revealed_count}</div><div class="adm-stat-l">Revealed</div></div>
        </div>
        <table class="adm-prog-tbl">
          <thead><tr><th>Challenge</th><th>Status</th><th>XP</th><th>Hint used</th><th>Completed at</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } catch(e){
    wrap.innerHTML = '<div class="adm-detail"><div class="adm-empty" style="color:var(--red)">Failed to load: ' + esc(e.message) + '</div></div>';
  }
}

async function adminSetRole(user_id, role){
  try {
    await apiPost('api/admin-set-role.php', {user_id, role});
    showToast('Role updated');
    await loadAdminRoster();
    showAdminDetail(user_id);
  } catch(e){ alert('Failed: ' + e.message); }
}

async function adminResetProgress(user_id, name){
  if(!confirm('Reset ALL progress for ' + name + '? This cannot be undone.')) return;
  try {
    await apiPost('api/admin-reset-progress.php', {user_id});
    showToast('Progress reset');
    await loadAdminRoster();
    showAdminDetail(user_id);
  } catch(e){ alert('Failed: ' + e.message); }
}

async function adminDeleteUser(user_id, name){
  if(!confirm('PERMANENTLY delete the account for ' + name + '? This cannot be undone and will remove all their progress.')) return;
  try {
    await apiPost('api/admin-delete-user.php', {user_id});
    showToast('User deleted');
    ADM_SELECTED_ID = null;
    document.getElementById('adm-detail-wrap').innerHTML = '';
    await loadAdminRoster();
  } catch(e){ alert('Failed: ' + e.message); }
}




/* ════════════════════════════════════════════════
   OUTBOUND SETUP
════════════════════════════════════════════════ */
const DIALER_QUIZZES = {
  preview: [
    {
      q: "Your campaign calls high-value enterprise customers and the legal team is extremely worried about abandoned calls. Which dialer mode best fits?",
      opts: [
        {t:"Predictive &mdash; maximum efficiency", c:false, fb:"Predictive has a non-zero abandon rate by design. For a zero-abandon-tolerance legal environment, this is exactly what you want to avoid."},
        {t:"Preview &mdash; agent is reserved before dialing", c:true, fb:"Correct. Preview reserves the agent before the call is placed, so abandonment is effectively impossible. It's the standard choice for compliance-sensitive campaigns."},
        {t:"Agentless &mdash; no agents involved", c:false, fb:"Agentless would mean customers only hear a recorded IVR, not a live agent &mdash; probably not what high-value enterprise contacts expect."},
        {t:"Any mode works, the dialer handles it", c:false, fb:"Dialer mode absolutely matters for compliance. Predictive and Power/Progressive all carry non-zero abandon risk; only Preview and Agentless avoid it entirely (and Agentless isn't 'agent-based')."},
      ],
    },
    {
      q: "In Preview mode, what happens when the agent clicks Dial and the customer picks up?",
      opts: [
        {t:"The call goes through Call Analysis first, then connects", c:false, fb:"Preview mode does NOT use call analysis. That's a key difference from the automated modes."},
        {t:"The agent hears ringing, the customer's answer, and any voicemail greeting directly &mdash; no call analysis is performed", c:true, fb:"Correct. Preview is a straight agent-placed call. The agent hears the full pre-connect audio, just like manual dialing. This is actually desirable &mdash; it lets agents leave voicemails or adapt their greeting in real time."},
        {t:"The system drops the call if a voicemail is detected", c:false, fb:"There is no voicemail detection in Preview because there is no call analysis. The agent decides what to do if they hit voicemail."},
        {t:"The call is bridged to an outbound flow", c:false, fb:"That's Agentless behavior. Preview calls go agent-to-customer directly."},
      ],
    },
    {
      q: "True or false: Preview is the only Genesys Cloud dialer mode that supports agent-owned records (Precise Dialing).",
      opts: [
        {t:"True", c:true, fb:"Correct. Precise Dialing &mdash; where a specific agent must handle a specific contact &mdash; is only possible in Preview mode. Automated modes don't support this because they can't guarantee which agent will receive the connected call."},
        {t:"False &mdash; Predictive also supports Precise Dialing", c:false, fb:"Predictive routes connected calls to whichever agent the pacing algorithm has available. It cannot guarantee a specific agent handles a specific record."},
        {t:"False &mdash; any mode supports agent-owned records", c:false, fb:"Only Preview does. If your workflow requires a specific agent handling a specific contact, Preview is your only option."},
      ],
    },
  ],
  agentless: [
    {
      q: "You're setting up an agentless campaign to deliver appointment reminders via an Architect IVR flow. Which setting MUST be configured or the campaign will fail to start?",
      opts: [
        {t:"A queue for live-answer transfers", c:false, fb:"Agentless campaigns don't use queues &mdash; there are no agents. Assigning a queue does nothing."},
        {t:"A script with a Set Stage action", c:false, fb:"Set Stage is a Predictive dialer requirement. Agentless campaigns don't use scripts at all because there's no agent to display them to."},
        {t:"A Call Analysis Response Set that includes a Transfer to Flow action", c:true, fb:"Correct. Agentless campaigns absolutely require a response set with Transfer to Flow &mdash; that's how answered calls get routed into your Architect IVR. The campaign will refuse to start without it."},
        {t:"A minimum of 15 agents in the target queue", c:false, fb:"No agents are involved in Agentless mode at all. Agent count is irrelevant."},
      ],
    },
    {
      q: "Which response set configuration is INVALID for an agentless campaign?",
      opts: [
        {t:"Live answer &rarr; Transfer to Flow", c:false, fb:"This is valid and actually required &mdash; it's how Agentless delivers its IVR content to answered calls."},
        {t:"Answering machine &rarr; Hang up", c:false, fb:"This is valid. Hanging up on answering machines is a common agentless behavior."},
        {t:"Answering machine &rarr; Play message then hang up", c:false, fb:"This is valid. Agentless campaigns can play pre-recorded messages to answering machines."},
        {t:"Live answer &rarr; Transfer to Agent", c:true, fb:"Correct &mdash; this is INVALID for agentless. Agentless campaigns cannot use response sets that include Transfer to Agent actions because there are no agents. Genesys Cloud will reject the assignment. If you need live-answer agent routing, you need Preview / Progressive / Power / Predictive instead."},
      ],
    },
    {
      q: "You allocate 50 lines to an agentless campaign on an Edge group that has 200 total outbound lines in its pool, shared with other campaigns. What happens?",
      opts: [
        {t:"The campaign will always have exactly 50 lines available, no matter what", c:false, fb:"Not quite. The 50 is a request, but the Edge group must actually have the lines free. If other campaigns are heavily using the pool, the agentless campaign may get fewer than 50."},
        {t:"The campaign reserves up to 50 lines from the shared 200-line pool, and the other 150 remain available to other campaigns", c:true, fb:"Correct. The campaign's line count is its share of the Edge group's pool, not dedicated hardware. Agentless campaigns compete for lines with all other active campaigns on the same Edge group. If you over-allocate across campaigns, some will starve."},
        {t:"The campaign will only start if the Edge group has at least 50 lines free at launch, then it releases them", c:false, fb:"Close, but line allocation is continuous, not a one-time reservation at campaign start. The campaign keeps needing lines for the entire run."},
        {t:"Nothing happens &mdash; line count is just a suggestion", c:false, fb:"Line count is a real pacing parameter that directly controls how many parallel calls the campaign can have in flight."},
      ],
    },
  ],
  predictive: [
    {
      q: "You're configuring a predictive campaign and the pacing seems wildly unstable &mdash; sometimes idle agents, sometimes huge abandon spikes. Which of these is the MOST common cause?",
      opts: [
        {t:"Max Calls Per Agent is set too low", c:false, fb:"A low Max Calls Per Agent could cause idle agents, but not the unstable yo-yo behavior described. That pattern is usually about the pacing algorithm not having enough data to predict accurately."},
        {t:"The campaign has fewer than 15 agents, so the predictive pacing algorithm can't produce reliable predictions", c:true, fb:"Correct. Genesys recommends a minimum of 15 agents for stable predictive pacing (7 is the technical floor). Below that, statistical noise dominates the prediction and you get exactly the pattern described: unpredictable swings between idle and abandon. If your agent pool is smaller than 15, use Progressive instead."},
        {t:"The Compliance Abandon Rate is too high", c:false, fb:"A high abandon rate ceiling lets more abandons slip through but doesn't cause unstable pacing. It's a symptom amplifier, not the root cause."},
        {t:"Call Analysis is turned off", c:false, fb:"Predictive mode always uses call analysis &mdash; you can't turn it off. That isn't the issue."},
      ],
    },
    {
      q: "Your predictive campaign script doesn't include any Set Stage actions. What's the consequence?",
      opts: [
        {t:"Nothing &mdash; Set Stage is optional", c:false, fb:"Set Stage is NOT optional for predictive campaigns. Genesys documentation explicitly states it's required."},
        {t:"The campaign will refuse to start", c:false, fb:"Close &mdash; Genesys does warn about it, but the campaign can technically still run. The consequence is worse than a hard failure: it silently performs badly."},
        {t:"Predictive pacing loses its main input source and the algorithm falls back to worse-than-Progressive behavior", c:true, fb:"Correct. The predictive algorithm depends on Set Stage markers to measure how long agents spend in each phase of a call. Without those markers, it has no way to predict when agents will be available, so it falls back to naive pacing that's actually worse than Progressive mode. This is the #1 predictive setup mistake and the fix is simple: add at least one Set Stage action to the script."},
        {t:"The dialer will skip records instead of dialing them", c:false, fb:"Record skipping is governed by rules and filters, not by missing Set Stage actions."},
      ],
    },
    {
      q: "A predictive campaign has a Compliance Abandon Rate set to 3.0%. During the campaign, the rolling abandon rate climbs to 4.5%. What happens?",
      opts: [
        {t:"The campaign is immediately stopped by the system", c:false, fb:"The campaign isn't stopped outright &mdash; it throttles. Stopping would be a much bigger operational event. Genesys instead self-paces to push the rate back under the ceiling."},
        {t:"The dialer automatically throttles its pacing to bring the abandon rate back under the configured ceiling", c:true, fb:"Correct. The Compliance Abandon Rate is a hard ceiling that the dialer enforces by self-throttling. When the rolling abandon rate approaches or exceeds the ceiling, the dialer backs off automatically. This protects you legally &mdash; but it also means your throughput can drop unexpectedly during abandon spikes. Monitoring the actual rate vs. the ceiling is important operational hygiene."},
        {t:"Nothing &mdash; the 3.0% is just a reporting target", c:false, fb:"Compliance Abandon Rate is actively enforced by the dialer, not just a reporting metric. It controls real pacing behavior."},
        {t:"The campaign switches automatically to Progressive mode", c:false, fb:"There's no automatic mode switching. The dialer stays in Predictive but throttles harder."},
      ],
    },
  ],
};

function showDialer(which){
  document.querySelectorAll('.dialer-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-dialer') === which));
  document.querySelectorAll('.dialer-page').forEach(p => p.classList.toggle('active', p.id === 'dialer-' + which));
  // Render the quiz for this dialer if not already rendered
  const container = document.getElementById('dp-quiz-' + which);
  if(container && !container.dataset.rendered){
    renderDialerQuiz(which, container);
    container.dataset.rendered = '1';
  }
  // Scroll to top of the section cleanly
  const sec = document.getElementById('section-outbound');
  if(sec) sec.scrollIntoView({behavior:'smooth', block:'start'});
}
function renderDialerQuiz(which, container){
  const quiz = DIALER_QUIZZES[which] || [];
  let html = '<div class="dp-quiz-hd">&#129504; Quick check &mdash; 3 questions</div>';
  quiz.forEach((q, qi) => {
    html += '<div class="dp-q"><div class="dp-q-t">' + (qi+1) + '. ' + q.q + '</div><div class="dp-q-opts" id="dpq-' + which + '-' + qi + '">';
    q.opts.forEach((opt, oi) => {
      html += '<button class="dp-q-opt" onclick="dialerAnswer(\'' + which + '\',' + qi + ',' + oi + ')">' + opt.t + '</button>';
    });
    html += '</div><div class="dp-q-fb" id="dpqfb-' + which + '-' + qi + '"></div></div>';
  });
  container.innerHTML = html;
}
function dialerAnswer(which, qi, oi){
  const q = DIALER_QUIZZES[which][qi];
  const opt = q.opts[oi];
  const optsContainer = document.getElementById('dpq-' + which + '-' + qi);
  const fbContainer = document.getElementById('dpqfb-' + which + '-' + qi);
  // Disable all options
  optsContainer.querySelectorAll('.dp-q-opt').forEach((btn, i) => {
    btn.classList.add('disabled');
    if(q.opts[i].c) btn.classList.add('correct');
    if(i === oi && !q.opts[i].c) btn.classList.add('wrong');
  });
  // Show feedback
  fbContainer.innerHTML = (opt.c ? '<strong>&#9989; Correct.</strong> ' : '<strong>&#10060; Not quite.</strong> ') + opt.fb;
  fbContainer.className = 'dp-q-fb vis ' + (opt.c ? 'ok' : 'no');
}

// Initialize the first dialer's quiz once on first visit
const _origShowSectionOB = showSection;
showSection = function(id){
  _origShowSectionOB(id);
  if(id === 'outbound'){
    // Make sure the active dialer's quiz is rendered
    const activeDialer = document.querySelector('.dialer-tab.active');
    if(activeDialer){
      const which = activeDialer.getAttribute('data-dialer');
      const container = document.getElementById('dp-quiz-' + which);
      if(container && !container.dataset.rendered){
        renderDialerQuiz(which, container);
        container.dataset.rendered = '1';
      }
    }
  }
};


/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
(function init(){
  document.getElementById('str-vt-info').innerHTML=STR_VT_INFO['basic'];
  document.getElementById('num-vt-info').innerHTML=NUM_VT_INFO['basic'];
  document.getElementById('bool-vt-info').innerHTML=BOOL_VT_INFO['basic'];
  rStrScenarios();rStrTmpls();rStrTypeGrid();
  rNumScenarios();rNumTmpls();rNumTypeGrid();
  rBoolScenarios();rBoolTmpls();rBoolTypeGrid();

  // Load progress from localStorage (no login required)
  try {
    const saved = localStorage.getItem('gca_progress');
    if(saved){
      const p = JSON.parse(saved);
      TS.done = new Set(p.done || []);
      TS.revealed = {};
      (p.revealed || []).forEach(id => { TS.revealed[id] = true; });
      TS.xp = p.xp || 0;
      _lastDone = new Set(TS.done);
      _lastRevealed = Object.assign({}, TS.revealed);
    }
  } catch(e){ console.warn('Could not load saved progress:', e); }

  rAll();
  showSection('home');
})();


/* ═══════════════════════════════════════════════════════════════
   SCRIPT GENERATOR  — GEN state + rendering + JSON builder
═══════════════════════════════════════════════════════════════ */

// ── Data constants ────────────────────────────────────────────
var GEN_SCENARIOS = [
  { id:'inbound',  icon:'&#128222;', name:'Inbound Voice',     desc:'Agents receive calls — display customer info, speed dials for transfers, disposition codes' },
  { id:'outbound', icon:'&#128228;', name:'Outbound Dialer',   desc:'Agents make calls — show contact details, capture call outcomes, schedule callbacks' },
  { id:'chat',     icon:'&#128172;', name:'Chat / Email',      desc:'Text-based interactions — channel info, copy-paste templates, embedded knowledge links' },
  { id:'blank',    icon:'&#128196;', name:'Custom / Blank',    desc:'Start from scratch — build exactly what you need with no pre-filled suggestions' }
];

var GEN_COMP_TYPES = [
  { id:'text',      icon:'&#128221;', name:'Text Label',   desc:'Display static text or live {{variable}} values from your script',         badge:'TXT', color:'#475569' },
  { id:'button',    icon:'&#9711;',   name:'Button',       desc:'Trigger actions — change page, set a variable, or run a custom action',     badge:'BTN', color:'var(--pr)' },
  { id:'speedDial', icon:'&#128222;', name:'Speed Dial',   desc:'One-click consult or blind transfer to a fixed phone number or SIP target', badge:'SD',  color:'#0891b2' },
  { id:'dropdown',  icon:'&#128203;', name:'Dropdown',     desc:'Agent-selectable option list — saves the chosen value to a variable',       badge:'DD',  color:'#7c3aed' },
  { id:'webpage',   icon:'&#127758;', name:'Web Page',     desc:'Embed a URL in the script (CRM record, knowledge base) — driven by a variable', badge:'WEB', color:'#059669' }
];

var GEN_TMPLS = [
  { name:'3 Speed Dials', desc:'Supervisor / Tier 2 / Billing', action: function(){ genApplyTemplate('3sd'); } },
  { name:'ANI + Name',    desc:'Show caller number and name',    action: function(){ genApplyTemplate('ani'); } },
  { name:'Disposition',   desc:'Post-call wrap-up dropdown',     action: function(){ genApplyTemplate('disp'); } },
  { name:'CRM Embed',     desc:'Auto-load CRM with ANI URL',     action: function(){ genApplyTemplate('crm'); } }
];

var GEN_SCN_SUGGESTIONS = {
  inbound:  ['speedDial','text','dropdown'],
  outbound: ['text','dropdown','button'],
  chat:     ['text','button','webpage'],
  blank:    []
};

// ── State ─────────────────────────────────────────────────────
var GEN = {
  scriptName: '',
  scriptDesc: '',
  selectedScn: null,
  selectedCompType: null,
  compConfig: {},
  pages: [],
  comps: [],
  vars: []
};

function genUUID(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
    var r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}

// ── Init (called when section shown) ─────────────────────────
function genInit(){
  if(GEN.pages.length===0){
    GEN.pages.push({id:genUUID(),name:'Start Page'});
  }
  document.getElementById('gen-name').value = GEN.scriptName;
  document.getElementById('gen-desc').value = GEN.scriptDesc;
  genRenderScenarios();
  genRenderTmpls();
  genRenderTypeGrid();
  genRenderCompList();
  genRenderPages();
  genRenderVars();
}

// ── Scenarios ─────────────────────────────────────────────────
function genRenderScenarios(){
  var g = document.getElementById('gen-scn-grid');
  if(!g) return;
  g.innerHTML = '';
  GEN_SCENARIOS.forEach(function(s){
    var c = document.createElement('button');
    c.className = 'scn' + (GEN.selectedScn===s.id?' sel':'');
    c.innerHTML = '<span class="si">'+s.icon+'</span><span class="sn">'+s.name+'</span><span class="sd">'+s.desc+'</span>';
    c.onclick = function(){ genSelectScn(s.id); };
    g.appendChild(c);
  });
}

function genSelectScn(id){
  GEN.selectedScn = id;
  genRenderScenarios();
  // Update type-sub with suggestion hint
  var subs = document.getElementById('gen-type-sub');
  var sugg = GEN_SCN_SUGGESTIONS[id]||[];
  if(sugg.length){
    var names = sugg.map(function(tid){
      var t=GEN_COMP_TYPES.find(function(x){return x.id===tid;});
      return t?t.name:'';
    }).filter(Boolean);
    if(subs) subs.textContent = '&#9733; Suggested for this scenario: '+names.join(', ')+' — or pick any type below';
  }
  genRenderTypeGrid();
}

// ── Templates ─────────────────────────────────────────────────
function genRenderTmpls(){
  var g = document.getElementById('gen-tmpl-grid');
  if(!g) return;
  g.innerHTML='';
  GEN_TMPLS.forEach(function(t){
    var b = document.createElement('button');
    b.className='tbn';
    b.innerHTML='<strong>'+t.name+'</strong><span>'+t.desc+'</span>';
    b.onclick = t.action;
    g.appendChild(b);
  });
}

function genApplyTemplate(id){
  if(GEN.pages.length===0) GEN.pages.push({id:genUUID(),name:'Start Page'});
  var pgId = GEN.pages[0].id;
  if(id==='3sd'){
    [{label:'Supervisor',target:'+15550001111'},{label:'Tier 2 Support',target:'+15550002222'},{label:'Billing',target:'+15550003333'}].forEach(function(sd){
      GEN.comps.push({id:genUUID(),type:'speedDial',pageId:pgId,label:sd.label,target:sd.target,transferType:'consult'});
    });
  } else if(id==='ani'){
    GEN.comps.push({id:genUUID(),type:'text',pageId:pgId,displayText:'ANI: {{ANI}}'});
    GEN.comps.push({id:genUUID(),type:'text',pageId:pgId,displayText:'Customer: {{customerName}}'});
    genEnsureVar('ANI','string',true,false);
    genEnsureVar('customerName','string',true,false);
  } else if(id==='disp'){
    GEN.comps.push({id:genUUID(),type:'dropdown',pageId:pgId,label:'Call Disposition',varName:'disposition',options:['Resolved','Callback Requested','Transferred','Voicemail Left','No Answer']});
    genEnsureVar('disposition','string',false,true);
  } else if(id==='crm'){
    GEN.comps.push({id:genUUID(),type:'webpage',pageId:pgId,urlVarName:'crmUrl',defaultUrl:'https://crm.example.com'});
    genEnsureVar('crmUrl','string',true,false);
  }
  genRenderCompList();
  genRenderVars();
  showToast('Template applied!');
}

function genEnsureVar(name,type,input,output){
  if(!GEN.vars.find(function(v){return v.name===name;})){
    GEN.vars.push({id:genUUID(),name:name,type:type,input:input,output:output});
  }
}

// ── Component Type Grid ───────────────────────────────────────
function genRenderTypeGrid(){
  var g = document.getElementById('gen-type-grid');
  if(!g) return;
  g.innerHTML='';
  var suggested = GEN_SCN_SUGGESTIONS[GEN.selectedScn]||[];
  GEN_COMP_TYPES.forEach(function(t){
    var isRec = suggested.indexOf(t.id)>=0;
    var isSel = GEN.selectedCompType===t.id;
    var c = document.createElement('button');
    c.className = 'tyc'+(isSel?' sel':'')+(isRec&&!isSel?' rec':'');
    c.innerHTML = '<span class="ti">'+t.icon+'</span><span class="tn">'+t.name+'</span><span class="td">'+t.desc+'</span>';
    c.onclick = function(){ genSelectCompType(t.id); };
    g.appendChild(c);
  });
}

function genSelectCompType(id){
  GEN.selectedCompType = id;
  GEN.compConfig = {};
  genRenderTypeGrid();
  var t = GEN_COMP_TYPES.find(function(x){return x.id===id;});
  var cfg = document.getElementById('gen-config-card');
  var title = document.getElementById('gen-config-title');
  var sub = document.getElementById('gen-config-sub');
  var fields = document.getElementById('gen-config-fields');
  if(!cfg) return;
  if(t){
    title.textContent = 'Configure ' + t.name;
    sub.textContent = 'Fill in the details, then click Add to Script';
  }
  cfg.style.display='';
  fields.innerHTML = genConfigFieldsHTML(id);
  cfg.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function genCancelConfig(){
  GEN.selectedCompType=null;
  GEN.compConfig={};
  genRenderTypeGrid();
  document.getElementById('gen-config-card').style.display='none';
}

function genConfigFieldsHTML(type){
  var pgOpts = GEN.pages.map(function(pg,i){
    return '<option value="'+pg.id+'">'+esc(pg.name)+'</option>';
  }).join('');
  var pgField = GEN.pages.length>1
    ? '<div class="fgroup"><label class="flabel">Place on page</label><select class="fsel" style="width:100%" id="gen-cfg-page">'+pgOpts+'</select></div>'
    : '';

  if(type==='text'){
    return '<div class="fgroup"><label class="flabel">Display Text</label>'
      +'<span class="fhint">&#9999;&#65039; Use <code>{{variableName}}</code> to show live values — e.g. <code>ANI: {{ANI}}</code> or <code>Customer: {{customerName}}</code>.</span>'
      +'<input class="finp" id="gen-cfg-text" placeholder="e.g. Customer: {{customerName}}" oninput="GEN.compConfig.displayText=this.value"></div>'
      +pgField;
  }
  if(type==='button'){
    return '<div class="fgroup"><label class="flabel">Button Label</label>'
      +'<input class="finp" id="gen-cfg-label" placeholder="e.g. Save &amp; Continue" oninput="GEN.compConfig.label=this.value"></div>'
      +'<div class="fgroup"><label class="flabel">Action</label>'
      +'<select class="fsel" style="width:100%" id="gen-cfg-action" onchange="GEN.compConfig.action=this.value;genRefreshPageAction()">'
      +'<option value="none">No action (display only)</option>'
      +'<option value="changePage">Change Page</option>'
      +'<option value="setVar">Set Variable Value</option>'
      +'</select></div>'
      +'<div id="gen-cfg-action-extra"></div>'
      +pgField;
  }
  if(type==='speedDial'){
    return '<div class="fgroup"><label class="flabel">Button Label</label>'
      +'<span class="fhint">&#9999;&#65039; Use a short descriptive name — e.g. <strong>Supervisor</strong> or <strong>Tier 2 Support</strong>.</span>'
      +'<input class="finp" id="gen-cfg-label" placeholder="e.g. Supervisor" oninput="GEN.compConfig.label=this.value"></div>'
      +'<div class="fgroup"><label class="flabel">Transfer Target</label>'
      +'<span class="fhint">&#9999;&#65039; Enter a phone number (<code>+15551234567</code>) or a SIP address (<code>sip:queue@example.com</code>). This is the number or endpoint the agent will transfer to.</span>'
      +'<input class="finp" id="gen-cfg-target" placeholder="e.g. +15551234567" oninput="GEN.compConfig.target=this.value"></div>'
      +'<div class="fgroup"><label class="flabel">Transfer Type</label>'
      +'<select class="fsel" style="width:100%" id="gen-cfg-xfertype" onchange="GEN.compConfig.transferType=this.value">'
      +'<option value="consult">Consult Transfer — agent stays on hold while connecting</option>'
      +'<option value="blind">Blind Transfer — call goes directly, agent drops off</option>'
      +'</select></div>'
      +pgField;
  }
  if(type==='dropdown'){
    return '<div class="fgroup"><label class="flabel">Dropdown Label / Caption</label>'
      +'<input class="finp" id="gen-cfg-label" placeholder="e.g. Call Disposition" oninput="GEN.compConfig.label=this.value"></div>'
      +'<div class="fgroup"><label class="flabel">Variable to store selection</label>'
      +'<span class="fhint">&#9999;&#65039; Name the script variable that will receive the agent&#8217;s choice. This variable can then be mapped to an Architect flow variable as an output.</span>'
      +'<input class="finp" id="gen-cfg-varname" placeholder="e.g. disposition" oninput="GEN.compConfig.varName=this.value"></div>'
      +'<div class="fgroup"><label class="flabel">Options</label>'
      +'<div class="gen-dd-opts" id="gen-cfg-opts">'
      +genDDOptsHTML(['Option 1','Option 2','Option 3'])
      +'</div>'
      +'<button class="gen-add-opt" onclick="genAddDDCfgOpt()">&#43; Add Option</button></div>'
      +pgField;
  }
  if(type==='webpage'){
    return '<div class="fgroup"><label class="flabel">URL Variable Name</label>'
      +'<span class="fhint">&#9999;&#65039; Name the script variable that holds the URL. Pass the built URL from your Architect flow as an input variable — e.g. <code>crmUrl</code> with value <code>https://crm.example.com/cases/{{ANI}}</code>.</span>'
      +'<input class="finp" id="gen-cfg-urlvar" placeholder="e.g. crmUrl" oninput="GEN.compConfig.urlVarName=this.value"></div>'
      +'<div class="fgroup"><label class="flabel">Default / Fallback URL <span style="font-size:11px;color:var(--t3);font-weight:400">(optional)</span></label>'
      +'<input class="finp" id="gen-cfg-defurl" placeholder="e.g. https://crm.example.com" oninput="GEN.compConfig.defaultUrl=this.value"></div>'
      +pgField;
  }
  return '';
}

function genRefreshPageAction(){
  var action = GEN.compConfig.action||'none';
  var extra = document.getElementById('gen-cfg-action-extra');
  if(!extra) return;
  if(action==='changePage'){
    var pgOpts = GEN.pages.map(function(pg){
      return '<option value="'+pg.id+'">'+esc(pg.name)+'</option>';
    }).join('');
    extra.innerHTML='<div class="fgroup"><label class="flabel">Target Page</label>'
      +'<select class="fsel" style="width:100%" id="gen-cfg-target-page" onchange="GEN.compConfig.targetPageId=this.value">'+pgOpts+'</select></div>';
  } else if(action==='setVar'){
    extra.innerHTML='<div class="fgroup"><label class="flabel">Variable to Set</label>'
      +'<input class="finp" id="gen-cfg-setvar-name" placeholder="e.g. callResult" oninput="GEN.compConfig.setVarName=this.value"></div>'
      +'<div class="fgroup"><label class="flabel">Value to Set</label>'
      +'<input class="finp" id="gen-cfg-setvar-val" placeholder="e.g. Completed" oninput="GEN.compConfig.setVarValue=this.value"></div>';
  } else {
    extra.innerHTML='';
  }
}

function genDDOptsHTML(opts){
  return (opts||[]).map(function(opt,i){
    return '<div class="gen-dd-opt-row">'
      +'<input class="finp" type="text" value="'+esc(opt)+'" placeholder="Option '+(i+1)+'"'
      +' oninput="GEN.compConfig.options['+i+']=this.value">'
      +'<button class="gen-dd-del-opt" onclick="genRemoveDDCfgOpt('+i+')">&#215;</button>'
      +'</div>';
  }).join('');
}

function genAddDDCfgOpt(){
  if(!GEN.compConfig.options) GEN.compConfig.options=['Option 1','Option 2','Option 3'];
  GEN.compConfig.options.push('');
  var el=document.getElementById('gen-cfg-opts');
  if(el) el.innerHTML=genDDOptsHTML(GEN.compConfig.options);
}

function genRemoveDDCfgOpt(i){
  if(!GEN.compConfig.options) return;
  GEN.compConfig.options.splice(i,1);
  var el=document.getElementById('gen-cfg-opts');
  if(el) el.innerHTML=genDDOptsHTML(GEN.compConfig.options);
}

function genReadConfigFromDOM(){
  // Sync DOM values into GEN.compConfig before adding
  var type = GEN.selectedCompType;
  var read = function(id){ var el=document.getElementById(id); return el?el.value.trim():''; };
  if(type==='text')    { GEN.compConfig.displayText = read('gen-cfg-text'); }
  if(type==='button')  { GEN.compConfig.label=read('gen-cfg-label'); GEN.compConfig.action=read('gen-cfg-action');
    if(GEN.compConfig.action==='changePage'){ var tp=document.getElementById('gen-cfg-target-page'); if(tp) GEN.compConfig.targetPageId=tp.value; }
    if(GEN.compConfig.action==='setVar'){ GEN.compConfig.setVarName=read('gen-cfg-setvar-name'); GEN.compConfig.setVarValue=read('gen-cfg-setvar-val'); }
  }
  if(type==='speedDial'){ GEN.compConfig.label=read('gen-cfg-label'); GEN.compConfig.target=read('gen-cfg-target');
    var xt=document.getElementById('gen-cfg-xfertype'); GEN.compConfig.transferType=xt?xt.value:'consult';
  }
  if(type==='dropdown'){ GEN.compConfig.label=read('gen-cfg-label'); GEN.compConfig.varName=read('gen-cfg-varname');
    if(!GEN.compConfig.options) GEN.compConfig.options=['Option 1','Option 2','Option 3'];
    var optEls=document.querySelectorAll('#gen-cfg-opts .finp');
    GEN.compConfig.options=Array.from(optEls).map(function(el){return el.value.trim();}).filter(Boolean);
  }
  if(type==='webpage'){ GEN.compConfig.urlVarName=read('gen-cfg-urlvar'); GEN.compConfig.defaultUrl=read('gen-cfg-defurl'); }
  // Page selector
  var pgSel=document.getElementById('gen-cfg-page');
  GEN.compConfig.pageId = pgSel ? pgSel.value : (GEN.pages[0]?GEN.pages[0].id:'');
}

function genAddComponent(){
  if(!GEN.selectedCompType){ showToast('Pick a component type first.'); return; }
  genReadConfigFromDOM();
  var type = GEN.selectedCompType;
  var cfg = GEN.compConfig;

  // Basic validation
  if(type==='text' && !(cfg.displayText||'').trim()){ showToast('Enter some display text.'); return; }
  if(type==='button' && !(cfg.label||'').trim()){ showToast('Enter a button label.'); return; }
  if(type==='speedDial' && !(cfg.target||'').trim()){ showToast('Enter a transfer target (phone number or SIP).'); return; }
  if(type==='dropdown' && !(cfg.varName||'').trim()){ showToast('Enter a variable name for the dropdown.'); return; }
  if(type==='webpage' && !(cfg.urlVarName||'').trim()){ showToast('Enter a URL variable name.'); return; }

  var comp = Object.assign({id:genUUID(), type:type}, cfg);
  if(!comp.pageId && GEN.pages.length) comp.pageId=GEN.pages[0].id;
  GEN.comps.push(comp);

  // Auto-add implied variables
  if(type==='dropdown' && cfg.varName) genEnsureVar(cfg.varName,'string',false,true);
  if(type==='webpage' && cfg.urlVarName) genEnsureVar(cfg.urlVarName,'string',true,false);
  if(type==='button' && cfg.action==='setVar' && cfg.setVarName) genEnsureVar(cfg.setVarName,'string',false,false);

  GEN.selectedCompType=null;
  GEN.compConfig={};
  genRenderTypeGrid();
  document.getElementById('gen-config-card').style.display='none';
  genRenderCompList();
  genRenderVars();
  showToast('Component added!');
}

// ── Component List ────────────────────────────────────────────
function genRenderCompList(){
  var wrap = document.getElementById('gen-comp-list-wrap');
  var list = document.getElementById('gen-comp-list');
  var badge = document.getElementById('gen-comp-count-badge');
  if(!list) return;
  if(GEN.comps.length===0){ if(wrap) wrap.style.display='none'; return; }
  if(wrap) wrap.style.display='';
  if(badge) badge.textContent=GEN.comps.length;
  list.innerHTML = GEN.comps.map(function(comp,ci){
    var t = GEN_COMP_TYPES.find(function(x){return x.id===comp.type;})||{badge:'?',color:'#888',name:'Component'};
    var pg = GEN.pages.find(function(p){return p.id===comp.pageId;})||{name:'Start Page'};
    var summary = genCompSummary(comp);
    return '<div class="gen-comp-item">'
      +'<div class="gen-comp-badge" style="background:'+t.color+'">'+t.badge+'</div>'
      +'<div class="gen-comp-body">'
      +'<div class="gen-comp-name">'+esc(t.name)+(summary?' &#8212; '+esc(summary):'')+'</div>'
      +'<div class="gen-comp-meta">Page: '+esc(pg.name)+'</div>'
      +'</div>'
      +'<button class="resetbtn gen-del-btn" onclick="genDelComp(\''+comp.id+'\')">&#215;</button>'
      +'</div>';
  }).join('');
}

function genCompSummary(comp){
  if(comp.type==='text') return (comp.displayText||'').substring(0,40)+(comp.displayText&&comp.displayText.length>40?'…':'');
  if(comp.type==='button') return comp.label||'';
  if(comp.type==='speedDial') return (comp.label||'Transfer')+' &#8594; '+(comp.target||'?')+' ('+(comp.transferType||'consult')+')';
  if(comp.type==='dropdown') return (comp.label||'Dropdown')+' &#8594; var: '+(comp.varName||'?');
  if(comp.type==='webpage') return 'URL via {{'+( comp.urlVarName||'?')+'}}';
  return '';
}

function genDelComp(id){
  GEN.comps = GEN.comps.filter(function(c){return c.id!==id;});
  genRenderCompList();
}

// ── Pages ─────────────────────────────────────────────────────
function genRenderPages(){
  var list = document.getElementById('gen-pages-list');
  if(!list) return;
  if(GEN.pages.length===0) GEN.pages.push({id:genUUID(),name:'Start Page'});
  list.innerHTML = GEN.pages.map(function(pg,i){
    var locked=(i===0);
    return '<div class="gen-list-row">'
      +'<div class="gen-list-badge gen-badge-pg">PG</div>'
      +(locked
        ? '<span style="flex:1;font-size:13px;font-weight:700;color:var(--tx)">'+esc(pg.name)+'</span>'
          +'<span class="gen-locked-tag">Start Page</span>'
        : '<input class="finp" value="'+esc(pg.name)+'" placeholder="Page name" onchange="GEN.pages['+i+'].name=this.value">'
          +'<button class="gen-del-inline" onclick="genDelPage(this.dataset.id)" data-id="'+pg.id+'" title="Remove">&#215;</button>'
      )
      +'</div>';
  }).join('');
}

function genAddPage(){
  GEN.pages.push({id:genUUID(),name:'Page '+(GEN.pages.length+1)});
  genRenderPages();
  // Re-render comp list (page names may have changed)
  genRenderCompList();
}

function genDelPage(id){
  if(GEN.pages.length<=1){ showToast('You need at least one page.'); return; }
  var first=GEN.pages[0];
  if(first.id===id) return; // can't delete start page
  // Reassign any comps on this page to start page
  GEN.comps.forEach(function(c){ if(c.pageId===id) c.pageId=GEN.pages[0].id; });
  GEN.pages = GEN.pages.filter(function(p){return p.id!==id;});
  genRenderPages();
  genRenderCompList();
}

// ── Variables ─────────────────────────────────────────────────
function genRenderVars(){
  var list = document.getElementById('gen-var-list');
  if(!list) return;
  if(GEN.vars.length===0){
    list.innerHTML='<span class="bdempty">No variables yet &#8212; they&#8217;ll appear here automatically when you add Dropdowns, Web Pages, or custom variables.</span>';
    return;
  }
  list.innerHTML = GEN.vars.map(function(v,vi){
    return '<div class="gen-list-row" style="flex-wrap:wrap;gap:7px">'
      +'<div class="gen-list-badge gen-badge-var">V</div>'
      +'<input class="finp" style="flex:1;min-width:120px" value="'+esc(v.name)+'" placeholder="variableName" onchange="GEN.vars['+vi+'].name=this.value">'
      +'<select class="fsel" onchange="GEN.vars['+vi+'].type=this.value">'
      +'<option value="string"'+(v.type==='string'?' selected':'')+'>String</option>'
      +'<option value="boolean"'+(v.type==='boolean'?' selected':'')+'>Boolean</option>'
      +'<option value="number"'+(v.type==='number'?' selected':'')+'>Number</option>'
      +'</select>'
      +'<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--t2);cursor:pointer;font-weight:600">'
      +'<input type="checkbox"'+(v.input?' checked':'')+' onchange="GEN.vars['+vi+'].input=this.checked"> Input</label>'
      +'<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--t2);cursor:pointer;font-weight:600">'
      +'<input type="checkbox"'+(v.output?' checked':'')+' onchange="GEN.vars['+vi+'].output=this.checked"> Output</label>'
      +'<button class="gen-del-inline" onclick="genDelVar(this.dataset.id)" data-id="'+v.id+'" title="Remove">&#215;</button>'
      +'</div>';
  }).join('');
}

function genAddVar(){
  GEN.vars.push({id:genUUID(),name:'',type:'string',input:false,output:false});
  genRenderVars();
}

function genDelVar(id){
  GEN.vars=GEN.vars.filter(function(v){return v.id!==id;});
  genRenderVars();
}

// ── Preview / Download ────────────────────────────────────────
function genPreview(){
  if(!GEN.scriptName.trim()){ showToast('Enter a script name first (Step 1).'); return; }
  var json = genBuildScriptJSON();
  var box = document.getElementById('gen-json-box');
  if(box){
    box.textContent = JSON.stringify(json,null,2);
    box.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  genBuildSummary(json);
}

function genDownload(){
  if(!GEN.scriptName.trim()){ showToast('Enter a script name first (Step 1).'); return; }
  var json = genBuildScriptJSON();
  var blob = new Blob([JSON.stringify(json,null,2)],{type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var safeName = GEN.scriptName.replace(/[^a-z0-9_\-. ]/gi,'_').replace(/\s+/g,'_');
  a.href=url; a.download=(safeName||'script')+'.script';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  genBuildSummary(json);
  showToast('Downloaded! Import via Admin \u2192 Scripts \u2192 Import.');
}

function genReset(){
  if(!confirm('Start over? All current generator data will be cleared.')) return;
  GEN={scriptName:'',scriptDesc:'',selectedScn:null,selectedCompType:null,compConfig:{},pages:[],comps:[],vars:[]};
  genInit();
  showToast('Generator cleared.');
}

// ── Summary Breakdown ─────────────────────────────────────────
function genBuildSummary(json){
  var el = document.getElementById('gen-bd-content');
  if(!el) return;
  json = json||genBuildScriptJSON();
  var totalComps=0; GEN.pages.forEach(function(pg){ totalComps+=GEN.comps.filter(function(c){return c.pageId===pg.id;}).length; });
  var rows = [
    ['Script Name', esc(GEN.scriptName)],
    ['Description', GEN.scriptDesc?esc(GEN.scriptDesc):'<em style="color:var(--t3)">None</em>'],
    ['Pages', GEN.pages.length+' ('+GEN.pages.map(function(p){return esc(p.name);}).join(', ')+')'],
    ['Components', totalComps+' total'],
    ['Variables', GEN.vars.length+' ('+GEN.vars.filter(function(v){return v.input;}).length+' input, '+GEN.vars.filter(function(v){return v.output;}).length+' output)'],
    ['Import via', 'Admin &rarr; Scripts &rarr; Import &rarr; Upload .script file']
  ];
  el.innerHTML='<table class="bdt"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>'
    +rows.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>';}).join('')
    +'</tbody></table>';
}

// ── JSON Builder ──────────────────────────────────────────────
function genBuildScriptJSON(){
  var now = new Date().toISOString();
  var scriptId = genUUID();
  var orgId = genUUID();
  var versionId = genUUID();

  var variables = GEN.vars.map(function(v){
    return {id:v.id,name:v.name,description:'',type:{isDynamic:false,name:v.type},value:'',input:v.input||false,output:v.output||false};
  });

  var pages = GEN.pages.map(function(pg){
    var children = GEN.comps.filter(function(c){return c.pageId===pg.id;}).map(function(comp){
      return genBuildCompNode(comp,variables);
    }).filter(Boolean);

    return {
      id:pg.id,name:pg.name,organizationId:orgId,scriptId:scriptId,versionId:versionId,
      properties:{onLoadAction:{typeName:'action',value:{}},backgroundColor:{typeName:'color',value:'#ffffff'}},
      dataVersion:3,
      rootContainer:{
        type:'verticalStackContainer',
        properties:{
          margin:{typeName:'spacing',value:[5,5,5,5]},
          alignment:{typeName:'alignment',value:'start'},
          width:{typeName:'sizing',value:{sizeType:'stretch',size:100}},
          height:{typeName:'sizing',value:{sizeType:'stretch',size:100}},
          visible:{typeName:'variable'},
          backgroundColor:{typeName:'text',value:''},
          padding:{typeName:'spacing',value:0},
          childArrangement:{typeName:'childArrangement',value:'start'},
          border:{typeName:'border',value:[
            {width:0,style:'solid',color:'000000'},{width:0,style:'solid',color:'000000'},
            {width:0,style:'solid',color:'000000'},{width:0,style:'solid',color:'000000'}
          ]}
        },
        children:children
      }
    };
  });

  return {
    id:scriptId,createdDate:now,modifiedDate:now,
    name:GEN.scriptName,description:GEN.scriptDesc||'',
    organizationId:orgId,versionId:versionId,
    startPageId:GEN.pages.length?GEN.pages[0].id:genUUID(),
    pages:pages,features:{voiceInteraction:true},
    variables:variables,customActions:[],dataVersion:3
  };
}

function genBuildCompNode(comp,variables){
  var baseProps = function(extra){
    return Object.assign({
      margin:{typeName:'spacing',value:[3,3,3,3]},
      alignment:{typeName:'alignment',value:'start'},
      width:{typeName:'sizing',value:{sizeType:'stretch',size:100}},
      height:{typeName:'sizing',value:{sizeType:'auto'}},
      visible:{typeName:'variable'}
    }, extra||{});
  };

  if(comp.type==='text'){
    return {type:'text',properties:baseProps({
      text:{typeName:'interpolatedText',value:comp.displayText||''},
      fontSize:{typeName:'number',value:14},
      fontColor:{typeName:'color',value:'#000000'},
      bold:{typeName:'boolean',value:false},italic:{typeName:'boolean',value:false}
    })};
  }

  if(comp.type==='button'||comp.type==='speedDial'){
    var action={};
    if(comp.type==='speedDial'){
      action={actionName:comp.transferType==='blind'?'scripter.blindTransfer':'scripter.consultTransfer',actionArgumentValues:[{typeName:'string',value:comp.target||''}]};
    } else if(comp.action==='changePage'){
      action={actionName:'scripter.changePage',actionArgumentValues:[{typeName:'page',value:comp.targetPageId||''}]};
    } else if(comp.action==='setVar'){
      var vlink=variables.find(function(v){return v.name===comp.setVarName;});
      if(vlink) action={actionName:'scripter.setVariable',actionArgumentValues:[{typeName:'variableWithValue',value:{variable:{typeName:'variable',value:vlink.id},variableTypeName:'string',valueOfVariableProperty:{typeName:'stringExpression',value:'"'+(comp.setVarValue||'')+'"'}}}]};
    }
    var bgColor = comp.type==='speedDial'?'#dbeafe':'#f1f5f9';
    var txColor = comp.type==='speedDial'?'#1d4ed8':'#1e293b';
    return {type:'button',properties:baseProps({
      text:{typeName:'interpolatedText',value:comp.label||'Button'},
      clickAction:{typeName:'action',value:action},
      backgroundColor:{typeName:'color',value:bgColor},
      textColor:{typeName:'color',value:txColor},
      disabled:{typeName:'variable'}
    })};
  }

  if(comp.type==='dropdown'){
    var linkedVar=variables.find(function(v){return v.name===comp.varName;});
    var options=(comp.options||[]).map(function(opt){return{label:opt,value:opt};});
    return {type:'comboBox',properties:baseProps({
      width:{typeName:'sizing',value:{sizeType:'stretch',size:100}},
      label:{typeName:'interpolatedText',value:comp.label||'Select'},
      options:{typeName:'comboBoxOptions',value:options},
      variable:linkedVar?{typeName:'variable',value:linkedVar.id}:{typeName:'variable'},
      disabled:{typeName:'variable'}
    })};
  }

  if(comp.type==='webpage'){
    var urlVar=variables.find(function(v){return v.name===comp.urlVarName;});
    var urlText=urlVar?'{{'+urlVar.id+'}}':(comp.defaultUrl||'https://example.com');
    return {type:'webPage',properties:baseProps({
      width:{typeName:'sizing',value:{sizeType:'stretch',size:100}},
      height:{typeName:'sizing',value:{sizeType:'pixels',size:400}},
      url:{typeName:'interpolatedText',value:urlText},
      disabled:{typeName:'variable'}
    })};
  }

  return null;
}

// ── Hook into showSection ─────────────────────────────────────
var _genOrigShow = showSection;
showSection = function(id){
  _genOrigShow(id);
  if(id==='generator') genInit();
};

// Register label
if(typeof NAV_LABELS!=='undefined') NAV_LABELS['generator']='Script Generator';
