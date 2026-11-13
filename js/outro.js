/* ==========================================================
   outro.js — the dramatic goodbye after the "Thank you, goodbye!" question:
   Messages closes like an app → lock screen → screen fades to black on 再见
   ========================================================== */

let outroStarted = false;

async function startOutro(){
  if (outroStarted) return;
  outroStarted = true;

  await sleep(3500);
  // if the visitor is playing a voice message, wait for it to finish
  while (playing && !playing.paused && !playing.ended) await sleep(300);
  await sleep(600);

  const phone = $("#phone"), outro = $("#outro");
  phone.classList.remove("open");
  phone.classList.add("closing");            // 1. the app shrinks away
  await sleep(450);

  $("#oTime").textContent = $("#lkTime").textContent;
  $("#oDate").textContent = $("#lkDate").textContent;
  outro.classList.add("show");               // 2. lock screen with the clock
  phone.classList.add("dark");
  await sleep(1300);

  outro.classList.add("off");                // 3. fade to black, 再见 appears
  phone.classList.add("screenoff");
}

// "Replay" starts everything again from the lock screen
$("#replay").addEventListener("click", () => location.reload());
