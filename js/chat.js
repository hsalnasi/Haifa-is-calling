/* ==========================================================
   chat.js — the iMessage conversation

   What happens when a visitor taps a question (see ask() below):
     1. the question types itself into the "iMessage" field
     2. it's sent as a blue bubble → "Delivered" → "Read"
     3. typing dots appear (longer for longer answers)
     4. Haifa's answer appears in Chinese with pinyin
     5. a voice-message bubble with Haifa's recording
     6. a small English translation underneath
   ========================================================== */

const thread = $("#thread");     // the scrolling message area
const sugg   = $("#sugg");       // the row of question buttons
const field  = $("#field");      // the "iMessage" input box
const ftext  = $("#ftext");      // the text inside it

let busy = false;                // true while an answer is in progress (buttons are disabled)
let playing = null;              // the voice message currently playing, if any
let lastSide = null;             // "in" (Haifa) or "out" (visitor): who sent the last bubble
let lastBubble = null;           // the last bubble element
let statusLine = null;           // the "Delivered" / "Read" label

/* ---------- drawing bubbles ---------- */

// Add one chat bubble. side = "in" (gray, Haifa) or "out" (blue, visitor).
// Like iMessage, only the LAST bubble in a run from the same person gets a tail.
function bubble(side, html, extraClass = ""){
  if (lastBubble && lastSide === side) lastBubble.classList.remove("tail");
  const el = document.createElement("div");
  el.className = `msg ${side} tail ${extraClass}` + (lastSide && lastSide !== side ? " gap" : "");
  el.innerHTML = html;
  thread.appendChild(el);

  if (side === "out") sfx.whoosh();
  else if (!/typing|voicebub/.test(extraClass)) sfx.ding();   // no chime for typing dots or voice bubbles

  lastSide = side; lastBubble = el;
  scrollToBottom();
  return el;
}

// Small gray text that isn't a bubble (status line, translation, tips)
function smallText(cls, html){
  const el = document.createElement("div");
  el.className = cls; el.innerHTML = html;
  thread.appendChild(el); scrollToBottom();
  return el;
}

const scrollToBottom = () => requestAnimationFrame(() => thread.scrollTop = thread.scrollHeight);

// Show Haifa's typing dots for a while, then remove them
async function haifaTypes(ms){
  const dots = bubble("in", "<span></span><span></span><span></span>", "typing");
  await sleep(ms);
  dots.remove();
  // put the tail back on whatever bubble is now last
  const prev = [...thread.querySelectorAll(".msg")].pop();
  lastBubble = prev || null;
  lastSide = prev ? (prev.classList.contains("in") ? "in" : "out") : null;
  if (lastBubble && lastSide === "in") lastBubble.classList.add("tail");
}

/* ---------- voice messages ---------- */

const PLAY_ICON  = '<svg viewBox="0 0 16 16"><path d="M4 2.2v11.6c0 .6.6.9 1.1.6l9.2-5.8c.4-.3.4-.9 0-1.2L5.1 1.6C4.6 1.3 4 1.6 4 2.2z" fill="currentColor"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.6" height="12" rx="1" fill="currentColor"/><rect x="9.4" y="2" width="3.6" height="12" rx="1" fill="currentColor"/></svg>';

// Waveform bars. The heights look random but are fixed per answer,
// so the same answer always shows the same waveform.
function waveformHTML(id){
  let seed = 7;
  for (const c of id) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  let html = "";
  for (let i = 0; i < 34; i++){
    seed = (seed * 1103515245 + 12345) >>> 0;
    html += `<i style="height:${4 + (seed % 20)}px"></i>`;
  }
  return html;
}

// The gray voice-message bubble with play button, waveform and duration.
// It always tries to load audio/<id>.mp3; if that file is missing, the bubble greys out and says "soon".
function voiceBubble(item){
  const el = bubble("in", `<div class="voice"><button class="vplay" aria-label="Play Haifa's voice message">${PLAY_ICON}</button><div class="wave">${waveformHTML(item.id)}</div><span class="dur">0:00</span></div>`, "voicebub");
  el.style.padding = "0";

  const button = el.querySelector(".vplay");
  const bars = [...el.querySelectorAll(".wave i")];
  const duration = el.querySelector(".dur");
  const audio = new Audio(`audio/${item.id}.mp3`);
  audio.addEventListener("error", () => {
    el.querySelector(".voice").classList.add("off");
    button.disabled = true;
    duration.textContent = "soon";
  });
  const format = s => `0:${String(Math.max(0, Math.round(s))).padStart(2, "0")}`;

  audio.addEventListener("loadedmetadata", () => duration.textContent = format(audio.duration));
  // while playing: colour in the bars and count down the time
  audio.addEventListener("timeupdate", () => {
    const progress = audio.currentTime / (audio.duration || 1);
    bars.forEach((bar, i) => bar.classList.toggle("on", i / bars.length < progress));
    duration.textContent = format((audio.duration || 0) - audio.currentTime);
  });
  const reset = () => {
    button.innerHTML = PLAY_ICON;
    bars.forEach(bar => bar.classList.remove("on"));
    if (isFinite(audio.duration)) duration.textContent = format(audio.duration);
  };
  audio.addEventListener("ended", reset);
  audio.addEventListener("stopped", reset);

  button.addEventListener("click", () => {
    if (!audio.paused){ audio.pause(); button.innerHTML = PLAY_ICON; return; }
    // only one voice message plays at a time
    if (playing && playing !== audio){ playing.pause(); playing.currentTime = 0; playing.dispatchEvent(new Event("stopped")); }
    playing = audio;
    audio.play().then(() => button.innerHTML = PAUSE_ICON).catch(() => {});
  });
}

