# Haifa-is-calling


A self-introduction that starts as a phone call and turns into a text chat. Visitors tap questions and get your answers written out (in any language) with your own voice recordings.


https://github.com/user-attachments/assets/3e27a4a6-0a71-44c8-b2d8-a2fe417aa3a6



## Why I built it

My Chinese class asked for a self-introduction of at least five sentences. I'm a CS student, so instead of writing a paragraph I made the reader's phone ring. It works for any language or any "get to know me" project, so feel free to make it yours.

## Run it

`git clone https://github.com/hsalnasi/haifa-is-calling.git
cd haifa-is-calling
python3 -m http.server 8000`

`Open http://localhost:8000. No installs, no build step, just HTML, CSS and JavaScript.`

## Make it yours
Your words: edit `js/data.js`
Your voice: put one recording per answer in `audio/`, named after the answer's id (e.g. audio/name.mp3), plus audio/call.mp3 for the phone call. recorder.html can help you record.
Your photo: replace `images/avatar.jpg`




What's not in the repo


My voice recordings are ignored in .gitignore (everything inside audio/), so they stay private. Without recordings the page still works: voice messages just show "soon" until you add your own.

![Made by Haifa](https://img.shields.io/badge/Made%20by-Haifa-blue)
