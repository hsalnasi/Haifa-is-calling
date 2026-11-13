/* ==========================================================
   utils.js — small helpers used by the other files
   ========================================================== */

// Shortcut for finding an element on the page: $("#thread") instead of document.querySelector("#thread")
const $ = selector => document.querySelector(selector);

// Wait a number of milliseconds. Used with "await" to pace animations: await sleep(1000)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Make text safe to insert as HTML (so a "<" in a message can't break the page)
const esc = text => text.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// Current time like "6:45 PM"
const clockTime = () => new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});

// Is this token a Chinese punctuation mark?
const isPunct = token => token.length === 1 && /[，。！？、：]/.test(token[0]);

/* ---------- turning a sentence from data.js into display text ---------- */

// Chinese characters with the pinyin sitting above each character.
// Example: [["学习","xué-xí"]] → 学 (xué) 习 (xí), each stacked in a little box
function sentenceHTML(tokens){
  return tokens.map(token => {
    if (token.length === 1) {
      return isPunct(token) ? `<span>${token[0]}</span>` : `<span class="latin">${esc(token[0])}</span>`;
    }
    const chars = [...token[0]];
    const syllables = token[1].split(/[ -]/);
    if (chars.length === syllables.length) {
      // one pinyin syllable per character; the word stays together on one line
      return `<span class="w">${chars.map((c, i) => `<ruby>${c}<rt>${syllables[i]}</rt></ruby>`).join("")}</span>`;
    }
    return `<ruby>${token[0]}<rt>${token[1]}</rt></ruby>`;
  }).join("");
}

// Plain Chinese text: 我在 Dar Al-Hekma 大学学习。
function plainChinese(tokens){
  return tokens.map(t => t[0]).join("")
    .replace(/([A-Za-z])([一-鿿])/g, "$1 $2")
    .replace(/([一-鿿])([A-Za-z])/g, "$1 $2");
}

// Plain pinyin text with capitals and punctuation: Wǒ zài Dar Al-Hekma dàxué xuéxí.
function plainPinyin(tokens){
  const punct = {"，":", ", "。":". ", "！":"! ", "？":"? ", "、":", ", "：":": "};
  let out = "", capitalize = true;
  for (const token of tokens){
    if (isPunct(token)) {
      out = out.trimEnd() + punct[token[0]];
      capitalize = /[。！？]/.test(token[0]);   // new sentence after . ! ?
      continue;
    }
    let word = token.length === 1 ? token[0] : token[1].replace(/-/g, "");
    if (capitalize) word = word[0].toUpperCase() + word.slice(1);
    out += word + " ";
    capitalize = false;
  }
  return out.trim();
}