/* ---------- the input field ---------- */

// Type the question letter by letter, with key clicks, at a human-ish pace
async function typeIntoField(text){
  ftext.classList.add("typed"); field.classList.add("has"); ftext.textContent = "";
  for (const ch of text){
    ftext.textContent += ch;
    if (ch !== " ") sfx.tick();
    await sleep(55 + Math.random() * 45);
  }
  await sleep(470);
}
function clearField(){
  ftext.classList.remove("typed"); field.classList.remove("has");
  ftext.textContent = "iMessage";
}

/* ---------- asking a question (the main flow) ---------- */

async function ask(item, button){
  if (busy) return;
  sfx.init();
  busy = true; setButtonsDisabled(true);

  // 1–2. type and send the question
  await typeIntoField(item.q);
  clearField();
  bubble("out", `${esc(item.q)}<span class="sub">${item.qzh}</span>`);
  if (statusLine) statusLine.remove();
  statusLine = smallText("meta", "Delivered");
  await sleep(600);
  statusLine.innerHTML = "<b>Read</b> " + clockTime();
  await sleep(900);

  // 3. typing dots — about 90 ms per character, between 1.6 and 5.2 seconds
  const charCount = item.a.flat().reduce((n, token) => n + token[0].length, 0);
  await haifaTypes(Math.min(5200, 1600 + charCount * 90));
  lastBubble = null; lastSide = "out";

  // 4–6. the answer, the voice message, the translation
  bubble("in", item.a.map(s => `<p class="sent" lang="zh-CN">${sentenceHTML(s)}</p>`).join(""));
  await sleep(350);
  voiceBubble(item);
  smallText("tr", `<i>English:</i> ${item.en.map(esc).join(" ")}`);

  button.classList.add("used");
  busy = false; setButtonsDisabled(false);
  if (item.id === "bye") startOutro();   // defined in outro.js
}

function setButtonsDisabled(disabled){
  sugg.querySelectorAll(".chip").forEach(b => b.disabled = disabled);
}

// One button per question in data.js
function createQuestionButtons(){
  DATA.forEach(item => {
    const b = document.createElement("button");
    b.className = "chip";
    b.innerHTML = `${esc(item.q)}<small>${item.qzh}</small>`;
    b.addEventListener("click", () => ask(item, b));
    sugg.appendChild(b);
  });
}

/* ---------- opening messages (called by call.js when the call ends) ---------- */

async function greet(){
  $("#now").textContent = clockTime();
  await sleep(900);
  await haifaTypes(2200); bubble("in", "Did you just hang up on me????... 🫢");
  await sleep(700);
  await haifaTypes(2600); bubble("in", "....");
  await sleep(500);
  await haifaTypes(1500); bubble("in", "jk :)");
  await sleep(900);
  await haifaTypes(4200); bubble("in", "I have been studying Chinese throughout the entire semester now, it's time to flex... at last.");
  await sleep(500);
  await haifaTypes(2300); bubble("in", "Tap a question and I shall answer 🤺");
  await sleep(400);
  smallText("tr", "Tip: tap my name at the top to turn pinyin or English on/off, or to read the full transcript.");
}

/* ---------- settings sheet (opens when tapping Haifa's name) ---------- */

function fillTranscript(){
  $("#transcript").innerHTML = DATA.map(d => d.a.map((s, i) => `
    <div class="tx">
      <div class="z">${plainChinese(s)}</div>
      <div class="p">${plainPinyin(s)}</div>
      <div class="e">${esc(d.en[i] || "")}</div>
    </div>`).join("")).join("");
}

$("#contact").addEventListener("click", () => { fillTranscript(); $("#phone").classList.add("open"); });
$("#done").addEventListener("click",  () => $("#phone").classList.remove("open"));
$("#scrim").addEventListener("click", () => $("#phone").classList.remove("open"));
$("#swPy").addEventListener("change",  e => document.body.classList.toggle("nopy", !e.target.checked));
$("#swEn").addEventListener("change",  e => document.body.classList.toggle("noen", !e.target.checked));
$("#swSfx").addEventListener("change", e => sfx.on = e.target.checked);

$("#copy").addEventListener("click", async e => {
  const text =
    "English:\n" + DATA.map(d => d.en.join(" ")).join(" ") +
    "\n\n中文:\n" + DATA.map(d => d.a.map(plainChinese).join("")).join("") +
    "\n\nPinyin:\n" + DATA.map(d => d.a.map(plainPinyin).join(" ")).join(" ");
  try { await navigator.clipboard.writeText(text); e.target.textContent = "Copied ✓"; }
  catch { e.target.textContent = "Copy not allowed here"; }
  setTimeout(() => e.target.textContent = "Copy Transcript", 1800);
});

/* ---------- start-up ---------- */

clearField();
createQuestionButtons();
