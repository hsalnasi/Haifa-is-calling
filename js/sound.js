/* ==========================================================
   sound.js — all the sound effects, created live in the browser
   with the Web Audio API (no sound files needed).

   sfx.tick()    key click while a question is typed
   sfx.whoosh()  a question is sent
   sfx.ding()    a message from Haifa arrives
   ringtone.start() / ringtone.stop()   the incoming-call ringtone

   Note: browsers only allow sound after the visitor taps something,
   which is why the page starts on a "tap anywhere" lock screen.
   ========================================================== */

const sfx = {
  ctx: null,   // the browser's audio engine (created on first tap)
  on: true,    // the "Sounds" switch in settings

  // Start the audio engine. Must be called from inside a tap/click.
  init(){
    try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); this.ctx.resume(); }
    catch (e) {}
  },
  ready(){ return this.on && this.ctx && this.ctx.state === "running"; },

  // A short burst of random "hiss" — the raw material for clicks and whooshes
  noise(seconds){
    const c = this.ctx, buffer = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const source = c.createBufferSource(); source.buffer = buffer;
    return source;
  },

  // Keyboard click: a 30 ms hiss, filtered so it sounds like a tap
  tick(){
    if (!this.ready()) return;
    const c = this.ctx, t = c.currentTime;
    const hiss = this.noise(.03), filter = c.createBiquadFilter(), volume = c.createGain();
    filter.type = "bandpass"; filter.frequency.value = 2600 + Math.random() * 900; filter.Q.value = 1.4;
    volume.gain.setValueAtTime(.11, t);
    volume.gain.exponentialRampToValueAtTime(.001, t + .028);
    hiss.connect(filter).connect(volume).connect(c.destination);
    hiss.start(t);
  },

  // Send "whoosh": hiss whose pitch sweeps upward, fading in then out
  whoosh(){
    if (!this.ready()) return;
    const c = this.ctx, t = c.currentTime;
    const hiss = this.noise(.38), filter = c.createBiquadFilter(), volume = c.createGain();
    filter.type = "bandpass"; filter.Q.value = 2.2;
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(4200, t + .3);
    volume.gain.setValueAtTime(0, t);
    volume.gain.linearRampToValueAtTime(.32, t + .07);
    volume.gain.exponentialRampToValueAtTime(.001, t + .36);
    hiss.connect(filter).connect(volume).connect(c.destination);
    hiss.start(t);
  },

  // Message received: two quick bell-like notes going up (G6 → C7)
  ding(){
    if (!this.ready()) return;
    const c = this.ctx, t = c.currentTime;
    [[1567.98, 0], [2093, .075]].forEach(([freq, delay]) => {
      const tone = c.createOscillator(), shimmer = c.createOscillator();
      const volume = c.createGain(), shimmerVolume = c.createGain();
      tone.frequency.value = freq;
      shimmer.frequency.value = freq * 2.76;   // a quiet overtone makes it sound like a bell
      shimmerVolume.gain.value = .08;
      shimmer.connect(shimmerVolume).connect(volume);
      tone.connect(volume).connect(c.destination);
      volume.gain.setValueAtTime(0, t + delay);
      volume.gain.linearRampToValueAtTime(.13, t + delay + .004);
      volume.gain.exponentialRampToValueAtTime(.0008, t + delay + .32);
      tone.start(t + delay); shimmer.start(t + delay);
      tone.stop(t + delay + .35); shimmer.stop(t + delay + .35);
    });
  }
};

/* ---------- ringtone: an original marimba-style tune that loops ---------- */
const ringtone = {
  ctx: null,
  timer: null,

  // note frequencies in Hz
  NOTES: {E5:659.25, G5:783.99, A5:880, B5:987.77, D6:1174.66, E6:1318.51},
  // the melody: [note, seconds after the start of the phrase]
  MELODY: [["E5",0],["B5",.15],["A5",.30],["E6",.45],["D6",.75],["B5",.90],["G5",1.05],["A5",1.35]],

  // one marimba hit: a sine tone that starts sharply and dies away
  hit(time, freq){
    const c = this.ctx, tone = c.createOscillator(), overtone = c.createOscillator();
    const volume = c.createGain(), overtoneVolume = c.createGain();
    tone.frequency.value = freq;
    overtone.frequency.value = freq * 4;
    overtoneVolume.gain.value = .12;
    overtone.connect(overtoneVolume).connect(volume);
    tone.connect(volume).connect(c.destination);
    volume.gain.setValueAtTime(0, time);
    volume.gain.linearRampToValueAtTime(.28, time + .006);
    volume.gain.exponentialRampToValueAtTime(.0008, time + .55);
    tone.start(time); overtone.start(time);
    tone.stop(time + .6); overtone.stop(time + .6);
  },
  phrase(start){ this.MELODY.forEach(([n, dt]) => this.hit(start + dt, this.NOTES[n])); },

  // play the phrase twice, pause, repeat — like a phone ringing
  start(){
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.ctx.resume();
      const t = this.ctx.currentTime + .15;
      this.phrase(t); this.phrase(t + 2);
      let next = t + 4;
      this.timer = setInterval(() => {
        if (this.ctx.currentTime > next - 1){ this.phrase(next); this.phrase(next + 2); next += 4.6; }
      }, 250);
    } catch (e) {}
  },
  stop(){
    clearInterval(this.timer); this.timer = null;
    if (this.ctx){ this.ctx.close().catch(() => {}); this.ctx = null; }
  }
};
