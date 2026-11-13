/* ==========================================================
   call.js — what the visitor sees first:
     lock screen  →  incoming call from Haifa  →  in-call  →  Messages

   The flow is tracked with `callState`:
     "lock" → "ringing" → "live" (call answered) → "chat"
   ========================================================== */

const phoneEl = $("#phone");
const lockScreen = $("#lock");
const callScreen = $("#call");
let callState = "lock";
let callTimer = null;     // counts the 00:01, 00:02 … on screen
let callVoice = null;     // Haifa's recording during the call

// Real time and date on the status bar and lock screen
const shortTime = clockTime().replace(/\s?[AP]M$/i, "");
$("#sbTime").textContent = shortTime;
$("#lkTime").textContent = shortTime;
$("#lkDate").textContent = new Date().toLocaleDateString("en-US", {weekday:"long", month:"long", day:"numeric"});
phoneEl.classList.add("dark");   // white status bar text on dark screens

/* ---------- 1. tap the lock screen → the phone starts ringing ---------- */
lockScreen.addEventListener("click", () => {
  if (callState !== "lock") return;
  callState = "ringing";
  sfx.init();          // sound must be switched on inside a tap
  ringtone.start();
  lockScreen.classList.add("hide");
  callScreen.classList.remove("gone");
  requestAnimationFrame(() => callScreen.classList.remove("hide"));
  setTimeout(() => lockScreen.classList.add("gone"), 500);
});

/* ---------- 2. "slide to answer" ---------- */
const slider = $("#slider"), knob = $("#knob"), sliderText = slider.querySelector(".txt");
let dragging = false, startX = 0, knobX = 0;
const maxKnobX = () => slider.clientWidth - knob.clientWidth - 10;

knob.addEventListener("pointerdown", e => {
  if (callState !== "ringing") return;
  dragging = true;
  startX = e.clientX - knobX;
  knob.setPointerCapture(e.pointerId);
  knob.style.transition = "none";
});
knob.addEventListener("pointermove", e => {
  if (!dragging) return;
  knobX = Math.max(0, Math.min(maxKnobX(), e.clientX - startX));
  knob.style.transform = `translateX(${knobX}px)`;
  sliderText.style.opacity = 1 - knobX / maxKnobX();     // text fades as you slide
});
knob.addEventListener("pointerup", () => {
  if (!dragging) return;
  dragging = false;
  // answered if slid most of the way (or just tapped)
  if (knobX > maxKnobX() * .8 || knobX < 4){
    knob.style.transition = "transform .2s";
    knob.style.transform = `translateX(${maxKnobX()}px)`;
    answerCall();
  } else {
    // spring back
    knob.style.transition = "transform .3s cubic-bezier(.2,.9,.3,1.3)";
    knobX = 0; knob.style.transform = ""; sliderText.style.opacity = 1;
  }
});
knob.tabIndex = 0;
knob.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") answerCall(); });

/* ---------- 3. in the call: timer + Haifa's recording ---------- */
function answerCall(){
  if (callState !== "ringing") return;
  callState = "live";
  ringtone.stop();
  callScreen.classList.add("live");

  let seconds = 0;
  const label = $("#callLabel");
  label.textContent = "00:00";
  callTimer = setInterval(() => { seconds++; label.textContent = `00:${String(seconds).padStart(2, "0")}`; }, 1000);

  callVoice = new Audio("audio/call.mp3");
  callVoice.addEventListener("ended", () => setTimeout(hangUp, 700));   // hang up when she's done talking
  callVoice.play().catch(() => setTimeout(hangUp, 3000));
}

/* ---------- 4. hang up → open Messages ---------- */
function hangUp(){
  if (callState === "chat") return;
  const wasLive = callState === "live";
  callState = "chat";
  ringtone.stop();
  clearInterval(callTimer);
  if (callVoice) callVoice.pause();
  if (wasLive) $("#callLabel").textContent = "Call Ended";
  setTimeout(openMessages, wasLive ? 700 : 150);
}

function openMessages(){
  callScreen.classList.add("hide");
  phoneEl.classList.remove("dark");
  setTimeout(() => { callScreen.classList.add("gone"); greet(); }, 450);   // greet() is in chat.js
}

// The red button, "Message" and "Remind Me" all skip straight to the chat
$("#endBtn").addEventListener("click", hangUp);
$("#msgBtn").addEventListener("click", hangUp);
$("#remind").addEventListener("click", hangUp);
