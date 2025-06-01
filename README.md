### Goal

This repository is intended for online readers who want to backfill their understanding, dig deeper than static written artifacts allow, question claims and assumptions in a written piece, and explore more deeply than the limited word count of most reporting allows. It gives each online piece a dynamic and customized element. It allows the reader to ask questions that they might be embarrassed to put to their colleagues. And it saves them the hassle of copying and pasting into an LLM interface, so that they can return to the original text easily when their question is answered. 

### Setup

To set up locally, run:

npm init -y

npm install express cors openai dotenv markdown-js

You'll need an OpenAI API key saved as an env variable locally. 

Then from within the backend folder run:

node server.js

You will also need to "Load unpacked" this extension in Chrome Extensions: chrome://extensions/

If popups and notifications are blocked by your browser, you may need to allow them in order to see the LLM interface in a righthand sidebar. 

### Screenshot

<img width="1179" alt="Screenshot 2025-05-30 at 11 38 35 AM" src="https://github.com/user-attachments/assets/a92253d9-c40b-4f9b-9266-5a7f9cdd6e7e" />
